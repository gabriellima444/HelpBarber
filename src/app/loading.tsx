import { Scissors } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-4">
      <div className="relative">
        <div className="p-4 bg-primary/10 rounded-2xl animate-pulse">
          <Scissors className="h-10 w-10 text-primary" />
        </div>
        <div className="absolute inset-0 bg-primary/20 rounded-2xl animate-ping" />
      </div>
      <div className="space-y-2 text-center">
        <div className="h-4 w-32 bg-muted rounded-full animate-pulse mx-auto" />
        <div className="h-3 w-48 bg-muted/60 rounded-full animate-pulse mx-auto" />
      </div>
    </div>
  );
}
