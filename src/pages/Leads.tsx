import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Users, Download, FileDown, Bot, Send, Coins, MessageSquare, AlertTriangle } from "lucide-react";
import { SkeletonTable } from "@/components/SkeletonCard";
import { EmptyState } from "@/components/EmptyState";
import { LeadDetailsDialog } from "@/components/LeadDetailsDialog";
import { authenticatedFetch } from "@/lib/api";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Lead {
  id: string;
  company_name: string;
  contact_email: string;
  contact_phone: string;
  source_url: string;
  created_at: string;
  status: "new" | "contacted" | "replied" | "qualified" | "unqualified";
}

interface DailyLimitsStatus {
  leads: {
    current: number;
    limit: number;
    remaining: number;
    percentage: number;
    resets_in_seconds?: number;
  };
  messages: {
    current: number;
    limit: number;
    remaining: number;
    percentage: number;
    resets_in_seconds?: number;
  };
  redis_available: boolean;
}

const ITEMS_PER_PAGE = 10;

const Leads = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: leads, isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async (): Promise<Lead[]> => {
      const response = await fetch("/leads");
      return response.json();
    },
  });

  // Daily limits query - polls every 30 seconds
  const { data: dailyLimits, refetch: refetchLimits } = useQuery({
    queryKey: ["daily-limits"],
    queryFn: async (): Promise<{ status: string; data: DailyLimitsStatus }> => {
      const response = await fetch("/daily-limits");
      return response.json();
    },
    refetchInterval: 30000,
  });

  const contactMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const response = await authenticatedFetch(`/leads/${leadId}/contact`, { method: "POST" });
      return response.json();
    },
    onSuccess: (data, leadId) => {
      toast({ title: "Sucesso", description: `Tarefa para contatar lead ${leadId} enfileirada.` });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error, leadId) => {
      toast({ title: "Erro", description: `Não foi possível contatar o lead ${leadId}: ${error.message}`, variant: "destructive" });
    },
  });

  const contactAllMutation = useMutation({
    mutationFn: async () => {
      const response = await authenticatedFetch("/leads/contact-all-new", { method: "POST" });
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "Sucesso", description: data.message });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error) => {
      toast({ title: "Erro", description: `Não foi possível contatar os leads: ${error.message}`, variant: "destructive" });
    },
  });

  const filteredLeads = leads?.filter((lead) =>
    lead.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedLeads = filteredLeads?.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const newLeadsCount = sortedLeads?.filter(lead => lead.status === 'new').length || 0;

  // Pagination
  const totalPages = Math.ceil((sortedLeads?.length || 0) / ITEMS_PER_PAGE);
  const paginatedLeads = sortedLeads?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getPaginationItems = () => {
    const items: (number | string)[] = [];
    const siblingCount = 1;
    const totalVisiblePages = 5;

    if (totalPages <= totalVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      if (currentPage > siblingCount + 2) items.push('...');
      const startPage = Math.max(2, currentPage - siblingCount);
      const endPage = Math.min(totalPages - 1, currentPage + siblingCount);
      for (let i = startPage; i <= endPage; i++) items.push(i);
      if (currentPage < totalPages - (siblingCount + 1)) items.push('...');
      items.push(totalPages);
    }
    return [...new Set(items)];
  };

  const paginationItems = totalPages > 1 ? getPaginationItems() : [];

  const handleExportCSV = () => {
    if (!leads || leads.length === 0) return;
    const headers = ["ID", "Empresa", "Email", "Telefone", "Status", "URL", "Data"];
    const rows = leads.map((lead) => [
      lead.id,
      lead.company_name,
      lead.contact_email,
      lead.contact_phone,
      lead.status,
      lead.source_url,
      new Date(lead.created_at).toLocaleString("pt-BR"),
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setDialogOpen(true);
  };

  const getStatusVariant = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'secondary';
      case 'contacted': return 'default';
      case 'replied': return 'success';
      case 'qualified': return 'success';
      case 'unqualified': return 'destructive';
      default: return 'outline';
    }
  };

  // Helper function to format time remaining
  const formatTimeRemaining = (seconds?: number) => {
    if (!seconds) return "N/A";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Check if credits are low
  const leadsLow = (dailyLimits?.data.leads.remaining || 0) < 20;
  const messagesLow = (dailyLimits?.data.messages.remaining || 0) < 30;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-slide-in-left">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Leads Qualificados
        </h1>
        <p className="text-muted-foreground mt-1">
          Visualize e gerencie os leads capturados pelo sistema
        </p>
      </div>

      {/* Credits Cards */}
      <div className="grid gap-4 md:grid-cols-2 animate-scale-in">
        <Card className={`hover-lift transition-all ${leadsLow ? 'border-amber-500 bg-amber-50/5' : ''}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Coins className={`h-5 w-5 ${leadsLow ? 'text-amber-500' : 'text-primary'}`} />
              Créditos de Prospecção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${leadsLow ? 'text-amber-500' : 'text-primary'}`}>
                {dailyLimits?.data.leads.remaining || 0}
              </span>
              <span className="text-2xl text-muted-foreground">/ {dailyLimits?.data.leads.limit || 100}</span>
            </div>
            <Progress
              value={100 - (dailyLimits?.data.leads.percentage || 0)}
              className="h-3"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{dailyLimits?.data.leads.current || 0} usados hoje</span>
              <span>Reseta em {formatTimeRemaining(dailyLimits?.data.leads.resets_in_seconds)}</span>
            </div>
            {leadsLow && (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-100/50 p-2 rounded">
                <AlertTriangle className="h-4 w-4" />
                Créditos baixos! Use com moderação.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={`hover-lift transition-all ${messagesLow ? 'border-amber-500 bg-amber-50/5' : ''}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className={`h-5 w-5 ${messagesLow ? 'text-amber-500' : 'text-primary'}`} />
              Créditos de Mensagens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${messagesLow ? 'text-amber-500' : 'text-primary'}`}>
                {dailyLimits?.data.messages.remaining || 0}
              </span>
              <span className="text-2xl text-muted-foreground">/ {dailyLimits?.data.messages.limit || 150}</span>
            </div>
            <Progress
              value={100 - (dailyLimits?.data.messages.percentage || 0)}
              className="h-3"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{dailyLimits?.data.messages.current || 0} enviadas hoje</span>
              <span>Reseta em {formatTimeRemaining(dailyLimits?.data.messages.resets_in_seconds)}</span>
            </div>
            {messagesLow && (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-100/50 p-2 rounded">
                <AlertTriangle className="h-4 w-4" />
                Créditos baixos! Use com moderação.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="hover-lift animate-scale-in">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Lista de Leads
              <span className="text-sm font-normal text-muted-foreground">
                ({sortedLeads?.length || 0} total)
              </span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => contactAllMutation.mutate()}
                disabled={contactAllMutation.isPending || newLeadsCount === 0}
                className="hover-lift"
              >
                <Send className="h-4 w-4 mr-2" />
                {contactAllMutation.isPending ? "Enfileirando..." : `Contatar ${newLeadsCount} Novos`}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={!leads || leads.length === 0}
                className="hover-lift"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
          <Input
            placeholder="Buscar por nome da empresa..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="max-w-sm transition-all duration-300 focus:ring-2 focus:ring-primary"
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SkeletonTable />
          ) : !sortedLeads || sortedLeads.length === 0 ? (
            <EmptyState icon={FileDown} title="Nenhum lead encontrado" description={searchTerm ? "Tente ajustar sua busca" : "Os leads capturados aparecerão aqui"} />
          ) : (
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Empresa</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[150px]">Telefone</TableHead>
                    <TableHead className="w-[120px] text-center">Ações</TableHead>
                    <TableHead className="w-[180px] text-right">Data de Captura</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLeads?.map((lead, index) => (
                    <TableRow
                      key={lead.id}
                      className="hover:bg-accent/50 transition-colors duration-200 animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <TableCell className="font-medium py-2 px-4 whitespace-nowrap cursor-pointer" onClick={() => handleLeadClick(lead)}>
                        {lead.company_name}
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <Badge variant={getStatusVariant(lead.status)} className="capitalize">{lead.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground py-2 px-4">{lead.contact_phone}</TableCell>
                      <TableCell className="py-2 px-4 text-center">
                        {lead.status === 'new' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); contactMutation.mutate(lead.id); }}
                            disabled={contactMutation.isPending && contactMutation.variables === lead.id}
                            className="hover-lift"
                          >
                            <Bot className="h-4 w-4 mr-2" />
                            Contatar
                          </Button>
                        ) : (
                          <a
                            href={lead.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1 text-primary hover:underline transition-all duration-200 hover:gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Link <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground py-2 px-4 text-right whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                      </PaginationItem>
                      {paginationItems.map((item, index) => (
                        <PaginationItem key={`${item}-${index}`}>
                          {typeof item === 'string' ? <span className="px-4 py-2">...</span> : <PaginationLink onClick={() => setCurrentPage(item)} isActive={currentPage === item} className="cursor-pointer">{item}</PaginationLink>}
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <LeadDetailsDialog
        lead={selectedLead}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

export default Leads;
