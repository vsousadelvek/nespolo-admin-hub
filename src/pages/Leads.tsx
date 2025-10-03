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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Users } from "lucide-react";

interface Lead {
  id: number;
  company_name: string;
  email: string;
  phone: string;
  source_url: string;
  captured_at: string;
}

const Leads = () => {
  const [searchTerm, setSearchTerm] = useState("");

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
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Lista de Leads
          </CardTitle>
          <Input
            placeholder="Buscar por nome da empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm transition-all duration-300 focus:ring-2 focus:ring-primary"
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-muted-foreground animate-pulse flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Carregando...
            </div>
          ) : (
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
                {sortedLeads?.map((lead, index) => (
                  <TableRow 
                    key={lead.id}
                    className="hover:bg-accent/50 transition-colors duration-200 animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Leads;
