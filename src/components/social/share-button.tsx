"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check, Copy, Loader2 } from "lucide-react";
import {
  generateShareContent,
  triggerShare,
  type ShareType,
  type ShareData,
} from "@/lib/share";
import { claimSocialTask } from "@/lib/actions/social";
import { toast } from "sonner";

interface ShareButtonProps {
  shareType: ShareType;
  shareData: ShareData;
  taskKey: string; // social task key to claim
  seasonId: string;
  metadata?: Record<string, string | number | boolean | null>;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  label?: string;
  children?: React.ReactNode;
}

export function ShareButton({
  shareType,
  shareData,
  taskKey,
  seasonId,
  metadata,
  variant = "outline",
  size = "sm",
  className = "",
  label,
  children,
}: ShareButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleShare = async () => {
    setStatus("loading");

    try {
      const content = generateShareContent(shareType, shareData);
      const result = await triggerShare(content);

      if (result === "failed") {
        setStatus("idle");
        return;
      }

      // Claim the social task for points
      const claimResult = await claimSocialTask(taskKey, seasonId, {
        ...metadata,
        shareType,
        platform: result === "shared" ? "native" : "clipboard",
      });

      if (claimResult.success) {
        toast.success(`+${claimResult.pointsAwarded} points!`, {
          description:
            result === "shared"
              ? "Shared successfully!"
              : "Link copied to clipboard!",
        });
      } else if (claimResult.error === "On cooldown") {
        toast.info(
          result === "shared"
            ? "Shared! (already earned points today)"
            : "Copied! (already earned points today)"
        );
      } else {
        toast.info(
          result === "shared" ? "Shared!" : "Copied to clipboard!"
        );
      }

      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      toast.error("Failed to share");
      setStatus("idle");
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`gap-2 ${className}`}
      onClick={handleShare}
      disabled={status === "loading"}
    >
      {status === "loading" ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : status === "done" ? (
        <Check className="h-3.5 w-3.5 text-emerald-400" />
      ) : (
        <Share2 className="h-3.5 w-3.5" />
      )}
      {children || label || "Share"}
    </Button>
  );
}

// ─── Simple Copy Button for referral codes ───────────────────────────────────

interface CopyButtonProps {
  text: string;
  className?: string;
  label?: string;
}

export function CopyButton({ text, className = "", label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`gap-2 ${className}`}
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-400" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {label || (copied ? "Copied!" : "Copy")}
    </Button>
  );
}
