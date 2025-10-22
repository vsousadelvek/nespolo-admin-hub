import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Link } from "lucide-react";
import { authenticatedFetch } from "@/lib/api";

interface ZapiConfig {
  zapi_instance_id: string;
  zapi_token: string;
  zapi_client_token: string;
  message_interval_seconds?: number;
  typing_delay_seconds?: number;
  enable_typing_indicator?: boolean;
  debounce_seconds?: number;
}

const IntegrationsSettings = () => {
  const queryClient = useQueryClient();
  const [instanceId, setInstanceId] = useState("");
  const [token, setToken] = useState("");
  const [clientToken, setClientToken] = useState("");
  const [messageInterval, setMessageInterval] = useState(1.5);
  const [typingDelay, setTypingDelay] = useState(2.0);
  const [enableTyping, setEnableTyping] = useState(true);
  const [debounceSeconds, setDebounceSeconds] = useState(20);

  const { data, isLoading } = useQuery({
    queryKey: ["zapi-config"],
    queryFn: async (): Promise<ZapiConfig> => {
      const response = await authenticatedFetch("/config/zapi");
      return response.json();
    },
  });

  useEffect(() => {
    if (data) {
      setInstanceId(data.zapi_instance_id || "");
      setToken(data.zapi_token || "");
      setClientToken(data.zapi_client_token || "");
      setMessageInterval(data.message_interval_seconds ?? 1.5);
      setTypingDelay(data.typing_delay_seconds ?? 2.0);
      setEnableTyping(data.enable_typing_indicator ?? true);
      setDebounceSeconds(data.debounce_seconds ?? 20);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (newConfig: ZapiConfig) => {
      const response = await authenticatedFetch("/config/zapi", {
        method: "POST",
        body: JSON.stringify(newConfig),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zapi-config"] });
      toast({
        title: "Sucesso",
        description: "Configurações da Z-API salvas com sucesso!",
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

  const handleSubmit = () => {
    saveMutation.mutate({
      zapi_instance_id: instanceId,
      zapi_token: token,
      zapi_client_token: clientToken,
      message_interval_seconds: messageInterval,
      typing_delay_seconds: typingDelay,
      enable_typing_indicator: enableTyping,
      debounce_seconds: debounceSeconds,
    });
  };

  return (
    <Card className="hover-lift animate-scale-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5 text-primary" />
          Configuração Z-API
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div className="space-y-2" key={i}>
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="instance-id">Instance ID</Label>
              <Input
                id="instance-id"
                value={instanceId}
                onChange={(e) => setInstanceId(e.target.value)}
                placeholder="Seu Instance ID da Z-API"
                className="transition-all duration-300 focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="token">Token</Label>
              <Input
                id="token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Seu Token da Z-API"
                className="transition-all duration-300 focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-token">Client Token</Label>
              <Input
                id="client-token"
                type="password"
                value={clientToken}
                onChange={(e) => setClientToken(e.target.value)}
                placeholder="Seu Client Token (se aplicável)"
                className="transition-all duration-300 focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-4">Configurações de Mensagens</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message-interval">Intervalo entre mensagens (segundos)</Label>
                  <Input
                    id="message-interval"
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="10"
                    value={messageInterval}
                    onChange={(e) => setMessageInterval(parseFloat(e.target.value))}
                    className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tempo de espera entre envio de múltiplas mensagens
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="typing-delay">Delay do indicador "digitando..." (segundos)</Label>
                  <Input
                    id="typing-delay"
                    type="number"
                    step="0.5"
                    min="0"
                    max="15"
                    value={typingDelay}
                    onChange={(e) => setTypingDelay(parseFloat(e.target.value))}
                    className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Duração do indicador "digitando..." antes de enviar (1-15 segundos)
                  </p>
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="enable-typing">Habilitar indicador "digitando..."</Label>
                    <p className="text-xs text-muted-foreground">
                      Mostra que o bot está digitando antes de enviar
                    </p>
                  </div>
                  <Switch
                    id="enable-typing"
                    checked={enableTyping}
                    onCheckedChange={setEnableTyping}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="debounce">Debounce (segundos)</Label>
                  <Input
                    id="debounce"
                    type="number"
                    min="5"
                    max="60"
                    value={debounceSeconds}
                    onChange={(e) => setDebounceSeconds(parseInt(e.target.value))}
                    className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tempo de espera para agrupar mensagens rápidas (economiza até 80% em custos de IA)
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={saveMutation.isPending}
              className="w-full transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              {saveMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </span>
              ) : (
                "Salvar Configurações da Z-API"
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default IntegrationsSettings;
