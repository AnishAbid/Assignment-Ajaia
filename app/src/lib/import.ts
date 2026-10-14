import { marked } from "marked";
import { sanitizeDocumentHtml } from "@/lib/sanitize";

/** File types the upload/import flow accepts. Enforced here AND in the UI. */
export const SUPPORTED_IMPORT_EXTENSIONS = [".txt", ".md", ".markdown"] as const;
export const MAX_IMPORT_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1MB — plenty for text/markdown notes.

export class UnsupportedFileError extends Error {}

function getExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx === -1 ? "" : filename.slice(idx).toLowerCase();
}

/**
 * Turns an uploaded .txt/.md file into editor-ready HTML.
 * - .md / .markdown is parsed as Markdown (headings, bold, lists, etc. map
 *   directly onto the same formatting the editor's toolbar supports).
 * - .txt is treated as plain text: each non-empty line becomes a paragraph,
 *   preserving line breaks without ever executing arbitrary HTML the file
 *   might contain.
 * Output is always run through the same sanitizer used for editor saves.
 */
export function importFileToHtml(filename: string, rawText: string): string {
  const ext = getExtension(filename);
  if (!SUPPORTED_IMPORT_EXTENSIONS.includes(ext as typeof SUPPORTED_IMPORT_EXTENSIONS[number])) {
    throw new UnsupportedFileError(
      `Unsupported file type "${ext || "unknown"}". Supported types: ${SUPPORTED_IMPORT_EXTENSIONS.join(", ")}.`
    );
  }

  let html: string;
  if (ext === ".md" || ext === ".markdown") {
    html = marked.parse(rawText, { async: false }) as string;
  } else {
    html = rawText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => `<p>${escapeHtml(line)}</p>`)
      .join("\n");
  }

  return sanitizeDocumentHtml(html);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Derives a reasonable document title from an uploaded filename. */
export function titleFromFilename(filename: string): string {
  const withoutExt = filename.replace(/\.[^./]+$/, "");
  return withoutExt.trim() || "Imported document";
}
