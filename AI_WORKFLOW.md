# AI workflow note

This project was built in Cursor (Claude) as the primary coding assistant, with the human owning product scope, tradeoffs, and verification.

## Which AI tools I used

- **Cursor agent (Claude)** for scaffolding, implementation, tests, and docs
- **Browser automation in Cursor** to click through login, dashboard, editor, and share UI
- **No other generators** (no Copilot/ChatGPT side sessions, no design-from-screenshot tools)

## Where AI materially sped things up

- Next.js + Prisma + Tiptap boilerplate (routes, schema, session cookie, editor toolbar)
- Consistent API error wrapping and Zod schemas
- Unit tests for the pure access-control module and the import/sanitizer pipeline
- First drafts of README / architecture / this note, which I then tightened against what actually shipped

## What I changed or rejected

- **Prisma 7 + driver adapters.** The assistant first installed Prisma 7, which moved `DATABASE_URL` out of `schema.prisma` and required `@prisma/adapter-pg`. I rejected that for this timebox and pinned Prisma 6 so `prisma db push` / migrate stay conventional.
- **Email-typed share API vs user-id picker.** An early share dialog posted `{ email }`. The API already keyed shares by `userId` against seeded accounts, so I rewired the dialog to a dropdown of demo users instead of pretending we have an invite-by-email product.
- **Cache Components / PPR on by default** in create-next-app 16. Every page reads cookies, so those flags produced runtime prerender errors. I turned them off.
- **Underline via StarterKit alone.** StarterKit does not include underline. I added `@tiptap/extension-underline` explicitly rather than trusting a comment that said it was already included.
- **Volume of UI chrome.** I kept the product sparse (no fake comments panel, no unused settings) even when the assistant offered extra widgets.

## How I verified correctness, UX, and reliability

- **Typecheck:** `npx tsc --noEmit`
- **Lint:** `npx eslint src --max-warnings=0`
- **Unit tests:** `npm test` (role matrix + Markdown/txt import + XSS stripping + unsupported types)
- **API smoke (curl):** login, create, patch, share as editor, 403 on editor-share, 404 for non-members, 401 unauthenticated, revoke, `.md` import, `.pdf` rejected, empty title rejected
- **Browser pass:** login picker, owned vs shared lists, editor toolbar + headings/lists, share dialog, dark-theme contrast on Delete
- **Security-shaped checks:** sanitizer strips `<script>` from Markdown; unsigned cookies cannot be forged without `SESSION_SECRET`; missing access looks like 404

AI wrote most of the first-pass code. I treated it as a fast junior: keep the architecture, rewrite the parts that were wrong (Prisma major, share payload, PPR, underline), and only call it done after the checks above passed.
