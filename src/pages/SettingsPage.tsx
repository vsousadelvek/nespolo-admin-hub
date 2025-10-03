import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface AgentConfig {
  system_prompt: string;
  prospecting_keywords: string;
}

const SettingsPage = () => {
  const queryClient = useQueryClient();
  const [systemPrompt, setSystemPrompt] = useState("");
  const [keywords, setKeywords] = useState("");

  const { isLoading } = useQuery({
    queryKey: ["agent-config"],
    queryFn: async (): Promise<AgentConfig> => {
      const response = await fetch("/agent-config");
      const data = await response.json();
      setSystemPrompt(data.system_prompt);
      setKeywords(data.prospecting_keywords);
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/agent-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Ajuste o comportamento do agente de IA
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações do Agente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="text-muted-foreground">Carregando...</div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="system-prompt">Prompt do Sistema do Agente</Label>
                <Textarea
                  id="system-prompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
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
                />
              </div>

              <Button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="w-full"
              >
                {saveMutation.isPending ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
