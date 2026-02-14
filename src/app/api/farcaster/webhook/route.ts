import { prisma } from "@/lib/prisma";

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
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Decode the JFS payload
    const payloadJson = JSON.parse(
      Buffer.from(body.payload, "base64url").toString("utf-8")
    );
    const headerJson = JSON.parse(
      Buffer.from(body.header, "base64url").toString("utf-8")
    );

    const fid = headerJson.fid as number | undefined;
    const event = payloadJson.event as string;

    if (!fid || !event) {
      return Response.json(
        { error: "Invalid webhook payload" },
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

        if (notificationDetails) {
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

      default:
        console.warn(`[Farcaster Webhook] Unknown event: ${event}`);
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
