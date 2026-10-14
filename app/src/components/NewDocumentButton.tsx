"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewDocumentButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createDocument() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/documents", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create document");
      router.push(`/documents/${data.document.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create document");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={createDocument}
        disabled={loading}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/90"
      >
        {loading ? "Creating…" : "+ New document"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
