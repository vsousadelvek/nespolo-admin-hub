import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

interface MetricChartCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  data?: Array<{ value: number }>;
  trend?: number;
}

export function MetricChartCard({ title, value, icon, data, trend }: MetricChartCardProps) {
  const hasData = data && data.length > 0;
  
  return (
    <Card className="hover-lift group overflow-hidden relative animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:scale-110">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="flex items-baseline gap-3 mb-2">
          <div className="text-3xl font-bold">{value}</div>
          {trend !== undefined && (
            <span className={`text-sm font-medium ${trend >= 0 ? "text-success" : "text-destructive"}`}>
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </span>
          )}
        </div>
        {hasData && (
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={data}>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-card border border-border rounded-lg px-2 py-1 text-xs">
                        {payload[0].value}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
