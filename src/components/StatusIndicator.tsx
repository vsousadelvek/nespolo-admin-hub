interface StatusIndicatorProps {
  status: "healthy" | "unhealthy";
  label: string;
}

export function StatusIndicator({ status, label }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`h-3 w-3 rounded-full ${
          status === "healthy" ? "bg-success" : "bg-destructive"
        }`}
      />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
