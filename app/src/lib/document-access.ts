import { prisma } from "@/lib/db";
import { HttpError } from "@/lib/api-helpers";
import { resolveRole, type Role } from "@/lib/permissions";

/**
 * Loads a document and resolves the current user's role on it in one place,
 * so every route that touches a single document enforces access control the
 * same way. Throws 404 if the document doesn't exist, and NEVER reveals
 * whether a document exists to a user with no access to it beyond a 404 —
 * i.e. "not found" and "not yours" look identical from the outside.
 */
export async function loadDocumentForUser(documentId: string, userId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      shares: { select: { userId: true, permission: true } },
      owner: { select: { id: true, name: true, email: true } },
    },
  });

  if (!document) {
    throw new HttpError(404, "Document not found");
  }

  const role: Role = resolveRole({
    currentUserId: userId,
    ownerId: document.ownerId,
    shares: document.shares,
  });

  if (role === "NONE") {
    // Same status as a non-existent doc — don't leak existence to non-members.
    throw new HttpError(404, "Document not found");
  }

  return { document, role };
}
