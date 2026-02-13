import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-16 w-16 bg-muted rounded-full" />
        <div>
          <div className="h-7 w-40 bg-muted rounded mb-2" />
          <div className="h-4 w-56 bg-muted/50 rounded" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <div className="h-3 w-16 bg-muted rounded mb-2" />
              <div className="h-7 w-24 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content cards */}
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardHeader>
              <div className="h-6 w-40 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-10 bg-secondary/30 rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
