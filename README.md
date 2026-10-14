# TaleMine

A platform for discovering, writing, and sharing stories, rhymes, and tales.

See `WORKLOG.md` for a running log of what's been built, deployed, and
decided on this project — read that first if you're picking this up fresh
or on a different machine.

## Local Development

### Option A: Directly with Node

Requires Node 24 (see `.nvmrc`).

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase credentials
npm run dev
```

Visit http://localhost:5173

### Option B: With Docker (reproducible environment, no local Node install needed)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/)
(or Docker Engine + Compose on Linux).

```bash
docker compose up
```

Visit http://localhost:5173

This runs the exact same `npm run dev` inside a container, so the Node
version and dependencies are identical regardless of what's installed on
your host machine. Source files are bind-mounted, so edits in your editor
are picked up instantly (hot reload works as normal) — no rebuild needed
unless you change `package.json`.

To stop it: `Ctrl+C`, then `docker compose down`.

**Note:** this Docker setup is for local development convenience only.
The live site (talemine.com) is built and deployed by Cloudflare directly
from the `develop` branch — Docker is not involved in production at all.

### Building for production

```bash
npm run build
```

Runs `node scripts/generate-sitemap.mjs && tsc -b && vite build`. Output
goes to `dist/`. (This is also what Cloudflare runs on deploy.)

---


This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
