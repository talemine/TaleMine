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
- **Live site:** https://www.talemine.com is the **canonical** host.
  `https://talemine.com` (non-www) now 301-redirects to `www` via a
  Cloudflare Redirect Rule ("Redirect apex to www", deployed 2026-10-05,
  dashboard-only — not in this repo). All new code should use
  `www.talemine.com` in any hardcoded URLs.
- **Google Analytics 4:** Measurement ID `G-JEVGH041Z0`, wired via
  `src/components/analytics/Analytics.tsx`. Manually tracks page views on
  route change (required for SPA — gtag's automatic page_view doesn't
  fire on client-side navigation).
- **Google Search Console:** verification meta tag added to `index.html`
  (2026-10-05) — user still needs to click "Verify" in the Search Console
  UI, then we need to submit the sitemap once verified.
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
- **Build/verify command:** `npm run build` — now runs
  `node scripts/generate-sitemap.mjs && tsc -b && vite build`. The sitemap
  script fetches published stories from Supabase and regenerates
  `public/sitemap.xml` fresh on every build (file is gitignored — it's
  build output, not source). Always run `npm run build` before pushing to
  confirm no type errors AND that the sitemap generates correctly.
- **Cloudflare build config (confirmed with user, 2026-09-30):**
  Build command: `npm run build` · Deploy command: `npx wrangler deploy` ·
  Version command: `npx wrangler deploy`. Confirmed the sitemap generation
  step runs on every deploy, since Cloudflare uses `npm run build` (not
  bare `vite build`).
- **Contact email for legal pages / support:** `info.talemine@gmail.com`
  (used in Privacy Policy and Terms of Service "Contact Us" sections).
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

### 2026-10-05 — Closed: Cloudflare apex→www redirect, Search Console verification
- Branch: `develop`
- Status: Done & pushed (commit `5359bd0`); Cloudflare redirect rule also
  deployed and confirmed working.
- What changed:
  - **`index.html`** — added
    `<meta name="google-site-verification" content="urq5o3LT6EW1rm1kLwaV51wxfK9Q-qE2tXPkqWydLkw" />`
    for the Search Console property on `https://www.talemine.com`.
    **User still needs to click "Verify" in Search Console** after this
    deployed (not something I can do — needs the user's Google account).
  - **Cloudflare Redirect Rule deployed** (dashboard-only change, not in
    this repo): "Redirect apex to www" — `talemine.com/*` → 301 →
    `www.talemine.com/*`, with "Preserve query string" enabled.
    ⚠️ **Gotcha hit during setup:** the UI's "Redirect from root to WWW"
    template, when using **Wildcard pattern** matching, pre-filled the
    Target URL as `https://www.talemine.com/*` (bare asterisk) — this
    does NOT substitute the captured path; Cloudflare sent back a literal
    `Location: https://www.talemine.com/*` on every request (confirmed via
    curl). **Fix:** Target URL must use the explicit capture-group syntax
    `https://www.talemine.com/${1}` instead of a bare `*`. After this
    fix, verified via curl that `/`, `/stories`, and
    `/stories?category=moral-tales` all redirect correctly with path and
    query string preserved, and that `www.talemine.com` itself still
    returns 200 (no redirect loop).
  - **If this rule ever needs re-creating** (e.g. zone migration): don't
    trust the auto-filled Target URL from Cloudflare's "Redirect from root
    to WWW" template as-is when using Wildcard pattern matching — always
    verify/replace the target's `*` with `${1}`, and curl-test with a
    non-root path before considering it done.
- Resolves the two outstanding items from the 2026-09-30 21:00 entry
  below (Cloudflare redirect + Search Console verification tag). Sitemap
  submission to Search Console still pending — do this after the user
  confirms verification succeeded.

### 2026-09-30 21:00 — Canonical host decision + Google Analytics 4
- Branch: `develop`
- Status: Done & pushed (commits `b3a8678`, `50918b4`); one manual
  Cloudflare step still outstanding (see below)
- Context: Continuing the site review — moved to canonical URL cleanup and
  analytics setup. User said "your choice, although we need to complete
  all one by one" re: remaining items (canonical host, GA/Search Console,
  SSR/SSG discussion).
- **Canonical host → `www.talemine.com`** (user chose this, matches
  existing Supabase Site URL config):
  - Updated `SITE_URL` in `src/components/seo/SEO.tsx` and
    `scripts/generate-sitemap.mjs` from `https://talemine.com` to
    `https://www.talemine.com`.
  - Updated static fallback tags in `index.html` (canonical, OG, Twitter)
    to use `www`.
  - Updated `public/robots.txt` sitemap directive to `www`.
  - Updated the JSON-LD `url` field in `src/pages/Story/StoryPage.tsx` to
    `www` (was still hardcoded to non-www, missed in the earlier SEO pass).
  - ⚠️ **USER ACTION STILL NEEDED:** Code now assumes `www` is canonical,
    but **both `talemine.com` and `www.talemine.com` still resolve
    independently** (confirmed via curl — both return 200 with identical
    content). This is a Cloudflare DNS/zone-level setting, not something
    fixable from the codebase. User needs to add a **Cloudflare Redirect
    Rule** (Cloudflare Dashboard → talemine.com zone → Rules → Redirect
    Rules): if `http.host eq "talemine.com"` → redirect (301) to
    `concat("https://www.talemine.com", http.request.uri.path)`. Until
    this is done, Google may still see both hosts as separately
    crawlable/indexable despite the canonical tags.
- **Google Analytics 4** — user created a GA4 property, provided
  Measurement ID `G-JEVGH041Z0`.
  - **`src/components/analytics/Analytics.tsx`** (new) — loads gtag.js
    once (via plain `<script>` injection, not react-helmet, since it needs
    imperative control over `window.dataLayer`/`window.gtag`), then sends
    a manual `page_view` event on every `useLocation()` change. This is
    necessary because gtag's own automatic page_view only fires once on
    initial script load — without manual tracking, GA would see every
    visitor as a single-page view no matter how many story
    pages/chapters they actually read. `send_page_view: false` is set in
    the initial `gtag("config", ...)` call to disable the automatic one
    and avoid double-counting the first page view.
  - **`src/routes/AppRouter.tsx`** — mounted `<Analytics />` inside
    `<BrowserRouter>` (alongside the existing `<ScrollManager />`), so it
    can use `useLocation()`.
  - **`src/pages/Legal/PrivacyPolicy.tsx`** — updated the Analytics section
    from conditional language ("if we enable Google Analytics...") to
    factual ("We use Google Analytics..."), since it's now actually live.
    Added a link to Google's official opt-out browser add-on.
  - Measurement ID `G-JEVGH041Z0` is hardcoded as a constant in
    `Analytics.tsx` (not an env var) — GA measurement IDs are not secret
    (they're visible in every page's network requests/HTML anyway), so no
    need to treat it as sensitive config.
- **Search Console — in progress, waiting on user.** Asked user to create
  a Search Console property for `https://www.talemine.com` (URL prefix
  method) and provide the HTML verification tag's `content="..."` value.
  Not yet received as of this entry — next session/continuation should
  pick this up: add the `<meta name="google-site-verification" ...>` tag
  to `index.html` once the code is provided, then after deploy, user
  clicks "Verify" in Search Console, then submit
  `https://www.talemine.com/sitemap.xml` as a sitemap in Search Console.
- Verified with `npm run build` after each change (no errors).

### 2026-09-30 20:00 — Performance fixes: code splitting, vendor chunking, lazy video, lazy images
- Branch: `develop`
- Status: Done & pushed (commits `d091543`, `54d932c`, `1caaac6`)
- Context: Continuing the site review from earlier today — moved from
  SEO/AdSense blockers to performance (Core Web Vitals affect both SEO
  ranking and bounce rate, which matters for ad revenue).
- What changed:
  - **`src/routes/AppRouter.tsx`** — converted every route except
    `LandingPage` (kept eager, since it's the entry point most visitors/
    shared links land on) to `React.lazy()` + a single `<Suspense>`
    boundary wrapping all routes, with a simple "Loading..." fallback.
    Also removed a leftover dead/duplicate empty `<Routes>` block at the
    bottom of the file from earlier work.
  - **`vite.config.ts`** — added `build.rollupOptions.output.manualChunks`
    to split `react`/`react-dom`/`react-router-dom` → `vendor-react`,
    `@supabase/supabase-js` → `vendor-supabase`, `framer-motion` →
    `vendor-motion` into their own cacheable chunks, separate from app
    code. Note: Vite 8 (Rolldown-based) only accepts the **function** form
    of `manualChunks` (`(id: string) => ...`), not the plain object-map
    form that older Vite/Rollup docs show — object form threw a TS error.
  - **Result:** main JS bundle dropped from 837 KB → 176 KB (gzip
    221 KB → 47 KB) for the initial load. Vendor libs (~517 KB combined)
    now cache independently across deploys — a future app-code-only commit
    won't force visitors to re-download React/Supabase/Framer Motion.
    Route chunks (Login, SignUp, Account, StoryEditor, etc.) are now
    13 separate small files (1–25 KB each) fetched only when visited.
  - **`src/pages/Landing/components/Hero.tsx`** — hero video no longer
    loads eagerly on first paint. Added an `IntersectionObserver` that
    only sets `shouldLoadVideo=true` (mounting the actual `<video>` with
    `preload="none"`) once the hero section scrolls within 200px of the
    viewport; renders the existing (previously-unused) `src/assets/hero.png`
    as a static poster/fallback image until then.
    ⚠️ Note: `hero.png` is 343×361 (not a true 16:9 match for the video's
    aspect ratio) — it's the only still image available for this purpose.
    Could not compress/re-encode the actual `talemine-hero.mp4` (still
    1.19 MB) or extract a proper poster frame from it — no `ffmpeg`
    available in this environment, and the `ffmpeg-static` npm package's
    downloaded binary would not execute here (`ResourceUnavailable`, likely
    sandbox/AV restriction). **Follow-up:** if possible, compress
    `talemine-hero.mp4` externally (e.g. HandBrake, or
    `ffmpeg -vf scale=-2:720 -crf 28` locally on your machine) and/or
    export a proper 16:9 poster frame from the video to replace
    `hero.png`.
  - **`src/components/story/PublicStoryCard.tsx`**,
    **`src/pages/Stories/Stories.tsx`** (story grid + continue-reading
    list images) — added `loading="lazy"`, `decoding="async"`, and
    explicit `width`/`height` attributes to prevent layout shift (CLS) and
    defer offscreen image downloads.
  - **`src/pages/Story/StoryPage.tsx`** — added explicit `width`/`height`
    to the main story cover image (kept eager/no lazy-load here
    deliberately, since it's the primary above-the-fold content image on
    that page, not a list thumbnail).
- Verified with `npm run build` after each change (no errors; final build
  shows no more "chunk larger than 500 kB" warning, which was present
  before this work).

### 2026-09-30 19:00 — Closed follow-ups from SEO foundations: email, Cloudflare build, OG image
- Branch: `develop`
- Status: Done & pushed (commit `cb1b819`), one item still needs user action
- What changed:
  - `src/pages/Legal/PrivacyPolicy.tsx`, `src/pages/Legal/Terms.tsx` —
    replaced placeholder `contact@talemine.com` with real
    `info.talemine@gmail.com` in both the "Contact Us" `mailto:` links and
    display text.
  - **Confirmed with user:** Cloudflare build command is `npm run build`,
    deploy/version commands are `npx wrangler deploy` — so the sitemap
    generation step (added in the previous entry) **does** run on every
    production deploy. No code change needed, just confirmation — resolved
    the "unconfirmed" flag from the previous entry. See updated Project
    Facts section above.
  - Explained to user what an OG (Open Graph) image is and the required
    spec: 1200×630 px, PNG/JPG, under ~1MB, should include TaleMine
    branding/tagline in site colors. **Still outstanding** — no OG image
    has been created yet. Code already references
    `https://talemine.com/og-image.png` (in `index.html` and `SEO.tsx`'s
    `DEFAULT_IMAGE`), so social shares will show a broken/missing image
    until the user creates this file and places it at
    `public/og-image.png`. This is a design/content task, not something I
    can generate — flagged as the one remaining follow-up.
- Verified with `npm run build` (no errors).

### 2026-09-30 18:30 — SEO foundations: meta tags, sitemap, robots.txt, privacy/terms pages
- Branch: `develop`
- Status: Done & pushed (commit `9ae1657`)
- Context: User asked for a full site review to make it "most demanding"
  (i.e. maximize growth/SEO/AdSense-readiness). Full findings written up in
  chat — see that conversation for the complete prioritized list (critical/
  high/medium). This entry covers the first batch of fixes: SEO + AdSense
  blockers.
- What changed:
  - **`index.html`** — replaced generic `<title>talemine</title>` with real
    title, meta description, canonical tag, Open Graph tags, Twitter card
    tags (static fallback for crawlers that don't run JS, e.g. before React
    hydrates, or if JS fails).
  - **`src/components/seo/SEO.tsx`** (new) — reusable component using
    `react-helmet-async` for per-page `<title>`, meta description,
    canonical URL, OG/Twitter tags, and optional JSON-LD structured data.
    Added `react-helmet-async` dependency.
  - **`src/main.tsx`** — wrapped app in `<HelmetProvider>`.
  - Added `<SEO>` to: `LandingPage.tsx`, `Stories.tsx`, `StoryPage.tsx`
    (dynamic title/description from story data + JSON-LD `CreativeWork`
    schema with author), `StoryChapterPage.tsx` (dynamic chapter title),
    `Login.tsx` and `SignUp.tsx` (both set `noIndex` — no SEO value in
    indexing auth pages).
  - **`scripts/generate-sitemap.mjs`** (new) — Node script that fetches all
    `status=published` stories from Supabase (via public anon key, same as
    client — respects RLS) and writes `public/sitemap.xml` with static
    routes (`/`, `/stories`) + one `<url>` per published story. Runs via
    `package.json` `build` script: `node scripts/generate-sitemap.mjs &&
    tsc -b && vite build`. `public/sitemap.xml` added to `.gitignore` since
    it's build output, not source — same as `dist/`.
  - **`public/robots.txt`** (new) — `Allow: /` + `Sitemap:` directive
    pointing to `https://talemine.com/sitemap.xml`.
  - **`src/pages/Legal/PrivacyPolicy.tsx`** and **`Terms.tsx`** (new) —
    routes `/privacy-policy` and `/terms`. AdSense requires a Privacy
    Policy to approve a site at all, so this was a hard blocker, not just
    nice-to-have. Content covers: what data we collect (confirmed from
    actual code — Supabase auth/profile fields, reading progress, etc.),
    cookies, planned Google Analytics + Google AdSense cookie usage,
    children's privacy note (relevant since TaleMine publishes children's
    content), data sharing (Supabase/Cloudflare/Google), user rights,
    contact. **English only for now** — legal text wasn't translated to
    Hindi to avoid translation-accuracy risk; flagged as a follow-up if the
    user wants bilingual legal pages later.
  - **`src/components/layout/Footer.tsx`** — added Privacy Policy / Terms
    links (site-wide, since Footer renders in `AppLayout`).
  - **`src/routes/AppRouter.tsx`** — registered `/privacy-policy` and
    `/terms` routes (public, not inside any auth guard).
- Known placeholders / follow-ups needed from user:
  - **Contact email** in Privacy Policy / Terms is a placeholder
    (`contact@talemine.com`) — user said to use a placeholder for now and
    update later. **Needs real inbox before going live with this.**
  - **OG image** (`https://talemine.com/og-image.png`) referenced in
    `index.html` and `SEO.tsx`'s default — **this file does not exist
    yet**. No ready-made 1200×630 social preview image was found in
    `Media/` or `src/assets/`. Social shares (Facebook/WhatsApp/Twitter)
    will currently show a broken image until this is created and placed at
    `public/og-image.png`.
  - **Cloudflare build command unconfirmed** — see Project Facts note
    above. If Cloudflare's dashboard build command is just `vite build`
    (not `npm run build`), the sitemap generation step will be skipped on
    deploy and `sitemap.xml` won't exist in production. **User should
    check Cloudflare dashboard → Workers & Pages → talemine → Settings →
    Build & deployments** and confirm/update the build command to
    `npm run build`.
  - User confirmed: TaleMine is operated as an individual (not yet a
    registered business entity) — Terms/Privacy Policy don't name a
    specific company for this reason.
- Verified with `npm run build` (sitemap generated successfully: "Wrote 5
  URLs to public/sitemap.xml (3 stories)", no TS/build errors).

### 2026-09-30 17:50 — Make TaleMine logo clickable to homepage
- Branch: `develop`
- Status: Done & pushed (commit `d991ce6`)
- What changed:
  - `src/components/ui/Logo.tsx` — changed from a plain `<h1>` to a
    `react-router-dom` `<Link to="/">` wrapping the "TaleMine" text, with
    `aria-label="TaleMine home"`. Used in `Navbar.tsx`, so this applies
    site-wide (every page that renders `AppLayout`/`Navbar`).
- Why: User asked for clicking the logo to redirect to the homepage.
- Bonus fix: This also resolves a latent SEO issue — `Hero.tsx` (rendered
  on the Landing page) already has its own `<h1>`, so the Navbar's Logo
  also being an `<h1>` meant **two `<h1>` elements on the homepage**, which
  hurts SEO/heading hierarchy. Logo is now a `<Link>`, not a heading
  element, so this is fixed too.
- Verified with `npm run build` (no errors).

### 2026-09-30 17:40 — User confirmed: all 3 eye icons working correctly in production
- Branch: `develop`
- Status: Confirmed working on live site (talemine.com) by user.
- Confirms: Login/Signup password field (commit `07d7bb2`), Reset Password
  "New Password" field, and Reset Password "Confirm Password" field
  (commit `f5ca260`) — all three show/hide toggles are visible and
  functional in production.
- Resolves the "unconfirmed" follow-up from the 17:15 entry below — the
  earlier report was indeed a stale browser cache, not a real deployment
  bug. No further action needed on this task.

### 2026-09-30 17:30 — Add show/hide password eye icon to Login/Signup form
- Branch: `develop`
- Status: Done & pushed (commit `07d7bb2`)
- What changed:
  - `src/components/auth/AuthForm.tsx` — added eye icon toggle
    (`HiOutlineEye` / `HiOutlineEyeSlash`) to the password field, shared by
    both Login and SignUp pages (since they both render `<AuthForm>`).
    Reused existing `t.auth.showPassword` / `t.auth.hidePassword` i18n keys
    (already added earlier for the reset-password page) — no new i18n
    strings needed.
  - Wrapped input + toggle button in a `relative` div (input's outer `<div>`
    didn't have `relative` positioning, which the absolutely-positioned eye
    button needs — same pattern as ResetPassword.tsx).
- Why: User asked for the same show-password eye icon on the login page.
- Verified with `npm run build` (no errors).

### 2026-09-30 17:15 — Investigated "eye icon not working" report on reset-password (from email link)
- Branch: `develop`
- Status: Investigated — code confirmed correctly deployed; likely a
  browser-cache issue on the user's end, not a real bug.
- What I did: Since the user can only trigger the Supabase password-reset
  email twice per hour (rate limit), I avoided burning a test attempt and
  instead fetched the **actual live production JS bundle** from
  `https://www.talemine.com/reset-password` and searched the minified
  source directly for the eye-toggle logic and icon SVGs.
- Findings: Confirmed the eye-toggle `<button>` elements, `onClick` state
  toggles, `aria-label`s, and the Heroicons eye/eye-slash SVG path data are
  **all present and correctly wired** in the deployed bundle (verified via
  `en.ts`/`hi.ts` translated strings `showPassword`/`hidePassword` and the
  React component render calls around them). So the code that's live is
  correct.
- Conclusion given to user: most likely a stale browser cache showing the
  previous JS bundle; asked them to hard-refresh (Ctrl+Shift+R) or use an
  incognito window before spending another rate-limited test email.
- Follow-ups / TODO: **Unconfirmed** — waiting on user to retest with a
  cache-busted browser and report back whether the icon is now visible. If
  it's still not visible after a hard refresh, the issue may be something
  only reproducible from a real email client webview (e.g. Gmail's in-app
  browser) rather than a normal browser — would need more detail from user
  (which device/browser/email client they're viewing it in) to diagnose
  further.

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
