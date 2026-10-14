# Submission

Google Drive folder contents (this repo is the source package to zip/upload):

| Item | Location |
| --- | --- |
| Source code | `app/` |
| Local setup / run instructions | `app/README.md` |
| Architecture note | `ARCHITECTURE.md` |
| AI workflow note | `AI_WORKFLOW.md` |
| This file | `SUBMISSION.md` |
| Live product URL | `LIVE_URL.txt` (filled after deploy) |
| Walkthrough video URL | `VIDEO_URL.txt` |
| Sample import file | `sample-import.md` |
| Seeded review accounts | below, and in `app/README.md` |

## Live product

See `LIVE_URL.txt`. If that file still says “pending”, run locally with `app/README.md`.

## Review accounts (no passwords)

Pick one on `/login`:

- **Alice Chen** — `alice@docslite.dev` — owns “Welcome to Docs Lite”
- **Bob Okafor** — `bob@docslite.dev` — Welcome doc is shared with him as **Can edit**
- **Carol Diaz** — `carol@docslite.dev` — owns a private draft; cannot see Alice’s doc until shared

## What is working

- Create / rename / rich-text edit / autosave / reopen
- Import `.txt`, `.md`, `.markdown` (max 1MB) as a new document
- Owner shares with another seeded user (view or edit); owned vs shared lists
- Persistence in Postgres; HTML sanitization on write
- Validation and JSON error handling on API routes
- Automated tests: access control + import/sanitizer

## What is incomplete

- Live Vercel URL may still be pending if deploy login has not been completed in this environment
- Walkthrough video is not recorded (script-ready notes are in `VIDEO_URL.txt`)
- Google Drive upload is left to the submitter (this folder is the package)

## What I would build next (2–4 hours)

See the last sections of `ARCHITECTURE.md`: presence banner, Markdown export, real auth, list search, Playwright smoke.
