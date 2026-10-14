/**
 * Pure access-control logic for documents.
 *
 * Kept dependency-free (no Prisma, no Next.js imports) on purpose so it can be
 * unit-tested in isolation and reused identically from API routes and server
 * components. This is the single source of truth for "who can see/edit what".
 */

export type Role = "OWNER" | "EDITOR" | "VIEWER" | "NONE";

export interface DocumentAccessInput {
  currentUserId: string;
  ownerId: string;
  shares: Array<{ userId: string; permission: "VIEW" | "EDIT" }>;
}

/** Resolve a user's role on a document from ownership + share records. */
export function resolveRole({
  currentUserId,
  ownerId,
  shares,
}: DocumentAccessInput): Role {
  if (currentUserId === ownerId) return "OWNER";

  const share = shares.find((s) => s.userId === currentUserId);
  if (!share) return "NONE";

  return share.permission === "EDIT" ? "EDITOR" : "VIEWER";
}

export function canView(role: Role): boolean {
  return role === "OWNER" || role === "EDITOR" || role === "VIEWER";
}

export function canEdit(role: Role): boolean {
  return role === "OWNER" || role === "EDITOR";
}

export function canShare(role: Role): boolean {
  // Only the owner can grant/revoke access. Editors can edit content but
  // cannot change who the document is shared with.
  return role === "OWNER";
}

export function canDelete(role: Role): boolean {
  return role === "OWNER";
}

export function canRename(role: Role): boolean {
  return role === "OWNER" || role === "EDITOR";
}
