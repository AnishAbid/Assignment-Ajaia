import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";
import { withErrorHandling } from "@/lib/api-helpers";

export const POST = withErrorHandling(async () => {
  await destroySession();
  return NextResponse.json({ ok: true });
});
