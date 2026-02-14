/**
 * Health check endpoint for monitoring.
 * GET /api/health
 */

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Simple DB connectivity check
    await prisma.$queryRaw`SELECT 1`;

    return Response.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "unknown",
    });
  } catch (error) {
    return Response.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: "Database connection failed",
      },
      { status: 503 }
    );
  }
}
