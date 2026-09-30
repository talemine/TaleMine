# TaleMine — Work Log

This file is the shared source of truth for work done on this project across
multiple machines/sessions (multiple OpenCode instances). **Read this file
first**, at the start of every session, before starting new work.

## How to use this file (for any OpenCode instance)

**At the start of a session:**
1. Run `git pull origin develop` (or the current branch below) to get the
   latest code and this log.
2. Read the **Project Facts** section below for environment/config context.
3. Read the most recent entries in **Log** (top of the list) to see what was
   last done and what's still pending.

**At the end of a session (or after any meaningful change):**
1. Add a new entry to the **top** of the **Log** section using the template
   below.
2. `git add -A && git commit -m "..." && git push origin <branch>` — commit
   and push your code changes **and** this updated WORKLOG.md together.
3. If you started work but didn't finish, say so explicitly in the entry
   (e.g. "IN PROGRESS — not pushed" or "blocked on X") so the next session
   knows not to assume it's done/deployed.

**Log entry template:**
```
### YYYY-MM-DD HH:mm (24h, local time) — <short title>
- Branch: <branch worked on>
- Status: Done & pushed | In progress / not pushed | Blocked
- What changed: <files/features>
- Why: <reason/context, e.g. user request>
- Follow-ups / TODO: <anything left for next session>
```

---

## Project Facts (keep this updated if it changes)

- **Repo:** `https://github.com/talemine/TaleMine.git`
- **Production branch:** `develop` (⚠️ NOT `main` — GitHub shows `main` as
  default branch, but Cloudflare deploys from `develop`)
- **Live site:** https://www.talemine.com (Site URL / canonical) and
  https://talemine.com (also works, both serve the same app)
- **Hosting:** Cloudflare (Workers Static Assets flow — Cloudflare merged
  Pages into Workers; deploys are configured, not built manually here)
- **Stack:** React 19 + TypeScript + Vite 8 + Tailwind CSS v4 +
  react-router-dom v7 + Supabase (`@supabase/supabase-js`) + Framer Motion +
  `react-icons/hi2` (Heroicons v2 — use this set for any new icons, for
  consistency)
- **Auth/DB:** Supabase project, env vars in `.env.local`
  (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) — not committed to
  git (see `.gitignore`)
- **i18n:** `src/i18n/en.ts` + `src/i18n/hi.ts`, accessed via
  `useLanguage()` → `t.<section>.<key>`. Language preference is stored per
  user in the `profiles` table (`preferred_language` column) when logged in.
- **Build/verify command:** `npm run build` (runs `tsc -b && vite build`) —
  always run this before pushing to confirm no type errors.
- **Decisions made:**
  - Phone/SMS OTP login — **rejected** for now. Requires a paid SMS provider
    (Twilio/etc.) with per-message cost, plus India TRAI DLT template
    registration for reliable delivery to Indian numbers. Revisit once the
    site has revenue.
  - WhatsApp OTP login — **rejected** for the same reason. Still requires
    Twilio (Supabase only supports WhatsApp via Twilio/Twilio Verify) *plus*
    separate Meta/WhatsApp Business per-conversation fees and template
    approval. Not a cheaper alternative to SMS.
  - Sticking with **email/password auth** (free via Supabase) for now,
    including email-based password reset.

### Supabase Auth → URL Configuration (dashboard settings, already done)
- Site URL: `https://www.talemine.com`
- Redirect URLs allow-list:
  - `http://localhost:5173/**`
  - `https://talemine.com/reset-password`
  - `https://www.talemine.com/reset-password`

### Known gotchas / things to double check before building
- **Coordinate before starting auth/routing work** — this codebase has been
  edited by multiple sessions/people in parallel before (see 2026-09-29
  entry below), causing duplicate/conflicting implementations of the same
  feature. Always `git pull` and check `git log origin/develop` for new
  commits before starting, and again right before pushing.
- `/reset-password` route must stay **outside** `PublicOnlyRoute` — Supabase
  issues a temporary "recovery" session when a user clicks the reset email
  link, and `PublicOnlyRoute` would otherwise redirect them away before they
  can set a new password.
- No `supabase/migrations` folder in this repo — DB schema/triggers live
  directly in the Supabase dashboard, not in version control. If you need to
  know the schema (e.g. `profiles` table columns, triggers on `auth.users`),
  ask the user to check the Supabase dashboard (Table Editor / Database →
  Functions).

---

## Log

### 2026-09-30 17:02 — Add show/hide password + match indicator to Reset Password page
- Branch: `develop`
- Status: Done & pushed (commit `f5ca260`)
- What changed:
  - `src/pages/Auth/ResetPassword.tsx` — added eye icon toggle
    (`HiOutlineEye` / `HiOutlineEyeSlash` from `react-icons/hi2`) on both
    "New Password" and "Confirm Password" fields, independently toggleable.
    Added a live match indicator below Confirm Password: green
    "✓ Passwords match." / red "Passwords do not match." shown once the
    confirm field has content.
  - `src/i18n/en.ts`, `src/i18n/hi.ts` — added `passwordsMatch`,
    `showPassword`, `hidePassword` keys under `auth`.
- Why: User requested eye icon + match confirmation on reset password page.
- Follow-ups / TODO: none. Verified with `npm run build` (no errors).

### 2026-09-30 (earlier) — Investigated "eye icon not showing" report
- Branch: `develop`
- Status: Resolved (see entry above)
- What happened: A previous local session had built a password-reset flow
  (ForgotPassword/ResetPassword pages, eye icon, i18n keys) but **never
  committed/pushed it**. Meanwhile, a *separate* password-recovery
  implementation (different i18n key structure, no eye icon) had been built
  and pushed directly to `develop` by another session
  (commits `9625ea8`, `64a6676`, `63e5d40`, `e62af5f`, authored
  2026-09-28/29). Production (`talemine.com`) was running that version,
  which explains why the eye icon the user was told about wasn't visible
  live.
- Fix: Discarded the stale local uncommitted changes, pulled the real
  `develop` HEAD, and re-applied the eye icon feature on top of the actual
  live `ResetPassword.tsx` implementation (see entry above).
- Lesson: **Always `git pull` before starting work, and check for new
  remote commits before assuming local state matches production.**

### 2026-09-28 / 2026-09-29 — Password recovery flow built (separate session)
- Branch: `develop`
- Status: Done & pushed
- Commits: `9625ea8` (forgot-password link in AuthForm), `64a6676`
  (password recovery routes), `63e5d40` (i18n translations), `e62af5f`
  ("Complete password recovery flow")
- What changed: `src/components/auth/AuthForm.tsx`,
  `src/pages/Auth/ForgotPassword.tsx` (new),
  `src/pages/Auth/ResetPassword.tsx` (new), `src/routes/AppRouter.tsx`,
  `src/i18n/en.ts`, `src/i18n/hi.ts`.
- Notes: Uses `supabase.auth.onAuthStateChange` listening for the
  `PASSWORD_RECOVERY` event to detect a valid recovery session, rather than
  just checking `useAuth()`'s session state directly. Flat i18n key
  structure under `t.auth.*` (e.g. `t.auth.newPassword`,
  `t.auth.resetPasswordTitle`) — not nested under a `resetPasswordPage`
  object.
- This entry reconstructed from git history for context; not logged live
  at the time.

### 2026-09-23 — Security hardening and dependency updates
- Branch: `develop`
- Commit: `fac0bb9`
- What changed: `package.json`, `package-lock.json` dependency bumps.
- Reconstructed from git history.

---

## Earlier project history (pre-log, reconstructed from git for context)

The project started as a Cloudflare Workers/Pages deployment experiment
(landing page), then grew into a full React app with:
- Supabase auth (signup/login), profile management, avatar upload
- Writer dashboard: story + chapter CRUD, publishing controls
- Public story discovery, reader with bookmarks/likes/comments
- Reading progress tracking, library/"continue reading"
- Realtime notifications
- Full Hindi/English i18n across the app

See `git log --oneline` for the full commit history if needed. This
WORKLOG.md starts tracking sessions explicitly from 2026-09-30 onward.
