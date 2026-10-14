# Walkthrough video — script + shot list (3–5 min)

Record this as an unlisted Loom or YouTube. Speak in first person. Target **~4:00**.

## 0:00–0:25 — What this is

**On screen:** login page (`/login`)

> “This is Docs Lite, a timeboxed slice of a Google Docs–style editor. I did not try to rebuild Docs. I shipped document CRUD, a real rich-text editor with autosave, file import, and a working share model on Postgres.”

## 0:25–1:10 — Create + edit

**On screen:** click Alice → dashboard → open “Welcome to Docs Lite”

> “Auth is mocked with three seeded accounts so reviewers can demonstrate sharing in under a minute — no passwords. Alice owns this welcome doc. Toolbar supports bold, italic, underline, headings, and lists. Changes autosave after a short debounce; you can see the save state in the header.”

**Do:** toggle bold on a word, add a bullet, wait for “Saved”.

## 1:10–1:50 — Import

**On screen:** back to dashboard → Upload .txt / .md → pick a small `.md` file

> “File handling is import-into-workflow, not an attachment dump. Supported types are `.txt`, `.md`, and `.markdown`, called out in the UI and README. Markdown becomes a new editable document with headings and lists preserved. Anything else is rejected with a clear error.”

## 1:50–3:10 — Sharing (the core demo)

**On screen:** Share dialog on the Welcome doc

> “Only the owner can share. I can grant view or edit to another seeded user.”

**Do:** share with Carol as **Can view**. Then Switch user → Carol.

> “Carol now sees it under Shared with me, with a Can view badge. The editor is read-only — toolbar gone, title locked.”

**Do:** Switch user → Bob.

> “Bob was seeded as an editor, so this same doc appears under Shared with me with Can edit, and the toolbar is back. Owned vs shared is a first-class split on the dashboard, not a filter buried in settings.”

## 3:10–3:50 — What I cut, and why

**On screen:** dashboard, talking-head or still

> “I deliberately skipped realtime cursors, comments, version history, and `.docx` import. Under a 4–6 hour cap those become shallow checkboxes. I spent the time on access control that actually 404s strangers, sanitizes HTML on write, and has unit tests around the permission matrix.”

## 3:50–4:20 — AI usage (short)

> “I used Cursor as a coding assistant. It sped up the Tiptap shell and test cases. I rejected Prisma 8 RC that npm `latest` installed, pinned 6.19.3, and refused a destructive migrate reset against Neon. Verification was `tsc`, production build, 17 unit tests, and curl + browser passes against the real database.”

## 4:20 — Close

> “Setup is in the README. Live URL and the three test accounts are in SUBMISSION.md. Thanks.”

## Shot checklist

- [ ] Login picker with three accounts
- [ ] Alice dashboard (owned vs empty shared)
- [ ] Editor toolbar + autosave
- [ ] Share dialog (view vs edit)
- [ ] Carol read-only
- [ ] Bob can-edit
- [ ] Upload `.md`
- [ ] Mention live URL aloud
