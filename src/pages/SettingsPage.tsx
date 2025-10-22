import { useState } from "react";
import GeneralSettings from "./GeneralSettings";
import IntegrationsSettings from "./IntegrationsSettings";
import { Button } from "@/components/ui/button";

type SettingsTab = "general" | "integrations" | "appearance";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralSettings />;
      case "integrations":
        return <IntegrationsSettings />;
      case "appearance":
        return <div>Em breve...</div>; // Placeholder
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-slide-in-left">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Configurações
        </h1>
        <p className="text-muted-foreground mt-1">
          Ajuste o comportamento do agente de IA e da aplicação
        </p>
      </div>

      <div className="flex space-x-4 border-b">
        <Button
          variant={activeTab === "general" ? "ghost" : "ghost"}
          className={`rounded-none ${
            activeTab === "general"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
          onClick={() => setActiveTab("general")}
        >
          Geral
        </Button>
        <Button
          variant={activeTab === "integrations" ? "ghost" : "ghost"}
          className={`rounded-none ${
            activeTab === "integrations"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
          onClick={() => setActiveTab("integrations")}
        >
          Integrações
        </Button>
        <Button
          variant="ghost"
          className="rounded-none text-muted-foreground"
          disabled
        >
          Aparência
        </Button>
      </div>

      <div className="mt-6">{renderContent()}</div>
    </div>
  );
};

export default SettingsPage;
