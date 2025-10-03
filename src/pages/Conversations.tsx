import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

const Conversations = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: userIds } = useQuery({
    queryKey: ["conversations"],
    queryFn: async (): Promise<string[]> => {
      const response = await fetch("/conversations");
      return response.json();
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["conversation", selectedUserId],
    queryFn: async (): Promise<Message[]> => {
      if (!selectedUserId) return [];
      const response = await fetch(`/conversations/${selectedUserId}`);
      return response.json();
    },
    enabled: !!selectedUserId,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-slide-in-left">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Histórico de Conversas
        </h1>
        <p className="text-muted-foreground mt-1">
          Audite todas as conversas do chatbot
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <Card className="hover-lift animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Usuários
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {userIds?.map((userId, index) => (
                <button
                  key={userId}
                  onClick={() => setSelectedUserId(userId)}
                  className={`w-full px-4 py-3 text-left transition-all duration-200 hover:bg-accent animate-fade-in ${
                    selectedUserId === userId
                      ? "bg-accent text-accent-foreground border-l-2 border-primary"
                      : ""
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {userId}
                </button>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-scale-in" style={{ animationDelay: "0.1s" }}>
          <CardHeader>
            <CardTitle>
              {selectedUserId ? `Conversa com ${selectedUserId}` : "Selecione um usuário"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              {messages?.map((message, index) => (
                <div
                  key={message.id}
                  className={`mb-4 flex animate-fade-in ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div
                    className={`flex gap-3 max-w-[80%] ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <Avatar className="h-8 w-8 transition-all duration-300 hover:scale-110">
                      <AvatarFallback className={message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}>
                        {message.role === "user" ? "U" : "AI"}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`rounded-lg px-4 py-2 transition-all duration-300 hover:shadow-lg ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.created_at).toLocaleTimeString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Conversations;
