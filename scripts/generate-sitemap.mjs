// Generates public/sitemap.xml at build time from published stories in
// Supabase. This runs before `vite build` (see package.json "build" script)
// so every deploy has an up-to-date sitemap without manual maintenance.
//
// Uses the same public/anon key as the client app (VITE_SUPABASE_URL /
// VITE_SUPABASE_PUBLISHABLE_KEY from .env.local), so it only ever sees what
// RLS already allows anonymous users to see (i.e. published stories).

import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(rootDir, ".env.local");

  if (!existsSync(envPath)) {
    return {};
  }

  const content = readFileSync(envPath, "utf-8");
  const env = {};

  for (const line of content.split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");

    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim();
    env[key] = value;
  }

  return env;
}

const env = { ...loadEnvLocal(), ...process.env };

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

const SITE_URL = "https://talemine.com";

const STATIC_ROUTES = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/stories", changefreq: "daily", priority: "0.9" },
];

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function fetchPublishedStories() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn(
      "[sitemap] Missing Supabase env vars — generating sitemap with static routes only."
    );
    return [];
  }

  const url = `${SUPABASE_URL}/rest/v1/stories?select=slug,updated_at,published_at&status=eq.published`;

  try {
    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    if (!response.ok) {
      console.warn(
        `[sitemap] Supabase request failed (${response.status}) — generating sitemap with static routes only.`
      );
      return [];
    }

    return await response.json();
  } catch (error) {
    console.warn(
      "[sitemap] Failed to fetch published stories — generating sitemap with static routes only.",
      error
    );
    return [];
  }
}

function buildUrlEntry({ loc, lastmod, changefreq, priority }) {
  const lines = [`  <url>`, `    <loc>${escapeXml(loc)}</loc>`];

  if (lastmod) {
    lines.push(`    <lastmod>${lastmod}</lastmod>`);
  }

  if (changefreq) {
    lines.push(`    <changefreq>${changefreq}</changefreq>`);
  }

  if (priority) {
    lines.push(`    <priority>${priority}</priority>`);
  }

  lines.push(`  </url>`);

  return lines.join("\n");
}

async function main() {
  const stories = await fetchPublishedStories();

  const entries = [
    ...STATIC_ROUTES.map((route) =>
      buildUrlEntry({
        loc: `${SITE_URL}${route.path}`,
        changefreq: route.changefreq,
        priority: route.priority,
      })
    ),
    ...stories.map((story) =>
      buildUrlEntry({
        loc: `${SITE_URL}/story/${story.slug}`,
        lastmod: (
          story.updated_at ??
          story.published_at ??
          new Date().toISOString()
        ).slice(0, 10),
        changefreq: "weekly",
        priority: "0.8",
      })
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`;

  const outPath = path.join(rootDir, "public", "sitemap.xml");
  writeFileSync(outPath, xml, "utf-8");

  console.log(
    `[sitemap] Wrote ${entries.length} URLs to public/sitemap.xml (${stories.length} stories).`
  );
}

main();
