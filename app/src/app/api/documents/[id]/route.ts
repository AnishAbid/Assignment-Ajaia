import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { updateDocumentSchema } from "@/lib/validation";
import { withErrorHandling, HttpError } from "@/lib/api-helpers";
import { loadDocumentForUser } from "@/lib/document-access";
import { canEdit, canDelete, canRename } from "@/lib/permissions";
import { sanitizeDocumentHtml } from "@/lib/sanitize";

type Params = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(async (_req: NextRequest, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  const { document, role } = await loadDocumentForUser(id, user.id);
  return NextResponse.json({ document, role });
});

export const PATCH = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  const { document, role } = await loadDocumentForUser(id, user.id);

  const body = await req.json().catch(() => ({}));
  const data = updateDocumentSchema.parse(body ?? {});

  if (data.title !== undefined && !canRename(role)) {
    throw new HttpError(403, "You don't have permission to rename this document");
  }
  if (data.content !== undefined && !canEdit(role)) {
    throw new HttpError(403, "You don't have permission to edit this document");
  }

  const updated = await prisma.document.update({
    where: { id: document.id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.content !== undefined ? { content: sanitizeDocumentHtml(data.content) } : {}),
    },
  });

  return NextResponse.json({ document: updated });
});

export const DELETE = withErrorHandling(async (_req: NextRequest, { params }: Params) => {
  const user = await requireUser();
  const { id } = await params;
  const { document, role } = await loadDocumentForUser(id, user.id);

  if (!canDelete(role)) {
    throw new HttpError(403, "Only the owner can delete this document");
  }

  await prisma.document.delete({ where: { id: document.id } });
  return NextResponse.json({ ok: true });
});
