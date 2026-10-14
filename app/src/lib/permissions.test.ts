import { describe, expect, it } from "vitest";
import { resolveRole, canView, canEdit, canShare, canDelete, canRename } from "@/lib/permissions";

describe("resolveRole", () => {
  it("gives the document owner the OWNER role, regardless of shares", () => {
    const role = resolveRole({
      currentUserId: "u1",
      ownerId: "u1",
      shares: [{ userId: "u1", permission: "VIEW" }],
    });
    expect(role).toBe("OWNER");
  });

  it("gives a user with an EDIT share the EDITOR role", () => {
    const role = resolveRole({
      currentUserId: "u2",
      ownerId: "u1",
      shares: [{ userId: "u2", permission: "EDIT" }],
    });
    expect(role).toBe("EDITOR");
  });

  it("gives a user with a VIEW share the VIEWER role", () => {
    const role = resolveRole({
      currentUserId: "u2",
      ownerId: "u1",
      shares: [{ userId: "u2", permission: "VIEW" }],
    });
    expect(role).toBe("VIEWER");
  });

  it("gives a user with no share record the NONE role", () => {
    const role = resolveRole({
      currentUserId: "u3",
      ownerId: "u1",
      shares: [{ userId: "u2", permission: "EDIT" }],
    });
    expect(role).toBe("NONE");
  });

  it("gives NONE on a document with no shares at all for a non-owner", () => {
    const role = resolveRole({ currentUserId: "u2", ownerId: "u1", shares: [] });
    expect(role).toBe("NONE");
  });
});

describe("capability checks", () => {
  it("OWNER can view, edit, share, delete, and rename", () => {
    expect(canView("OWNER")).toBe(true);
    expect(canEdit("OWNER")).toBe(true);
    expect(canShare("OWNER")).toBe(true);
    expect(canDelete("OWNER")).toBe(true);
    expect(canRename("OWNER")).toBe(true);
  });

  it("EDITOR can view, edit, and rename, but cannot share or delete", () => {
    expect(canView("EDITOR")).toBe(true);
    expect(canEdit("EDITOR")).toBe(true);
    expect(canRename("EDITOR")).toBe(true);
    expect(canShare("EDITOR")).toBe(false);
    expect(canDelete("EDITOR")).toBe(false);
  });

  it("VIEWER can only view — no edit, share, delete, or rename", () => {
    expect(canView("VIEWER")).toBe(true);
    expect(canEdit("VIEWER")).toBe(false);
    expect(canShare("VIEWER")).toBe(false);
    expect(canDelete("VIEWER")).toBe(false);
    expect(canRename("VIEWER")).toBe(false);
  });

  it("NONE (no access) can do nothing", () => {
    expect(canView("NONE")).toBe(false);
    expect(canEdit("NONE")).toBe(false);
    expect(canShare("NONE")).toBe(false);
    expect(canDelete("NONE")).toBe(false);
    expect(canRename("NONE")).toBe(false);
  });
});
