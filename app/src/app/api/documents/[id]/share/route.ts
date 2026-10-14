import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { shareDocumentSchema } from "@/lib/validation";
import { withErrorHandling, HttpError } from "@/lib/api-helpers";
import { loadDocumentForUser } from "@/lib/document-access";
import { canShare } from "@/lib/permissions";

type Params = { params: Promise<{ id: string }> };

/** GET /api/documents/:id/share — list current shares (owner only). */
export const GET = withErrorHandling(async (_req: NextRequest, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  const { document, role } = await loadDocumentForUser(id, user.id);

  if (!canShare(role)) {
    throw new HttpError(403, "Only the owner can view sharing settings");
  }

  const shares = await prisma.share.findMany({
    where: { documentId: document.id },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ shares });
});

/** POST /api/documents/:id/share — grant (or update) access for another user. */
export const POST = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  const { document, role } = await loadDocumentForUser(id, user.id);

  if (!canShare(role)) {
    throw new HttpError(403, "Only the owner can share this document");
  }

  const body = await req.json().catch(() => null);
  const { userId, permission } = shareDocumentSchema.parse(body);

  if (userId === document.ownerId) {
    throw new HttpError(400, "The owner already has full access");
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    throw new HttpError(404, "Unknown user");
  }

  const share = await prisma.share.upsert({
    where: { documentId_userId: { documentId: document.id, userId } },
    update: { permission },
    create: { documentId: document.id, userId, permission },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({ share }, { status: 201 });
});

/** DELETE /api/documents/:id/share?userId=... — revoke access. */
export const DELETE = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  const { document, role } = await loadDocumentForUser(id, user.id);

  if (!canShare(role)) {
    throw new HttpError(403, "Only the owner can modify sharing settings");
  }

  const targetUserId = req.nextUrl.searchParams.get("userId");
  if (!targetUserId) {
    throw new HttpError(400, "Missing userId query parameter");
  }

  await prisma.share
    .delete({ where: { documentId_userId: { documentId: document.id, userId: targetUserId } } })
    .catch(() => {
      // Already revoked / never existed — treat as a no-op success for idempotency.
    });

  return NextResponse.json({ ok: true });
});
