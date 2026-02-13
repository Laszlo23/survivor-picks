import { cn } from "@/lib/utils";
import { formatOdds } from "@/lib/scoring";

export function OddsPill({
  odds,
  className,
}: {
  odds: number;
  className?: string;
}) {
  const isPositive = odds >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide",
        isPositive
          ? "bg-primary/20 text-primary"
          : "bg-accent/20 text-accent",
        className
      )}
    >
      {formatOdds(odds)}
    </span>
  );
}
