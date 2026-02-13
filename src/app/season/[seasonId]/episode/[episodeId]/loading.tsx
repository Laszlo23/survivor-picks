import { ArrowLeft } from "lucide-react";

export default function EpisodeLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 animate-pulse">
      {/* Back link placeholder */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
      </div>

      {/* Header skeleton */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-6 w-20 bg-muted rounded-full" />
        </div>
        <div className="h-4 w-48 bg-muted/60 rounded mt-2" />
      </div>

      {/* Question cards skeleton */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border/50 bg-card/50 p-6"
          >
            {/* Question header */}
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 w-3/4 bg-muted rounded" />
              <div className="h-5 w-16 bg-primary/10 rounded" />
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className="h-12 bg-secondary/50 rounded-lg border border-border/30"
                />
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
              <div className="h-4 w-24 bg-muted/40 rounded" />
              <div className="h-4 w-20 bg-muted/40 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
