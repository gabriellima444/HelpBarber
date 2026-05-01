import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function DashboardLoading() {
  return (
    <div className="container px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8 space-y-2">
        <div className="h-8 w-64 bg-muted rounded-lg animate-pulse" />
        <div className="h-4 w-96 bg-muted/60 rounded-md animate-pulse" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border border-border/50">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-muted/60 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded-md animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Appointments skeleton */}
      <Card className="border border-border/50">
        <CardHeader>
          <div className="h-6 w-48 bg-muted rounded-md animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-border/30">
              <div className="h-12 w-12 bg-muted rounded-full animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-3 w-48 bg-muted/60 rounded animate-pulse" />
              </div>
              <div className="h-8 w-20 bg-muted/40 rounded-lg animate-pulse" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
