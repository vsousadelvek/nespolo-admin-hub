import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-24" />
      </CardContent>
    </Card>
  );
}

export function SkeletonTable() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-40" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChat() {
  return (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={`flex gap-3 ${i % 2 === 0 ? "justify-start" : "justify-end"} animate-fade-in`}
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <Skeleton className={`h-16 ${i % 2 === 0 ? "w-64" : "w-48"}`} />
        </div>
      ))}
    </div>
  );
}
