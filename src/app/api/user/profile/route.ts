import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { name?: string; image?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const updates: { name?: string; image?: string | null } = {};
  if (typeof body.name === "string") {
    const trimmed = body.name.trim();
    if (trimmed.length > 0 && trimmed.length <= 50) {
      updates.name = trimmed;
    }
  }
  if (typeof body.image === "string") {
    const url = body.image.trim();
    if (url.length === 0) {
      updates.image = null;
    } else if (url.startsWith("http") && url.length <= 500) {
      updates.image = url;
    }
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "No valid updates" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: updates,
  });

  return Response.json({
    user: {
      id: updated.id,
      name: updated.name,
      image: updated.image,
      email: updated.email,
    },
  });
}
