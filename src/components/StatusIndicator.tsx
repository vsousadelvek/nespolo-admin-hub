interface StatusIndicatorProps {
  status: "healthy" | "unhealthy";
  label: string;
}

export function StatusIndicator({ status, label }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-3 group transition-all duration-300">
      <div className="relative">
        <div
          className={`h-3 w-3 rounded-full transition-all duration-300 ${
            status === "healthy" ? "bg-success" : "bg-destructive"
          }`}
        />
        {status === "healthy" && (
          <div className="absolute inset-0 h-3 w-3 rounded-full bg-success opacity-50 status-pulse" />
        )}
      </div>
      <span className="text-sm font-medium group-hover:text-foreground transition-colors">
        {label}
      </span>
    </div>
  );
}
