import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, MessageSquare, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const TestMessaging = () => {
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<any[]>([]);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [typingDelay, setTypingDelay] = useState(2.0);
  const [debounceSeconds, setDebounceSeconds] = useState(20);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [savingConfig, setSavingConfig] = useState(false);

  // Use the same host as the frontend, nginx will proxy to backend
  const API_BASE = window.location.protocol + "//" + window.location.host;
  const token = localStorage.getItem("authToken");

  // Load configuration on mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch(`${API_BASE}/test/config`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTypingDelay(data.typing_delay_seconds || 2.0);
        setDebounceSeconds(data.debounce_seconds || 20);
        setSystemPrompt(data.system_prompt || "");
      }
    } catch (error) {
      console.error("Error loading config:", error);
    }
  };

  const saveConfig = async () => {
    setSavingConfig(true);
    try {
      const response = await fetch(`${API_BASE}/test/config?typing_delay=${typingDelay}&debounce_seconds=${debounceSeconds}&system_prompt=${encodeURIComponent(systemPrompt)}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Erro HTTP ${response.status}: ${response.statusText}`);
      }

      toast({
        title: "Configurações salvas!",
        description: `Configurações atualizadas com sucesso`,
      });
    } catch (error: any) {
      console.error("Error saving config:", error);
      toast({
        title: "Erro ao salvar configurações",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSendMessage = async () => {
    if (!phone || !message) {
      toast({
        title: "Erro",
        description: "Preencha o número e a mensagem",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/test/send-message?phone=${encodeURIComponent(phone)}&message=${encodeURIComponent(message)}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Erro HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      toast({
        title: "Mensagem enviada!",
        description: `Mensagem em fila para processamento. Telefone: ${data.phone}`,
      });

      setMessage("");

      // Wait a bit then load conversation
      setTimeout(() => loadConversation(phone), 2000);

    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateConversation = async () => {
    if (!phone) {
      toast({
        title: "Erro",
        description: "Preencha o número de telefone",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/test/simulate-conversation?phone=${encodeURIComponent(phone)}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Erro HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      toast({
        title: "Conversa iniciada!",
        description: `Mensagem de prospecção enviada para ${data.phone}`,
      });

      // Load conversation after a delay
      setTimeout(() => loadConversation(phone), 2000);

    } catch (error: any) {
      console.error("Error simulating conversation:", error);
      toast({
        title: "Erro ao simular conversa",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (phoneNumber: string) => {
    if (!phoneNumber) return;

    setLoadingConversation(true);

    try {
      const response = await fetch(`${API_BASE}/test/conversation/${encodeURIComponent(phoneNumber)}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Erro HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setConversation(data.messages || []);

    } catch (error: any) {
      console.error("Error loading conversation:", error);
      toast({
        title: "Erro ao carregar conversa",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoadingConversation(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Teste de Mensagens</h2>
        <p className="text-muted-foreground">
          Envie mensagens de teste e simule conversas com a IA
        </p>
      </div>

      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Teste</CardTitle>
          <CardDescription>
            Ajuste o comportamento do sistema durante os testes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">Prompt do Sistema (IA)</Label>
              <Textarea
                id="systemPrompt"
                placeholder="Digite o prompt do sistema aqui..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                Instruções que definem o comportamento da IA (salvo em agent_config.json)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="typingDelay">Typing Delay (segundos)</Label>
                <Input
                  id="typingDelay"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={typingDelay}
                  onChange={(e) => setTypingDelay(parseFloat(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Tempo de simulação de digitação antes de enviar resposta
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="debounceSeconds">Debounce (segundos)</Label>
                <Input
                  id="debounceSeconds"
                  type="number"
                  step="1"
                  min="1"
                  max="60"
                  value={debounceSeconds}
                  onChange={(e) => setDebounceSeconds(parseInt(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Tempo de espera para acumular mensagens antes de processar
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={saveConfig} disabled={savingConfig}>
              {savingConfig ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Configurações"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="send">Enviar Mensagem</TabsTrigger>
          <TabsTrigger value="simulate">Simular Conversa</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Enviar Mensagem de Teste
              </CardTitle>
              <CardDescription>
                Simula uma mensagem recebida do WhatsApp. A IA irá processar e responder.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Número de Telefone</Label>
                <Input
                  id="phone"
                  placeholder="+55 47 98400-7347"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Formato: +55 DDD NÚMERO ou apenas números
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  placeholder="Olá, preciso de um orçamento para usinagem..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSendMessage}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => loadConversation(phone)}
                  disabled={loadingConversation || !phone}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="font-medium mb-1">ℹ️ Como funciona:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Mensagem entra no sistema de debounce ({debounceSeconds}s)</li>
                  <li>IA processa com contexto completo da conversa</li>
                  <li>Resposta é enviada via Z-API para o WhatsApp</li>
                  <li>Histórico é salvo no banco de dados</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Simular Conversa Completa
              </CardTitle>
              <CardDescription>
                Envia mensagem de prospecção inicial. A IA conversará naturalmente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone-simulate">Número de Telefone</Label>
                <Input
                  id="phone-simulate"
                  placeholder="+55 47 98400-7347"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <Button
                onClick={handleSimulateConversation}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Iniciar Conversa de Prospecção
                  </>
                )}
              </Button>

              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="font-medium mb-1">📝 Fluxo de Prospecção:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Sistema envia mensagem inicial de apresentação</li>
                  <li>IA está pronta para responder qualquer pergunta</li>
                  <li>Conversa natural com contexto mantido</li>
                  <li>Qualificação automática de leads</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Conversation History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Histórico da Conversa</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadConversation(phone)}
              disabled={loadingConversation || !phone}
            >
              {loadingConversation ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </CardTitle>
          <CardDescription>
            {conversation.length > 0 ? `${conversation.length} mensagens` : "Nenhuma mensagem ainda"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {conversation.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma conversa ainda</p>
              <p className="text-sm">Envie uma mensagem para começar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversation.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={msg.role === "user" ? "secondary" : "outline"} className="text-xs">
                        {msg.role === "user" ? "Usuário" : "IA"}
                      </Badge>
                      <span className="text-xs opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString("pt-BR")}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestMessaging;
