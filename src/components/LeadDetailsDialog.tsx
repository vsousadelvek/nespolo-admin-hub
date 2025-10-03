import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Mail, Phone, Calendar } from "lucide-react";

interface Lead {
  id: number;
  company_name: string;
  email: string;
  phone: string;
  source_url: string;
  captured_at: string;
}

interface LeadDetailsDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetailsDialog({ lead, open, onOpenChange }: LeadDetailsDialogProps) {
  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-xl">{lead.company_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <Mail className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <p className="font-medium">{lead.email}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <Phone className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Telefone</p>
              <p className="font-medium">{lead.phone}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <ExternalLink className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">URL de Origem</p>
              <a
                href={lead.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                {lead.source_url}
              </a>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Calendar className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Capturado em</p>
              <p className="font-medium">
                {new Date(lead.captured_at).toLocaleString("pt-BR", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Badge variant="outline" className="font-normal">
              ID: {lead.id}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
