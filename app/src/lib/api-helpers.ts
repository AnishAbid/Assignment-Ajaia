import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Wraps a route handler so every API route gets the same error shape
 * without repeating try/catch boilerplate: zod validation errors -> 400,
 * HttpError -> its status, auth errors thrown by requireUser() -> 401,
 * anything else -> 500 (logged server-side, generic message to the client).
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof ZodError) {
        return jsonError(400, err.issues.map((i) => i.message).join("; "));
      }
      if (err instanceof HttpError) {
        return jsonError(err.status, err.message);
      }
      const status = (err as { status?: number })?.status;
      if (typeof status === "number") {
        return jsonError(status, (err as Error).message);
      }
      console.error("Unhandled API error:", err);
      return jsonError(500, "Something went wrong. Please try again.");
    }
  };
}
