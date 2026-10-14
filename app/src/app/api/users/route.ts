import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-helpers";

/**
 * Lists all seeded users. Used by the login picker and the "share with"
 * dropdown. There is no real user search/invite flow in this scope — the
 * assignment explicitly allows simulating users via seeded accounts.
 */
export const GET = withErrorHandling(async () => {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });
  return NextResponse.json({ users });
});
