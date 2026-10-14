# Development-only Dockerfile for TaleMine.
#
# This is NOT used for production — the live site at talemine.com is
# built and served by Cloudflare (see WORKLOG.md "Project Facts" for the
# exact build/deploy commands). This container exists purely to give a
# consistent, reproducible local dev environment across machines (e.g.
# switching between two laptops) without needing to install Node/npm
# globally on the host.
#
# Note: uses Alpine (musl libc) rather than Debian-slim (glibc). This
# repo's native-binary dependencies (Rolldown via Vite, Tailwind's Oxide
# engine) publish musl-compatible builds, so Alpine works fine for
# `npm run dev` / `npm run build`. `npm run lint` (oxlint) was not
# verified against musl in this setup — if `oxlint` fails inside the
# container, switch the base image to `node:24-slim` (Debian, glibc)
# instead.
FROM node:24-alpine

WORKDIR /app

# Copy only the manifest files first so Docker can cache the
# `npm install` layer and skip re-running it when only source files
# change (not package.json/package-lock.json).
COPY package.json package-lock.json ./
RUN npm install

# The rest of the source is provided via a bind mount in
# docker-compose.yml (see the `volumes` section) rather than copied here,
# so edits on the host are reflected instantly without rebuilding the
# image. This COPY is kept so the image is still runnable standalone
# (e.g. `docker build` + `docker run`) without compose.
COPY . .

EXPOSE 5173

# --host 0.0.0.0 is required so Vite's dev server is reachable from
# outside the container (from the host machine's browser).
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
