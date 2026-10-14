import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { LoginPicker } from "@/components/LoginPicker";

export default async function LoginPage() {
  const existing = await getCurrentUser();
  if (existing) redirect("/");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">📄 Docs Lite</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          This demo uses mocked auth — no passwords. Pick a seeded account to continue.
        </p>
      </div>
      <LoginPicker />
      <p className="text-center text-xs text-black/40 dark:text-white/40">
        Tip: log in as Alice to see an owned document, or Bob to see one shared with you.
      </p>
    </main>
  );
}
