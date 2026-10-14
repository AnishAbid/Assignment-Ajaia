import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/session";
import { loginSchema } from "@/lib/validation";
import { withErrorHandling, HttpError } from "@/lib/api-helpers";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json().catch(() => null);
  const { userId } = loginSchema.parse(body);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(404, "Unknown user");
  }

  await createSession(user.id);
  return NextResponse.json({ user });
});
