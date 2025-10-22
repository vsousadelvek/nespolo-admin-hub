import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LoginDialog } from "@/components/LoginDialog";
import Monitoring from "./pages/Monitoring";
import Leads from "./pages/Leads";
import Conversations from "./pages/Conversations";
import SettingsPage from "./pages/SettingsPage";
import TestMessaging from "./pages/TestMessaging";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Or a proper splash screen
  }

  if (!isAuthenticated) {
    return <LoginDialog open={true} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                <header className="h-14 border-b border-border bg-card flex items-center px-4">
                  <SidebarTrigger />
                </header>
                <main className="flex-1 p-6">
                  <Routes>
                    <Route path="/" element={<Monitoring />} />
                    <Route path="/leads" element={<Leads />} />
                    <Route path="/conversations" element={<Conversations />} />
                    <Route path="/test" element={<TestMessaging />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
