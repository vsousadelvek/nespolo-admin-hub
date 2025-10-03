import { Activity, Users, MessageSquare, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Monitoramento", url: "/", icon: Activity },
  { title: "Leads Qualificados", url: "/leads", icon: Users },
  { title: "Histórico de Conversas", url: "/conversations", icon: MessageSquare },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar className={open ? "w-60" : "w-14"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-semibold text-lg px-4 py-6 transition-all duration-300">
            {open && (
              <span className="animate-fade-in bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Nespolo AI
              </span>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 transition-all duration-300 group ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-primary"
                            : "hover:bg-sidebar-accent/50 hover:translate-x-1"
                        }`
                      }
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <item.icon className="h-5 w-5 transition-all duration-300 group-hover:scale-110" />
                      {open && <span className="animate-fade-in">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
