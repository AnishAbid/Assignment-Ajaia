import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { createDocumentSchema } from "@/lib/validation";
import { withErrorHandling } from "@/lib/api-helpers";

/** GET /api/documents — documents the current user owns or has been given access to. */
export const GET = withErrorHandling(async () => {
  const user = await requireUser();

  const [owned, sharedWithMe] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: user.id },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { shares: true } } },
    }),
    prisma.document.findMany({
      where: { shares: { some: { userId: user.id } } },
      orderBy: { updatedAt: "desc" },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        shares: { where: { userId: user.id }, select: { permission: true } },
      },
    }),
  ]);

  return NextResponse.json({ owned, sharedWithMe });
});

/** POST /api/documents — create a new blank document owned by the current user. */
export const POST = withErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const body = await req.json().catch(() => ({}));
  const { title } = createDocumentSchema.parse(body ?? {});

  const doc = await prisma.document.create({
    data: {
      title: title || "Untitled document",
      ownerId: user.id,
      content: "<p></p>",
    },
  });

  return NextResponse.json({ document: doc }, { status: 201 });
});
