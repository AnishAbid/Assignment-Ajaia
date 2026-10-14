import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";

/**
 * Lightweight mock-auth session.
 *
 * This is intentionally NOT a real auth system (no passwords, no OAuth).
 * The assignment scope calls for "seeded accounts, mocked auth, or a
 * lightweight login flow" — so we seed a handful of users and let the
 * reviewer pick one to "log in" as. The session is a signed cookie
 * (HMAC-SHA256 over the user id) so it can't be trivially edited in the
 * browser dev tools, but there is no password check behind it.
 *
 * Do not reuse this for anything beyond a take-home demo.
 */

const COOKIE_NAME = "docslite_session";
const SECRET = process.env.SESSION_SECRET ?? "dev-only-secret-change-me";

function sign(userId: string): string {
  const mac = createHmac("sha256", SECRET).update(userId).digest("hex");
  return `${userId}.${mac}`;
}

function verify(value: string): string | null {
  const [userId, mac] = value.split(".");
  if (!userId || !mac) return null;
  const expected = createHmac("sha256", SECRET).update(userId).digest("hex");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  return timingSafeEqual(a, b) ? userId : null;
}

export async function createSession(userId: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, sign(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Returns the logged-in user, or null if there is no valid session. */
export async function getCurrentUser() {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const userId = verify(raw);
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user;
}

/** Same as getCurrentUser but throws a 401-flavored error if unauthenticated. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    const err = new Error("Not authenticated") as Error & { status?: number };
    err.status = 401;
    throw err;
  }
  return user;
}
