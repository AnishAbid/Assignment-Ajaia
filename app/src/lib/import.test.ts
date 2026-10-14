import { describe, expect, it } from "vitest";
import { importFileToHtml, titleFromFilename, UnsupportedFileError } from "@/lib/import";

describe("importFileToHtml", () => {
  it("parses Markdown headings, bold text, and lists into HTML", () => {
    const html = importFileToHtml("notes.md", "# Title\n\nSome **bold** text.\n\n- one\n- two");
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<li>one</li>");
    expect(html).toContain("<li>two</li>");
  });

  it("treats .txt as plain text, wrapping non-empty lines as paragraphs", () => {
    const html = importFileToHtml("plain.txt", "First line\n\nSecond line\n   \nThird");
    expect(html).toBe("<p>First line</p>\n<p>Second line</p>\n<p>Third</p>");
  });

  it("escapes HTML special characters in plain text imports so they render as text, not markup", () => {
    const html = importFileToHtml("plain.txt", "<script>alert(1)</script>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("strips disallowed tags from Markdown input (e.g. raw HTML/script) via the sanitizer", () => {
    const html = importFileToHtml("notes.md", "# Hi\n\n<script>alert(1)</script>\n\nSafe text");
    expect(html).not.toContain("<script>");
    expect(html).toContain("Safe text");
  });

  it("rejects unsupported file extensions", () => {
    expect(() => importFileToHtml("resume.pdf", "whatever")).toThrow(UnsupportedFileError);
    expect(() => importFileToHtml("archive.zip", "whatever")).toThrow(/Unsupported file type/);
  });

  it("accepts .markdown as an alias for .md", () => {
    const html = importFileToHtml("notes.markdown", "## Section");
    expect(html).toContain("<h2>Section</h2>");
  });
});

describe("titleFromFilename", () => {
  it("strips the extension to derive a document title", () => {
    expect(titleFromFilename("Q3 Roadmap.md")).toBe("Q3 Roadmap");
    expect(titleFromFilename("notes.txt")).toBe("notes");
  });

  it("falls back to a default title when the filename is empty after stripping", () => {
    expect(titleFromFilename(".md")).toBe("Imported document");
  });
});
