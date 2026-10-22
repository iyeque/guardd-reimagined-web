/**
 * Generates public/sitemap.xml.
 *
 * Wired to `prebuild`, so it runs on every deploy and the URL list cannot go
 * stale. Workshop URLs are read from src/data/workshops.ts — the same file the
 * app routes on — rather than being duplicated here.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = process.env.SITE_ORIGIN ?? "https://digitalguardianwellness.org";

/**
 * Public routes only. Deliberately absent: the redirect aliases
 * (/privacy, /terms, /screen-time-management, /family-digital-agreements), which
 * would be duplicate content; /admin, which is not for indexing; and /transfer,
 * which is a per-device utility with nothing to rank for.
 */
const PAGES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/screen-time", priority: "0.9", changefreq: "monthly" },
  { path: "/family-agreements", priority: "0.9", changefreq: "monthly" },
  { path: "/family-commitments", priority: "0.9", changefreq: "monthly" },
  { path: "/workshops", priority: "0.8", changefreq: "weekly" },
  { path: "/workshop", priority: "0.8", changefreq: "weekly" },
  { path: "/course", priority: "0.8", changefreq: "monthly" },
  { path: "/blog", priority: "0.8", changefreq: "weekly" },
  { path: "/videos", priority: "0.7", changefreq: "weekly" },
  { path: "/community", priority: "0.7", changefreq: "weekly" },
  { path: "/games", priority: "0.6", changefreq: "monthly" },
  { path: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms-of-service", priority: "0.3", changefreq: "yearly" },
  { path: "/cookie-policy", priority: "0.3", changefreq: "yearly" },
];

/**
 * Top-level workshop ids.
 *
 * Matched at the shallowest indentation present in the file, so reformatting
 * workshops.ts cannot silently drop every workshop URL — and the module-level
 * `id: string` declarations never match, because they carry no quotes.
 */
function workshopIds() {
  const src = readFileSync(join(ROOT, "src/data/workshops.ts"), "utf8");
  const matches = [...src.matchAll(/^(\s*)id:\s*"([^"]+)"/gm)];
  if (matches.length === 0) return [];
  const indent = Math.min(...matches.map((m) => m[1].length));
  return matches.filter((m) => m[1].length === indent).map((m) => m[2]);
}

const workshops = workshopIds();
if (workshops.length === 0) {
  console.warn(
    "[sitemap] no workshop ids found in src/data/workshops.ts — " +
      "the sitemap will list the static routes only",
  );
}

const today = new Date().toISOString().slice(0, 10);

const entries = [
  ...PAGES,
  ...workshops.map((id) => ({
    path: `/workshop/${id}`,
    priority: "0.7",
    changefreq: "monthly",
  })),
];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries.map((e) =>
    [
      "  <url>",
      `    <loc>${ORIGIN}${e.path}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${e.changefreq}</changefreq>`,
      `    <priority>${e.priority}</priority>`,
      "  </url>",
    ].join("\n"),
  ),
  "</urlset>",
  "",
].join("\n");

mkdirSync(join(ROOT, "public"), { recursive: true });
writeFileSync(join(ROOT, "public/sitemap.xml"), xml, "utf8");

console.log(
  `[sitemap] wrote public/sitemap.xml — ${entries.length} urls ` +
    `(${PAGES.length} static + ${workshops.length} workshops)`,
);
