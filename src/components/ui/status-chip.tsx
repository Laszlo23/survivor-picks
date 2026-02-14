import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "DRAFT" | "OPEN" | "LOCKED" | "RESOLVED";

const statusConfig: Record<Status, { label: string; className: string }> = {
  DRAFT: {
    label: "Draft",
    className: "bg-muted text-muted-foreground",
  },
  OPEN: {
    label: "Open",
    className: "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30",
  },
  LOCKED: {
    label: "Locked",
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  RESOLVED: {
    label: "Resolved",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
};

export function StatusChip({ status }: { status: Status }) {
  const config = statusConfig[status] || statusConfig.DRAFT;
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", config.className)}
    >
      {config.label}
    </Badge>
  );
}
