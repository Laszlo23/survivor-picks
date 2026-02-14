/**
 * Share Content Generator
 * ======================
 * Generates platform-optimized share text for predictions, results, and ranks.
 * All share links include the user's referral code for viral growth.
 */

const APP_NAME = "RealityPicks";

function getBaseUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

function buildRefLink(referralCode?: string | null): string {
  const base = getBaseUrl();
  if (referralCode) return `${base}/?ref=${referralCode}`;
  return base;
}

// ─── Share Types ─────────────────────────────────────────────────────────────

export type ShareType =
  | "prediction"
  | "result_win"
  | "result_loss"
  | "rank"
  | "invite";

export interface ShareData {
  // For predictions
  questionPrompt?: string;
  chosenOption?: string;
  episodeTitle?: string;
  episodeNumber?: number;
  // For results
  pointsEarned?: number;
  streak?: number;
  // For rank
  rank?: number;
  totalPoints?: number;
  seasonTitle?: string;
  // Always
  referralCode?: string | null;
}

export interface ShareContent {
  text: string;
  url: string;
  title: string;
}

// ─── Generator ───────────────────────────────────────────────────────────────

export function generateShareContent(
  type: ShareType,
  data: ShareData
): ShareContent {
  const link = buildRefLink(data.referralCode);

  switch (type) {
    case "prediction":
      return {
        title: `My ${APP_NAME} Pick`,
        text: `I just predicted "${data.chosenOption}" for "${data.questionPrompt}" in Episode ${data.episodeNumber}! Think you can beat me? Join ${APP_NAME}`,
        url: link,
      };

    case "result_win":
      return {
        title: `${APP_NAME} — Nailed It!`,
        text: `Called it! +${data.pointsEarned} points on Episode ${data.episodeNumber}${
          data.streak && data.streak >= 2
            ? `. ${data.streak} episode streak!`
            : "."
        } Join the game`,
        url: link,
      };

    case "result_loss":
      return {
        title: `${APP_NAME} — Next Time!`,
        text: `Didn't call it this round... but I'll be back stronger! Episode ${data.episodeNumber} didn't go my way. Join ${APP_NAME}`,
        url: link,
      };

    case "rank":
      return {
        title: `${APP_NAME} Leaderboard`,
        text: `I'm ranked #${data.rank} with ${data.totalPoints?.toLocaleString()} points in ${
          data.seasonTitle || "RealityPicks"
        }! Can you beat me?`,
        url: link,
      };

    case "invite":
      return {
        title: `Join ${APP_NAME}!`,
        text: `I'm playing ${APP_NAME} — predict reality TV outcomes across Survivor, The Traitors, The Bachelor & more. No real money, just bragging rights. Join free`,
        url: link,
      };

    default:
      return {
        title: APP_NAME,
        text: `Check out ${APP_NAME} — a free reality TV prediction game!`,
        url: link,
      };
  }
}

// ─── Web Share API / Clipboard ───────────────────────────────────────────────

export async function triggerShare(
  content: ShareContent
): Promise<"shared" | "copied" | "failed"> {
  const shareText = `${content.text}\n${content.url}`;

  // Try native Web Share API (mobile)
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title: content.title,
        text: content.text,
        url: content.url,
      });
      return "shared";
    } catch (err) {
      // User cancelled or share failed — fall through to clipboard
      if ((err as Error)?.name === "AbortError") return "failed";
    }
  }

  // Fallback: copy to clipboard
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(shareText);
      return "copied";
    } catch {
      // Clipboard failed
    }
  }

  // Last resort: execCommand
  try {
    const textarea = document.createElement("textarea");
    textarea.value = shareText;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return "copied";
  } catch {
    return "failed";
  }
}
