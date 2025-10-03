import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/StatusIndicator";
import { MetricCard } from "@/components/MetricCard";
import { toast } from "@/hooks/use-toast";
import { Activity, Users, Zap, Wrench } from "lucide-react";

interface HealthStatus {
  application: "healthy" | "unhealthy";
  database: "healthy" | "unhealthy";
  redis: "healthy" | "unhealthy";
}

const parseMetrics = (metricsText: string) => {
  const metrics: Record<string, number> = {};
  const lines = metricsText.split("\n");
  
  for (const line of lines) {
    if (line.startsWith("#") || !line.trim()) continue;
    
    const match = line.match(/^(\w+)\s+(\d+\.?\d*)$/);
    if (match) {
      metrics[match[1]] = parseFloat(match[2]);
    }
  }
  
  return metrics;
};

const Monitoring = () => {
  const [isRunning, setIsRunning] = useState(false);

  // Health check query - polls every 15 seconds
  const { data: healthData } = useQuery({
    queryKey: ["health"],
    queryFn: async (): Promise<HealthStatus> => {
      const response = await fetch("/healthz");
      return response.json();
    },
    refetchInterval: 15000,
  });

  // Metrics query - polls every 30 seconds
  const { data: metricsText } = useQuery({
    queryKey: ["metrics"],
    queryFn: async () => {
      const response = await fetch("/metrics");
      return response.text();
    },
    refetchInterval: 30000,
  });

  const metrics = metricsText ? parseMetrics(metricsText) : {};

  const handleRunProspecting = async () => {
    setIsRunning(true);
    try {
      const response = await fetch("/run-prospecting");
      const data = await response.json();
      
      toast({
        title: "Tarefa Iniciada",
        description: `Task ID: ${data.task_id}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao iniciar prospecção",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Monitoramento</h1>
        <p className="text-muted-foreground mt-1">
          Status dos serviços e métricas em tempo real
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status dos Serviços</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthData ? (
              <>
                <StatusIndicator status={healthData.application} label="Aplicação" />
                <StatusIndicator status={healthData.database} label="Banco de Dados" />
                <StatusIndicator status={healthData.redis} label="Redis (Broker)" />
              </>
            ) : (
              <div className="text-muted-foreground">Carregando...</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Controle do Pipeline de Prospecção</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleRunProspecting}
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? "Executando..." : "Executar Prospecção Agora"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Métricas da Aplicação</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total de Mensagens Recebidas"
            value={metrics.whatsapp_messages_received_total || 0}
            icon={<Activity className="h-4 w-4" />}
          />
          <MetricCard
            title="Tarefas de Prospecção Disparadas"
            value={metrics.prospecting_tasks_dispatched_total || 0}
            icon={<Zap className="h-4 w-4" />}
          />
          <MetricCard
            title="Total de Leads Salvos"
            value={metrics.prospecting_leads_saved_total || 0}
            icon={<Users className="h-4 w-4" />}
          />
          <MetricCard
            title="Acionamentos de Ferramentas"
            value={metrics.agent_tool_calls_total || 0}
            icon={<Wrench className="h-4 w-4" />}
          />
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
