import { Flame } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Flame className="h-6 w-6 text-primary" />
          Dashboard
        </h1>
        <div className="h-4 w-48 bg-muted rounded mt-2" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-3 w-14 bg-muted rounded mb-2" />
                  <div className="h-7 w-20 bg-muted rounded" />
                </div>
                <div className="h-10 w-10 rounded-lg bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Episode card skeleton */}
        <div className="lg:col-span-2">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <div className="h-6 w-48 bg-muted rounded" />
              <div className="h-4 w-32 bg-muted/60 rounded mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-10 bg-secondary/50 rounded-lg"
                  />
                ))}
              </div>
              <div className="h-10 bg-primary/20 rounded-lg" />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar skeleton */}
        <div>
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <div className="h-6 w-32 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-secondary/30 rounded-lg"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
