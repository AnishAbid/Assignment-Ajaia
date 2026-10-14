import sanitizeHtml from "sanitize-html";

/**
 * Whitelist matches exactly what the Tiptap StarterKit toolbar in this app
 * can produce (bold/italic/underline/strike, headings, paragraphs, lists,
 * blockquote, code). Anything else (scripts, iframes, inline event
 * handlers, arbitrary styles) is stripped. This runs server-side on every
 * write so stored content can never contain executable markup, regardless
 * of whether it came from the editor or a file upload.
 */
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "h1",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
  "hr",
];

export function sanitizeDocumentHtml(html: string): string {
  return sanitizeHtml(html ?? "", {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  });
}
