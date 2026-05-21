import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { root } from "./browser-page.mjs";

// All 5 hero-bearing pages now use the same perfect-loop video. The homepage
// starts at 0:00; each section page has its own deterministic offset so the
// site has cross-page identity without random per-visit drift.
const heroVideo = "assets/video/stoken-hero-loop.mp4";
const pages = [
  { file: "index.html",         start: "0",  selector: ".hero__video" },
  { file: "the-asset.html",     start: "4",  selector: ".page-head__video" },
  { file: "how-it-works.html",  start: "8",  selector: ".page-head__video" },
  { file: "for-issuers.html",   start: "12", selector: ".page-head__video" },
  { file: "about.html",         start: "16", selector: ".page-head__video" }
];

const failures = [];
const styles = readFileSync(path.join(root, "site/assets/css/styles.css"), "utf8");
const pageHeadBlock = styles.match(/\.page-head\s*\{[\s\S]*?\n\}/)?.[0] || "";
const pageHeadVideoBlock = styles.match(/\.page-head__video\s*\{[\s\S]*?\n\}/)?.[0] || "";
const pageHeadActiveVideoBlock = styles.match(/\.page-head__video\.is-active\s*\{[\s\S]*?\n\}/)?.[0] || "";

if (!/min-height:\s*clamp\(760px, 100vh, 1040px\);/.test(pageHeadBlock)) {
  failures.push("expected subpage heroes to use the standing min-height rhythm");
}
if (!/padding:\s*180px 0 100px;/.test(pageHeadBlock)) {
  failures.push("expected subpage heroes to keep the standing bottom padding rhythm");
}
if (!/object-position:\s*center center;/.test(pageHeadVideoBlock)) {
  failures.push("expected subpage hero videos to remain centered inside the hero band");
}
if (!/opacity:\s*0\.94;/.test(pageHeadActiveVideoBlock)) {
  failures.push("expected active subpage hero videos to read clearly under any overlay");
}

if (!existsSync(path.join(root, "site", heroVideo))) {
  failures.push(`expected ${heroVideo} asset to exist (graphical chart looping video)`);
}

for (const page of pages) {
  const htmlPath = path.join(root, "site", page.file);
  const html = readFileSync(htmlPath, "utf8");

  if (/data-hero-video-playlist/.test(html)) {
    failures.push(`${page.file}: stale data-hero-video-playlist still present — should be a single perfect-loop video now`);
  }
  const videoCount = (html.match(/<video[^>]*data-hero-video/g) || []).length;
  if (videoCount !== 1) {
    failures.push(`${page.file}: expected exactly one perfect-loop hero video, got ${videoCount}`);
  }
  if (!html.includes(`src="${heroVideo}"`)) {
    failures.push(`${page.file}: missing the chart-supplied loop video at ${heroVideo}`);
  }
  if (!new RegExp(`data-hero-start="${page.start}"`).test(html)) {
    failures.push(`${page.file}: expected data-hero-start="${page.start}" deterministic offset`);
  }
  if (!/<video[^>]*\bautoplay\b[^>]*\bmuted\b[^>]*\bloop\b[^>]*\bplaysinline\b/.test(html)
   && !/<video[^>]*\bautoplay\b[^>]*\bmuted\b[^>]*\bplaysinline\b[^>]*\bloop\b/.test(html)
   && !/<video[^>]*\bmuted\b[^>]*\bloop\b[^>]*\bplaysinline\b/.test(html)) {
    failures.push(`${page.file}: expected hero video to be autoplay+muted+loop+playsinline`);
  }
}

if (failures.length) {
  console.error(`Page hero video test failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log("Page hero video mappings are green.");
