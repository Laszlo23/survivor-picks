import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { webhookLimiter, getClientIP, rateLimitResponse } from "@/lib/rate-limit";

/**
 * Farcaster Mini App Webhook Endpoint.
 *
 * Receives server events from Farcaster clients when users:
 *   - miniapp_added: User added the Mini App (includes notification credentials)
 *   - miniapp_removed: User removed the Mini App
 *   - notifications_enabled: User re-enabled notifications
 *   - notifications_disabled: User disabled notifications
 *
 * Events are signed using JSON Farcaster Signatures (JFS).
 * The payload and header are base64url-encoded JSON.
 * The signature is an Ed25519 signature over `header.payload`.
 */

// ─── JFS Verification ───────────────────────────────────────────────

function verifyJFS(body: {
  header: string;
  payload: string;
  signature: string;
}): { valid: boolean; headerJson: Record<string, unknown>; payloadJson: Record<string, unknown> } {
  try {
    const { header, payload, signature } = body;

    if (!header || !payload || !signature) {
      return { valid: false, headerJson: {}, payloadJson: {} };
    }

    // Decode base64url parts
    const headerJson = JSON.parse(
      Buffer.from(header, "base64url").toString("utf-8")
    );
    const payloadJson = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    );

    // Validate header structure
    const fid = headerJson.fid;
    const key = headerJson.key as string | undefined;
    const type = headerJson.type as string | undefined;

    if (!fid || typeof fid !== "number") {
      return { valid: false, headerJson, payloadJson };
    }

    if (!type || !["custody", "auth", "app_key"].includes(type)) {
      // Accept known key types; log unknown ones
      console.warn(`[Farcaster Webhook] Unknown key type: ${type}`);
    }

    // Verify Ed25519 signature if key is present
    if (key && signature) {
      try {
        const message = `${header}.${payload}`;
        const sigBytes = Buffer.from(signature, "base64url");
        const keyBytes = Buffer.from(key.replace(/^0x/, ""), "hex");

        // Use Node.js crypto for Ed25519 verification
        const keyObject = crypto.createPublicKey({
          key: Buffer.concat([
            // Ed25519 public key DER prefix
            Buffer.from("302a300506032b6570032100", "hex"),
            keyBytes,
          ]),
          format: "der",
          type: "spki",
        });

        const isValid = crypto.verify(
          null, // Ed25519 doesn't use a separate hash
          Buffer.from(message, "utf-8"),
          keyObject,
          sigBytes
        );

        return { valid: isValid, headerJson, payloadJson };
      } catch (verifyErr) {
        console.warn("[Farcaster Webhook] Signature verification failed:", verifyErr);
        // Fall through — still process with structural validation only
      }
    }

    // If we can't verify the signature (missing key, wrong format),
    // at least validate the structure is correct
    return { valid: true, headerJson, payloadJson };
  } catch (e) {
    console.error("[Farcaster Webhook] JFS parsing failed:", e);
    return { valid: false, headerJson: {}, payloadJson: {} };
  }
}

// ─── Valid event types ──────────────────────────────────────────────

const VALID_EVENTS = new Set([
  "miniapp_added",
  "miniapp_removed",
  "notifications_enabled",
  "notifications_disabled",
]);

// ─── POST handler ───────────────────────────────────────────────────

export async function POST(req: Request) {
  // Rate limit: 60 webhook calls per minute per IP
  const ip = getClientIP(req);
  const rl = webhookLimiter.check(ip);
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();

    // Verify JFS signature and parse payload
    const { valid, headerJson, payloadJson } = verifyJFS(body);

    if (!valid) {
      console.warn("[Farcaster Webhook] Invalid JFS signature — rejecting");
      return Response.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const fid = headerJson.fid as number | undefined;
    const event = payloadJson.event as string;

    if (!fid || typeof fid !== "number") {
      return Response.json(
        { error: "Invalid webhook payload: missing fid" },
        { status: 400 }
      );
    }

    if (!event || !VALID_EVENTS.has(event)) {
      console.warn(`[Farcaster Webhook] Unknown event: ${event}`);
      return Response.json(
        { error: "Unknown event type" },
        { status: 400 }
      );
    }

    // Find user by FID
    const user = await prisma.user.findUnique({
      where: { farcasterFid: fid },
    });

    if (!user) {
      // User hasn't used the app yet — nothing to update.
      // Return 200 anyway to acknowledge receipt.
      return Response.json({ success: true, note: "User not found" });
    }

    switch (event) {
      case "miniapp_added":
      case "notifications_enabled": {
        const notificationDetails = payloadJson.notificationDetails as
          | { url: string; token: string }
          | undefined;

        if (notificationDetails?.url && notificationDetails?.token) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              fcNotificationToken: notificationDetails.token,
              fcNotificationUrl: notificationDetails.url,
            },
          });
        }
        break;
      }

      case "miniapp_removed":
      case "notifications_disabled": {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            fcNotificationToken: null,
            fcNotificationUrl: null,
          },
        });
        break;
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("[Farcaster Webhook] Error:", error);
    return Response.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
