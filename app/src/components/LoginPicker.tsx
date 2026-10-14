"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = { id: string; name: string; email: string };

export function LoginPicker() {
  const router = useRouter();
  const [users, setUsers] = useState<User[] | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users))
      .catch(() => setError("Could not load demo accounts."));
  }, []);

  async function login(userId: string) {
    setPendingId(userId);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Login failed");
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setPendingId(null);
    }
  }

  if (error) {
    return <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>;
  }

  if (!users) {
    return <p className="text-center text-sm text-black/50">Loading accounts…</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {users.map((u) => (
        <button
          key={u.id}
          onClick={() => login(u.id)}
          disabled={pendingId !== null}
          className="flex items-center justify-between rounded-lg border border-black/10 px-4 py-3 text-left hover:bg-black/5 disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/10"
        >
          <span>
            <span className="block font-medium">{u.name}</span>
            <span className="block text-xs text-black/50 dark:text-white/50">{u.email}</span>
          </span>
          <span className="text-sm text-black/40">
            {pendingId === u.id ? "Signing in…" : "Continue →"}
          </span>
        </button>
      ))}
    </div>
  );
}
