"use client";

import { useEffect, useMemo, useState } from "react";

type User = { id: string; name: string; email: string };
type Share = { id: string; permission: "VIEW" | "EDIT"; user: User };

export function ShareDialog({
  documentId,
  ownerId,
  onClose,
}: {
  documentId: string;
  ownerId: string;
  onClose: () => void;
}) {
  const [allUsers, setAllUsers] = useState<User[] | null>(null);
  const [shares, setShares] = useState<Share[] | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [permission, setPermission] = useState<"VIEW" | "EDIT">("VIEW");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadShares() {
    const res = await fetch(`/api/documents/${documentId}/share`);
    const data = await res.json();
    if (res.ok) setShares(data.shares);
  }

  useEffect(() => {
    // Fetch-on-mount is the deliberate pattern here (no caching layer in
    // scope for this demo) — both calls fire once when the dialog opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadShares();
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setAllUsers(data.users))
      .catch(() => setError("Could not load demo accounts."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sharedUserIds = useMemo(() => new Set((shares ?? []).map((s) => s.user.id)), [shares]);
  // Only offer users who don't already have access, and never offer the
  // owner themselves (the API also rejects this, but filtering it out here
  // keeps the dropdown from showing a confusing self-share option).
  const shareableUsers = (allUsers ?? []).filter((u) => u.id !== ownerId && !sharedUserIds.has(u.id));
  // Derived default (no effect needed): pick the explicit selection if the
  // user made one and it's still valid, otherwise fall back to the first
  // shareable user.
  const effectiveUserId =
    selectedUserId && shareableUsers.some((u) => u.id === selectedUserId)
      ? selectedUserId
      : (shareableUsers[0]?.id ?? "");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!effectiveUserId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${documentId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: effectiveUserId, permission }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not share document");
      setSelectedUserId("");
      await loadShares();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not share document");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRevoke(userId: string) {
    await fetch(`/api/documents/${documentId}/share?userId=${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });
    await loadShares();
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Share document</h2>
          <button onClick={onClose} className="text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleAdd} className="mb-4 flex flex-col gap-2">
          <label className="text-xs font-medium text-black/60 dark:text-white/60">
            Add a seeded demo account
          </label>
          {shareableUsers.length === 0 && allUsers !== null ? (
            <p className="text-sm text-black/40">Everyone already has access.</p>
          ) : (
            <div className="flex gap-2">
              <select
                value={effectiveUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="min-w-0 flex-1 rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-neutral-900"
              >
                {shareableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value as "VIEW" | "EDIT")}
                className="rounded-md border border-black/15 px-2 py-2 text-sm dark:border-white/20 dark:bg-neutral-900"
              >
                <option value="VIEW">Can view</option>
                <option value="EDIT">Can edit</option>
              </select>
            </div>
          )}
          <button
            type="submit"
            disabled={submitting || !effectiveUserId}
            className="self-end rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {submitting ? "Sharing…" : "Share"}
          </button>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </form>

        <div>
          <p className="mb-2 text-xs font-medium text-black/60 dark:text-white/60">People with access</p>
          {shares === null ? (
            <p className="text-sm text-black/40">Loading…</p>
          ) : shares.length === 0 ? (
            <p className="text-sm text-black/40">Only you have access right now.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {shares.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate">
                    {s.user.name} <span className="text-black/40">({s.user.email})</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs dark:bg-white/10">
                      {s.permission === "EDIT" ? "Can edit" : "Can view"}
                    </span>
                    <button
                      onClick={() => handleRevoke(s.user.id)}
                      className="text-xs text-black/40 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
