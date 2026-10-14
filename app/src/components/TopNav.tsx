"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function TopNav({ user }: { user: { id: string; name: string; email: string } }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          📄 Docs Lite
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-black/60 dark:text-white/60">
            Signed in as <strong className="text-black/80 dark:text-white/80">{user.name}</strong>
          </span>
          <Link
            href="/login"
            className="rounded-md border border-black/10 px-3 py-1.5 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
          >
            Switch user
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-md bg-black/80 px-3 py-1.5 text-white hover:bg-black disabled:opacity-50 dark:bg-white/90 dark:text-black dark:hover:bg-white"
          >
            {loggingOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      </div>
    </header>
  );
}
