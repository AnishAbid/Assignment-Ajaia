import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

/** For server components/pages: redirects to /login if no session exists. */
export async function requireCurrentUserOrRedirect() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
