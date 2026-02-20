"use client";

import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { GLOSSARY } from "@/lib/glossary";

type GlossaryKey = keyof typeof GLOSSARY;

interface GlossaryTooltipProps {
  term?: GlossaryKey;
  /** Custom tooltip text (overrides glossary) */
  tooltip?: string;
  children: React.ReactNode;
  className?: string;
}

export function GlossaryTooltip({ term, tooltip, children, className }: GlossaryTooltipProps) {
  const entry = term ? GLOSSARY[term] : null;
  const tooltipText = tooltip ?? entry?.tooltip;
  if (!tooltipText) return <>{children}</>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex items-center gap-1 cursor-help",
            className
          )}
        >
          {children}
          <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden />
        </span>
      </TooltipTrigger>
      <TooltipContent sideOffset={4} className="max-w-[220px]">
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
}
