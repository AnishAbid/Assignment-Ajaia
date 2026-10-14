import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { withErrorHandling, HttpError } from "@/lib/api-helpers";
import {
  importFileToHtml,
  titleFromFilename,
  UnsupportedFileError,
  MAX_IMPORT_FILE_SIZE_BYTES,
} from "@/lib/import";

/**
 * POST /api/documents/import — multipart/form-data with a single "file"
 * field. Supported types: .txt, .md, .markdown (see src/lib/import.ts).
 * Creates a brand-new document owned by the current user from the file's
 * content; it does not modify any existing document.
 */
export const POST = withErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();

  const form = await req.formData().catch(() => null);
  if (!form) {
    throw new HttpError(400, "Expected multipart/form-data with a 'file' field");
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    throw new HttpError(400, "No file provided");
  }

  if (file.size === 0) {
    throw new HttpError(400, "The uploaded file is empty");
  }
  if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
    throw new HttpError(400, `File is too large. Max size is ${MAX_IMPORT_FILE_SIZE_BYTES / 1024}KB`);
  }

  const rawText = await file.text();

  let html: string;
  try {
    html = importFileToHtml(file.name, rawText);
  } catch (err) {
    if (err instanceof UnsupportedFileError) {
      throw new HttpError(400, err.message);
    }
    throw err;
  }

  const doc = await prisma.document.create({
    data: {
      title: titleFromFilename(file.name),
      ownerId: user.id,
      content: html,
    },
  });

  return NextResponse.json({ document: doc }, { status: 201 });
});
