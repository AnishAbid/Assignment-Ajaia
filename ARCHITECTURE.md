# Architecture note

Docs Lite is a timeboxed product slice of a Google Docs–inspired editor. The goal was a coherent, testable path: **create → edit → save → import → share → persist**, not a clone of every Docs surface.

## What I prioritized

1. **A usable editor, not a toy textarea.** Tiptap + StarterKit gives real bold/italic/underline/headings/lists with keyboard shortcuts. Autosave (~1.2s debounce) plus an explicit save state so reviewers can see writes land without a Save button.
2. **Access control as a first-class model.** Ownership is distinct from sharing. Roles are `OWNER | EDITOR | VIEWER | NONE`, resolved in one pure function (`src/lib/permissions.ts`) and reused by API routes and pages. Non-members get a 404, not a 403, so document existence is not leaked.
3. **Import as a product action.** Uploading a `.txt`/`.md` file creates a *new* document owned by the current user. Markdown maps onto the same formatting the toolbar supports. HTML in uploads is sanitized before persist.
4. **Persistence that matches production.** Postgres (Neon) locally and in prod, rather than SQLite-in-dev / Postgres-in-prod schema drift. Content is stored as sanitized HTML so reopen preserves structure without a custom document format.
5. **Ship-ability.** Mocked login via three seeded accounts. Signed session cookie (HMAC) so the demo cannot be trivially spoofed from DevTools, without building a real identity stack.

## How it is structured

```
Browser (App Router pages + Tiptap)
        │  JSON / multipart
        ▼
Next.js Route Handlers  (/api/auth, /api/documents, /api/documents/import, /api/documents/:id/share)
        │  Prisma
        ▼
PostgreSQL  User · Document · Share
```

- **Pages** are server-rendered and cookie-gated (`requireCurrentUserOrRedirect`).
- **Mutations** go through route handlers with Zod validation and a shared `withErrorHandling` wrapper.
- **Writes** (editor save *and* file import) run through `sanitizeDocumentHtml` so stored HTML cannot contain scripts, iframe, or event handlers.

## Sharing model (deliberately simple)

| Role | View | Edit / rename | Share / delete |
| --- | --- | --- | --- |
| Owner | yes | yes | yes |
| Editor | yes | yes | no |
| Viewer | yes | no | no |

Sharing is user-to-user against seeded accounts (dropdown), not email invites or public links. Re-sharing upserts permission. Revoke is idempotent.

## Storage choice

PostgreSQL via Prisma. The assignment allows SQLite or a file store; I used Postgres because:

- Sharing queries (`owned` vs `shared with me`) are relational.
- Neon is free and matches a Vercel deploy.
- One schema everywhere avoids the classic SQLite-dev / Postgres-prod surprise.

## What I cut, and why

| Cut | Reason |
| --- | --- |
| Real-time collaboration | Needs Yjs/WebSockets and conflict UX; would eat the timebox and still look unfinished. |
| Comments / suggestions | Orthogonal to the core create-edit-share loop. |
| Version history | Persistence of *current* content was the requirement. |
| `.docx` import | Mammoth + style mapping is a project of its own. `.md`/`.txt` prove the product intent. |
| Real auth (OAuth, passwords) | Assignment explicitly allows seeded/mocked auth. |
| Public share links | User-to-user shares demonstrate ownership vs access more clearly. |

## What I would do with another 2–4 hours

1. Presence / last-writer-wins conflict banner (cheap collaboration signal without CRDTs).
2. Markdown export from the editor.
3. Replace mocked login with a real provider (Clerk or Auth.js) while keeping the same share model.
4. Document list search and “last edited by”.
5. Playwright smoke covering login → create → share → switch user.

## Tradeoffs I accepted

- **HTML as the document format** is slightly lossy vs Tiptap JSON, but it is human-inspectable, easy to import/export, and sanitizer-friendly.
- **Debounced autosave is not collaborative.** Two users editing the same doc will overwrite each other. Stated in the UI via role badges; not hidden.
- **Mock auth is not production auth.** The cookie is signed, not encrypted-at-rest with a password. Fine for a reviewer demo; not for real users.
