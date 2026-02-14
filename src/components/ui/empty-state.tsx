"use client";

import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/motion";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <FadeIn direction="up">
      <div
        className={cn(
          "flex flex-col items-center justify-center py-16 text-center",
          className
        )}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/50 border border-white/[0.06] mb-4 animate-float">
          {icon}
        </div>
        <h3 className="text-lg font-display font-semibold mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm max-w-sm">{description}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </FadeIn>
  );
}
