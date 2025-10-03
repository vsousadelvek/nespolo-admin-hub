import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { ExternalLink, Users, Download, FileDown } from "lucide-react";
import { SkeletonTable } from "@/components/SkeletonCard";
import { EmptyState } from "@/components/EmptyState";
import { LeadDetailsDialog } from "@/components/LeadDetailsDialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Lead {
  id: number;
  company_name: string;
  email: string;
  phone: string;
  source_url: string;
  captured_at: string;
}

const ITEMS_PER_PAGE = 10;

const Leads = () => {
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

  const filteredLeads = leads?.filter((lead) =>
    lead.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedLeads = filteredLeads?.sort(
    (a, b) =>
      new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime()
  );

  // Pagination
  const totalPages = Math.ceil((sortedLeads?.length || 0) / ITEMS_PER_PAGE);
  const paginatedLeads = sortedLeads?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Export to CSV
  const handleExportCSV = () => {
    if (!leads || leads.length === 0) return;

    const headers = ["ID", "Empresa", "Email", "Telefone", "URL", "Data"];
    const rows = leads.map((lead) => [
      lead.id,
      lead.company_name,
      lead.email,
      lead.phone,
      lead.source_url,
      new Date(lead.captured_at).toLocaleString("pt-BR"),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-slide-in-left">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Leads Qualificados
        </h1>
        <p className="text-muted-foreground mt-1">
          Visualize todos os leads capturados pelo sistema
        </p>
      </div>

      <Card className="hover-lift animate-scale-in">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Lista de Leads
              <span className="text-sm font-normal text-muted-foreground">
                ({sortedLeads?.length || 0} total)
              </span>
            </CardTitle>
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
          <Input
            placeholder="Buscar por nome da empresa..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-sm transition-all duration-300 focus:ring-2 focus:ring-primary"
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SkeletonTable />
          ) : !sortedLeads || sortedLeads.length === 0 ? (
            <EmptyState
              icon={FileDown}
              title="Nenhum lead encontrado"
              description={
                searchTerm
                  ? "Tente ajustar sua busca"
                  : "Os leads capturados aparecerão aqui"
              }
            />
          ) : (
            <>
              <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Nome da Empresa</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>URL de Origem</TableHead>
                  <TableHead>Data de Captura</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLeads?.map((lead, index) => (
                  <TableRow 
                    key={lead.id}
                    className="hover:bg-accent/50 transition-colors duration-200 animate-fade-in cursor-pointer"
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => handleLeadClick(lead)}
                  >
                    <TableCell className="font-medium">
                      {lead.company_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{lead.email}</TableCell>
                    <TableCell className="text-muted-foreground">{lead.phone}</TableCell>
                    <TableCell>
                      <a
                        href={lead.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline transition-all duration-200 hover:gap-2"
                      >
                        Link <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(lead.captured_at).toLocaleString("pt-BR")}
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
                      <PaginationPrevious
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => setCurrentPage(i + 1)}
                          isActive={currentPage === i + 1}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
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
