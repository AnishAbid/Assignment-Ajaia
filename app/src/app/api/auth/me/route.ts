import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { withErrorHandling } from "@/lib/api-helpers";

export const GET = withErrorHandling(async () => {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
});
