# Docs Lite

A lightweight collaborative document editor (Google Docs–inspired, not a clone). Built as a timeboxed product slice: create/rename/edit documents, import `.txt`/`.md`, share with seeded users, persist everything in Postgres.

Live URL is listed in the repo-root [`SUBMISSION.md`](../SUBMISSION.md).

## What this is (and isn't)

**Working**

- Create, rename, edit, save, reopen documents
- Rich text: bold, italic, underline, strike, H1–H3, bullets, numbered lists, quotes
- Autosave (~1.2s debounce) with a visible save state
- Import `.txt`, `.md`, `.markdown` as a new editable document (max 1MB)
- Owner / editor / viewer sharing with a clear owned vs. shared-with-me distinction
- Persistence in Postgres (Neon in this assignment); formatting stored as sanitized HTML
- Mocked login via three seeded accounts (no passwords)

**Intentionally not built** (see `ARCHITECTURE.md`)

- Real-time multiplayer cursors
- Comments / suggestion mode
- Version history
- PDF/Markdown export
- Real identity (OAuth, passwords, email invites)
- `.docx` import

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Tiptap for the editor
- Prisma 6 + PostgreSQL (Neon)
- Zod validation, `sanitize-html` on every write
- Vitest for unit tests

## Seeded review accounts

No passwords. Pick an account on `/login`.

| Name | Email | What you'll see |
| --- | --- | --- |
| Alice Chen | `alice@docslite.dev` | Owns “Welcome to Docs Lite”, shared with Bob as editor |
| Bob Okafor | `bob@docslite.dev` | Sees the Welcome doc under **Shared with me** (can edit) |
| Carol Diaz | `carol@docslite.dev` | Owns a private draft; cannot see Alice's docs until shared |

Suggested review path:

1. Log in as Alice → open Welcome → Share → grant Carol **Can view**
2. Switch user → Carol → confirm it appears under Shared with me, editor is read-only
3. Switch user → Bob → confirm he can edit (seeded as editor)
4. Upload a `.md` file from the dashboard and confirm it becomes a new document

## Local setup

You need Node 20+ and a Postgres database. This assignment uses a Neon database; `docker-compose.yml` is included if you prefer a local Postgres instead.

```bash
cd app
cp .env.example .env
# Fill DATABASE_URL and SESSION_SECRET
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `SESSION_SECRET` | HMAC secret for the mock-auth session cookie |

`.env` files are gitignored. Never commit credentials.

### Useful scripts

```bash
npm run dev          # local server
npm run build        # production build
npm test             # vitest (permissions + import sanitizer)
npm run db:seed      # re-seed demo users/docs (idempotent for users)
npx prisma migrate deploy
```

## File import limits (shown in the UI)

- **Allowed:** `.txt`, `.md`, `.markdown`
- **Max size:** 1MB
- `.md` is parsed as Markdown then sanitized
- `.txt` is escaped as plain-text paragraphs (HTML in the file is never executed)

## Tests

```bash
npm test
```

Covers access-control role resolution (owner/editor/viewer/none) and the import pipeline (Markdown, plain text, XSS stripping, unsupported types).
