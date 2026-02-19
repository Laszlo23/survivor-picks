"use server";

// ─── Frame Capture Service ───────────────────────────────────────────────────
// Captures a frame from a live stream for AI analysis.
// Strategy:
//   YouTube → thumbnail URL (updates during live streams)
//   Twitch  → API thumbnail (updates frequently)
//   Custom  → Browserless.io screenshot (if configured)

interface CapturedFrame {
  base64: string;
  mimeType: string;
  source: string;
}

/** Extract YouTube video ID from various URL formats */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

/** Extract Twitch channel name */
function extractTwitchChannel(url: string): string | null {
  const m = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);
  return m ? m[1] : null;
}

// ─── YouTube frame capture ───────────────────────────────────────────────────

async function captureYouTubeFrame(url: string): Promise<CapturedFrame | null> {
  const id = extractYouTubeId(url);
  if (!id) return null;

  // YouTube provides live thumbnails that update periodically
  const thumbUrls = [
    `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  ];

  for (const thumbUrl of thumbUrls) {
    try {
      const cacheBust = `?t=${Date.now()}`;
      const res = await fetch(thumbUrl + cacheBust, {
        cache: "no-store",
        headers: { "User-Agent": "RealityPicks/1.0" },
      });
      if (!res.ok) continue;

      const buffer = await res.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      return { base64, mimeType: "image/jpeg", source: `youtube:${id}` };
    } catch {
      continue;
    }
  }

  return null;
}

// ─── Twitch frame capture ────────────────────────────────────────────────────

async function captureTwitchFrame(url: string): Promise<CapturedFrame | null> {
  const channel = extractTwitchChannel(url);
  if (!channel) return null;

  const clientId = process.env.TWITCH_CLIENT_ID;
  const accessToken = process.env.TWITCH_ACCESS_TOKEN;
  if (!clientId || !accessToken) return null;

  try {
    const res = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${channel}`,
      {
        headers: {
          "Client-ID": clientId,
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const stream = data.data?.[0];
    if (!stream?.thumbnail_url) return null;

    const thumbUrl = stream.thumbnail_url
      .replace("{width}", "1280")
      .replace("{height}", "720");

    const thumbRes = await fetch(thumbUrl + `?t=${Date.now()}`, {
      cache: "no-store",
    });
    if (!thumbRes.ok) return null;

    const buffer = await thumbRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return { base64, mimeType: "image/jpeg", source: `twitch:${channel}` };
  } catch {
    return null;
  }
}

// ─── Browserless screenshot (custom streams) ─────────────────────────────────

async function captureBrowserlessFrame(
  url: string
): Promise<CapturedFrame | null> {
  const apiKey = process.env.BROWSERLESS_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://chrome.browserless.io/screenshot?token=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          options: {
            type: "jpeg",
            quality: 80,
            fullPage: false,
          },
          gotoOptions: {
            waitUntil: "networkidle2",
            timeout: 15000,
          },
          viewport: {
            width: 1280,
            height: 720,
          },
        }),
      }
    );

    if (!res.ok) return null;

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return { base64, mimeType: "image/jpeg", source: `browserless:${url}` };
  } catch {
    return null;
  }
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function captureFrame(
  streamUrl: string,
  streamType: string
): Promise<CapturedFrame | null> {
  switch (streamType) {
    case "youtube":
      return captureYouTubeFrame(streamUrl);
    case "twitch":
      return captureTwitchFrame(streamUrl);
    case "custom":
      return captureBrowserlessFrame(streamUrl);
    default:
      // Try YouTube first, then Twitch, then Browserless
      return (
        (await captureYouTubeFrame(streamUrl)) ??
        (await captureTwitchFrame(streamUrl)) ??
        (await captureBrowserlessFrame(streamUrl))
      );
  }
}
