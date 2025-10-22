import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Settings, Trash2, AlertTriangle } from "lucide-react";
import { authenticatedFetch } from "@/lib/api";

interface AgentConfig {
  system_prompt: string;
  prospecting_keywords: string;
}

const GeneralSettings = () => {
  const queryClient = useQueryClient();
  const [systemPrompt, setSystemPrompt] = useState("");
  const [keywords, setKeywords] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["agent-config"],
    queryFn: async (): Promise<AgentConfig> => {
      const response = await authenticatedFetch("/agent-config");
      return response.json();
    },
  });

  useEffect(() => {
    if (data) {
      setSystemPrompt(data.system_prompt || "");
      setKeywords(data.prospecting_keywords || "");
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await authenticatedFetch("/agent-config", {
        method: "POST",
        body: JSON.stringify({
          system_prompt: systemPrompt,
          prospecting_keywords: keywords,
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-config"] });
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Falha ao salvar: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const resetDatabaseMutation = useMutation({
    mutationFn: async () => {
      const response = await authenticatedFetch("/database/reset", {
        method: "DELETE",
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(); // Invalidate all queries
      toast({
        title: "✅ Banco de Dados Resetado",
        description: `${data.records_deleted?.total || 0} registros foram deletados com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao Resetar",
        description: `Falha: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="hover-lift animate-scale-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Configurações do Agente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="system-prompt">Prompt do Sistema do Agente</Label>
              <Textarea
                id="system-prompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="min-h-[200px] font-mono text-sm transition-all duration-300 focus:ring-2 focus:ring-primary"
                placeholder="Digite o prompt do sistema..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Palavras-chave de Prospecção</Label>
              <Input
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="transportadora, empresa de logística, ..."
                className="transition-all duration-300 focus:ring-2 focus:ring-primary"
              />
            </div>

            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="w-full transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              {saveMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </span>
              ) : (
                "Salvar Configurações"
              )}
            </Button>

            {/* Danger Zone - Reset Database */}
            <div className="pt-8 mt-8 border-t border-destructive/20">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">Zona de Perigo</h3>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong>Resetar Banco de Dados:</strong> Esta ação irá deletar TODOS os dados do sistema:
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Todas as conversas do chatbot</li>
                    <li>Todos os leads prospectados</li>
                    <li>Todas as solicitações de orçamento</li>
                    <li>Todos os agendamentos de serviço</li>
                  </ul>
                  <p className="text-destructive font-medium pt-2">
                    ⚠️ Esta ação é IRREVERSÍVEL e não pode ser desfeita!
                  </p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full transition-all duration-300 hover:shadow-lg"
                      disabled={resetDatabaseMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {resetDatabaseMutation.isPending ? "Resetando..." : "Resetar Banco de Dados"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Você tem certeza absoluta?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>
                          Esta ação irá <strong className="text-destructive">DELETAR PERMANENTEMENTE</strong> todos os dados do banco de dados:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Todas as conversas e mensagens</li>
                          <li>Todos os leads e prospects</li>
                          <li>Todos os orçamentos solicitados</li>
                          <li>Todos os agendamentos</li>
                        </ul>
                        <p className="text-destructive font-semibold pt-2">
                          ⚠️ ESTA AÇÃO NÃO PODE SER DESFEITA!
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Apenas prossiga se você realmente deseja resetar o sistema completamente.
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => resetDatabaseMutation.mutate()}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Sim, Deletar Tudo
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GeneralSettings;
