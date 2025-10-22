import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/StatusIndicator";
import { MetricChartCard } from "@/components/MetricChartCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { toast } from "@/hooks/use-toast";
import { Activity, Users, Zap, Wrench, RefreshCw, AlertCircle, MessageSquare } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HealthStatus {
  application: "healthy" | "unhealthy";
  database: "healthy" | "unhealthy";
  redis: "healthy" | "unhealthy";
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
  const [period, setPeriod] = useState("24h");

  // Mock data generator for charts
  const generateChartData = (baseValue: number) => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: Math.floor(baseValue * (0.8 + Math.random() * 0.4)),
    }));
  };

  // Health check query - polls every 15 seconds
  const { data: healthData, refetch: refetchHealth } = useQuery({
    queryKey: ["health"],
    queryFn: async (): Promise<HealthStatus> => {
      const response = await fetch("/healthz");
      return response.json();
    },
    refetchInterval: 15000,
  });

  // Metrics query - polls every 30 seconds
  const { data: metricsText, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ["metrics"],
    queryFn: async () => {
      const response = await fetch("/metrics");
      return response.text();
    },
    refetchInterval: 30000,
  });

  // Daily limits query - polls every 30 seconds
  const { data: dailyLimits, isLoading: limitsLoading, refetch: refetchLimits } = useQuery({
    queryKey: ["daily-limits"],
    queryFn: async (): Promise<{ status: string; data: DailyLimitsStatus }> => {
      const response = await fetch("/daily-limits");
      return response.json();
    },
    refetchInterval: 30000,
  });

  const handleRefresh = () => {
    refetchHealth();
    refetchMetrics();
    refetchLimits();
    toast({
      title: "Atualizado",
      description: "Dados recarregados com sucesso",
    });
  };

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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-slide-in-left">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Monitoramento
          </h1>
          <p className="text-muted-foreground mt-1">
            Status dos serviços e métricas em tempo real
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Últimas 24h</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            className="hover-lift"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover-lift animate-scale-in transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Status dos Serviços
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthData ? (
              <>
                <StatusIndicator status={healthData.application} label="Aplicação" />
                <StatusIndicator status={healthData.database} label="Banco de Dados" />
                <StatusIndicator status={healthData.redis} label="Redis (Broker)" />
              </>
            ) : (
              <div className="text-muted-foreground animate-pulse">Carregando...</div>
            )}
          </CardContent>
        </Card>

        <Card className="hover-lift animate-scale-in transition-all duration-300" style={{ animationDelay: "0.1s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Controle do Pipeline de Prospecção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleRunProspecting}
              disabled={isRunning}
              className="w-full transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              {isRunning ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Executando...
                </span>
              ) : (
                "Executar Prospecção Agora"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-scale-in transition-all duration-300" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Créditos Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {limitsLoading ? (
              <div className="text-muted-foreground animate-pulse">Carregando...</div>
            ) : dailyLimits?.data ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Leads
                    </span>
                    <span className={`text-2xl font-bold ${dailyLimits.data.leads.remaining < 20 ? 'text-amber-500' : 'text-primary'}`}>
                      {dailyLimits.data.leads.remaining}
                    </span>
                  </div>
                  <Progress
                    value={100 - dailyLimits.data.leads.percentage}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {dailyLimits.data.leads.current} usados de {dailyLimits.data.leads.limit}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Mensagens
                    </span>
                    <span className={`text-2xl font-bold ${dailyLimits.data.messages.remaining < 30 ? 'text-amber-500' : 'text-primary'}`}>
                      {dailyLimits.data.messages.remaining}
                    </span>
                  </div>
                  <Progress
                    value={100 - dailyLimits.data.messages.percentage}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {dailyLimits.data.messages.current} usadas de {dailyLimits.data.messages.limit}
                  </p>
                </div>

                {!dailyLimits.data.redis_available && (
                  <div className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Redis indisponível
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Dados não disponíveis</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <h2 className="text-xl font-semibold mb-4">Métricas da Aplicação</h2>
        {metricsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricChartCard
              title="Total de Mensagens Recebidas"
              value={metrics.whatsapp_messages_received_total || 0}
              icon={<Activity className="h-4 w-4" />}
              data={generateChartData(metrics.whatsapp_messages_received_total || 0)}
              trend={12}
            />
            <MetricChartCard
              title="Tarefas de Prospecção Disparadas"
              value={metrics.prospecting_tasks_dispatched_total || 0}
              icon={<Zap className="h-4 w-4" />}
              data={generateChartData(metrics.prospecting_tasks_dispatched_total || 0)}
              trend={8}
            />
            <MetricChartCard
              title="Total de Leads Salvos"
              value={metrics.prospecting_leads_saved_total || 0}
              icon={<Users className="h-4 w-4" />}
              data={generateChartData(metrics.prospecting_leads_saved_total || 0)}
              trend={-5}
            />
            <MetricChartCard
              title="Acionamentos de Ferramentas"
              value={metrics.agent_tool_calls_total || 0}
              icon={<Wrench className="h-4 w-4" />}
              data={generateChartData(metrics.agent_tool_calls_total || 0)}
              trend={15}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Monitoring;
