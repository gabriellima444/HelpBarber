import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function BarbersLoading() {
  return (
    <div className="container px-4 py-8">
      {/* Search skeleton */}
      <div className="mb-8 space-y-4">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="h-12 w-full max-w-md bg-muted/60 rounded-xl animate-pulse" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden border border-border/50">
            <div className="h-48 bg-muted animate-pulse" />
            <CardHeader className="space-y-3">
              <div className="h-5 w-3/4 bg-muted rounded-md animate-pulse" />
              <div className="h-4 w-1/2 bg-muted/60 rounded-md animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-3 w-full bg-muted/40 rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-muted/40 rounded animate-pulse" />
              <div className="h-10 w-full bg-muted/30 rounded-xl animate-pulse mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
