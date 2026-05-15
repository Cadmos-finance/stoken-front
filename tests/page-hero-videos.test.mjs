import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { root } from "./browser-page.mjs";

const pages = [
  {
    file: "the-asset.html",
    videos: [
      "assets/video/163506748-copper-mill-warehouse-metal-pl.mp4",
      "assets/video/203823134-metal-copper-plumbing-pipes-st.mp4"
    ]
  },
  {
    file: "how-it-works.html",
    videos: [
      "assets/video/073422422-aerial-footage-overhead-contai.mp4",
      "assets/video/081188251-aerial-top-down-loaded-freight.mp4"
    ]
  },
  {
    file: "for-issuers.html",
    videos: [
      "assets/video/241484310-aerial-drone-view-rosia-poieni.mp4",
      "assets/video/140173507-loading-iron-ore-concentrate-c.mp4"
    ]
  },
  {
    file: "about.html",
    videos: [
      "assets/video/090886137-aerial-view-oil-depot-tank-far.mp4",
      "assets/video/219347816-aerial-view-oil-terminal-stora.mp4"
    ]
  }
];

const failures = [];
const styles = readFileSync(path.join(root, "site/assets/css/styles.css"), "utf8");
const pageHeadBlock = styles.match(/\.page-head\s*\{[\s\S]*?\n\}/)?.[0] || "";
const pageHeadOverlayBlock = styles.match(/\.page-head__bg::before\s*\{[\s\S]*?\n\}/)?.[0] || "";
const pageHeadVideoBlock = styles.match(/\.page-head__video\s*\{[\s\S]*?\n\}/)?.[0] || "";
const pageHeadActiveVideoBlock = styles.match(/\.page-head__video\.is-active\s*\{[\s\S]*?\n\}/)?.[0] || "";

if (!pageHeadBlock.includes("min-height: clamp(760px, 100vh, 1040px);")) {
  failures.push("expected subpage heroes to use homepage-height rhythm");
}
if (!pageHeadBlock.includes("padding: 180px 0 100px;")) {
  failures.push("expected subpage heroes to use homepage bottom padding rhythm");
}
if (!pageHeadVideoBlock.includes("object-position: center center;")) {
  failures.push("expected subpage hero videos to be explicitly centered inside the full-height hero");
}
if (!pageHeadActiveVideoBlock.includes("opacity: 0.94;")) {
  failures.push("expected subpage hero videos to read clearly under the overlay");
}
if (!pageHeadOverlayBlock.includes("rgba(13, 20, 28, 0.24) 42%") || !pageHeadOverlayBlock.includes("rgba(13, 20, 28, 0.02) 100%")) {
  failures.push("expected subpage hero overlay to preserve text contrast while keeping the footage clearer");
}

for (const page of pages) {
  const htmlPath = path.join(root, "site", page.file);
  const html = readFileSync(htmlPath, "utf8");
  const playlistCount = (html.match(/data-hero-video-playlist/g) || []).length;
  const videoCount = (html.match(/<video[^>]*data-hero-video/g) || []).length;

  if (playlistCount !== 1) {
    failures.push(`${page.file}: expected one page hero playlist, got ${playlistCount}`);
  }
  if (videoCount !== 2) {
    failures.push(`${page.file}: expected two page hero videos, got ${videoCount}`);
  }
  if (!/class="page-head__video is-active" autoplay muted playsinline preload="auto"/.test(html)) {
    failures.push(`${page.file}: expected first page hero video to autoplay and start active`);
  }

  for (const video of page.videos) {
    if (!html.includes(`src="${video}"`)) {
      failures.push(`${page.file}: missing ${video}`);
    }
    if (!existsSync(path.join(root, "site", video))) {
      failures.push(`${page.file}: asset file does not exist for ${video}`);
    }
  }
}

if (failures.length) {
  console.error(`Page hero video test failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log("Page hero video mappings are green.");
