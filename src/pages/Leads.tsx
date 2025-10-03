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
import { ExternalLink } from "lucide-react";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leads Qualificados</h1>
        <p className="text-muted-foreground mt-1">
          Visualize todos os leads capturados pelo sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Leads</CardTitle>
          <Input
            placeholder="Buscar por nome da empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-muted-foreground">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome da Empresa</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>URL de Origem</TableHead>
                  <TableHead>Data de Captura</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLeads?.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      {lead.company_name}
                    </TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.phone}</TableCell>
                    <TableCell>
                      <a
                        href={lead.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        Link <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>
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
