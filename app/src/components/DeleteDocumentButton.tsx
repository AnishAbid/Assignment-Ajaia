"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteDocumentButton({ documentId, title }: { documentId: string; title: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setLoading(true);
    const res = await fetch(`/api/documents/${documentId}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      setLoading(false);
      alert("Could not delete document.");
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title="Delete document"
      className="text-black/40 hover:text-red-600 disabled:opacity-50 dark:text-white/40 dark:hover:text-red-400"
    >
      {loading ? "…" : "Delete"}
    </button>
  );
}
