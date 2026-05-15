import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { root } from "./browser-page.mjs";

const baseUrl = "https://cadmos-finance.github.io/stoken-front";
const pages = [
  "index.html",
  "the-asset.html",
  "how-it-works.html",
  "for-issuers.html",
  "about.html",
  "legal.html"
];
const failures = [];

if (!existsSync(path.join(root, "site/assets/img/social/og-cover.jpg"))) {
  failures.push("expected dedicated OpenGraph image at site/assets/img/social/og-cover.jpg");
}

for (const page of pages) {
  const html = readFileSync(path.join(root, "site", page), "utf8");
  const canonical = `${baseUrl}/${page}`;

  for (const required of [
    `<link rel="canonical" href="${canonical}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${baseUrl}/assets/img/social/og-cover.jpg">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:image" content="${baseUrl}/assets/img/social/og-cover.jpg">`,
    `<meta name="robots" content="index,follow">`,
    `<meta name="theme-color" content="#0d141c">`
  ]) {
    if (!html.includes(required)) {
      failures.push(`${page}: missing ${required}`);
    }
  }

  if (!/<meta name="description" content=".{70,180}">/.test(html)) {
    failures.push(`${page}: expected useful SEO description length`);
  }
  if (!/<meta property="og:title" content="[^"]+">/.test(html)) {
    failures.push(`${page}: expected OpenGraph title`);
  }
  if (!/<meta property="og:description" content="[^"]+">/.test(html)) {
    failures.push(`${page}: expected OpenGraph description`);
  }
}

const robots = readFileSync(path.join(root, "site/robots.txt"), "utf8");
const sitemap = readFileSync(path.join(root, "site/sitemap.xml"), "utf8");
const llms = readFileSync(path.join(root, "site/llms.txt"), "utf8");

if (!robots.includes(`Sitemap: ${baseUrl}/sitemap.xml`)) {
  failures.push("expected robots.txt to reference sitemap");
}
for (const page of pages) {
  if (!sitemap.includes(`<loc>${baseUrl}/${page}</loc>`)) {
    failures.push(`expected sitemap entry for ${page}`);
  }
  if (!llms.includes(`${baseUrl}/${page}`)) {
    failures.push(`expected llms.txt reference for ${page}`);
  }
}
if (!llms.includes("qualified institutional investors")) {
  failures.push("expected llms.txt to preserve institutional investor framing");
}

if (failures.length) {
  console.error(`SEO metadata test failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log("SEO metadata is green.");
