import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const siteRoot = path.join(root, "site");
const cssText = readFileSync(path.join(siteRoot, "assets/css/styles.css"), "utf8");

const pages = [
  {
    file: "the-asset.html",
    heroStart: "4",
    sections: ["what-are-stokens", "terms", "getting-started"],
    v2Classes: ["v2-asset-credit", "v2-terms", "v2-getting-started"]
  },
  {
    file: "how-it-works.html",
    heroStart: "8",
    sections: ["trade-to-token", "money-moves", "swiss-law"],
    v2Classes: ["v2-how-pipeline", "v2-money-moves"]
  },
  {
    file: "for-issuers.html",
    heroStart: "12",
    sections: ["opportunity", "process"],
    v2Classes: ["v2-issuer-opportunity", "v2-issuer-process"]
  },
  {
    file: "about.html",
    heroStart: "16",
    sections: ["mission", "team", "roadmap", "contact"],
    v2Classes: ["v2-team", "v2-roadmap"]
  }
];

// The heavy designer illustrations were base64-PNG-in-SVG (3.6MB each); they are
// now exported to right-sized WebP (~5-85KB each, ~134x smaller total). how-stage-02
// stays SVG (optimized vector gauge with baked text); the small team/linkedin marks
// stay SVG (true vectors).
const requiredAssets = [
  "asset-credit-market.webp",
  "asset-terms-table.webp",
  "how-stage-01.webp",
  "how-stage-02.svg",
  "how-stage-03.webp",
  "how-stage-04.webp",
  "issuer-opportunity-cartouche.webp",
  "issuer-process-cartouche.webp",
  "team-roadmap.webp",
  "team-sergei.svg",
  "team-romain.svg",
  "linkedin.svg"
];

const forbiddenReferencedAssets = [
  "asset-credit-cartouche.svg",
  "asset-getting-started.svg",
  "how-money-moves.svg"
  // team-roadmap.svg is now intentionally loaded as the designer SVG on the
  // About roadmap; milestone text is mirrored in a .visually-hidden list for
  // screen readers / SEO, so it is no longer a "redrawn" (forbidden) asset.
  // how-stage-02.svg (Rating gauge) is likewise now intentionally loaded as the
  // optimized designer SVG (3.7MB -> 252KB; baked vector text), with its content
  // described in the <img alt>, so it moved to requiredAssets.
];

const failures = [];

for (const page of pages) {
  const html = readFileSync(path.join(siteRoot, page.file), "utf8");
  for (const section of page.sections) {
    if (!new RegExp(`<section[^>]+id="${section}"`).test(html)) {
      failures.push(`${page.file}: missing #${section}`);
    }
  }
  for (const className of page.v2Classes) {
    if (!html.includes(className)) {
      failures.push(`${page.file}: missing ${className}`);
    }
  }
  if (!new RegExp(`data-hero-start="${page.heroStart}"`).test(html)) {
    failures.push(`${page.file}: expected data-hero-start="${page.heroStart}"`);
  }
  if (!html.includes('src="assets/video/stoken-hero-loop.mp4"')) {
    failures.push(`${page.file}: expected shared subpage hero video`);
  }
}

for (const asset of requiredAssets) {
  const assetPath = path.join(siteRoot, "assets/img/sections/v2", asset);
  if (!existsSync(assetPath)) {
    failures.push(`missing V2 asset ${asset}`);
  }
  const referencedInHtml = pages.some(page => readFileSync(path.join(siteRoot, page.file), "utf8").includes(`assets/img/sections/v2/${asset}`));
  const referencedInCss = cssText.includes(`../img/sections/v2/${asset}`);
  if (!referencedInHtml && !referencedInCss) {
    failures.push(`V2 asset is not referenced by site HTML/CSS: ${asset}`);
  }
}

for (const asset of forbiddenReferencedAssets) {
  const referencedInHtml = pages.some(page => readFileSync(path.join(siteRoot, page.file), "utf8").includes(`assets/img/sections/v2/${asset}`));
  const referencedInCss = cssText.includes(`../img/sections/v2/${asset}`);
  if (referencedInHtml || referencedInCss) {
    failures.push(`hidden/redrawn V2 asset must not be loaded by site HTML/CSS: ${asset}`);
  }
}

// The homepage may now be edited (e.g. perf/SEO work), but it must keep its core
// SEO + shared assets intact and stay overflow-free — real coverage in place of the
// old "must be byte-identical" freeze.
{
  const indexHtml = readFileSync(path.join(siteRoot, "index.html"), "utf8");
  for (const [needle, label] of [
    ['<link rel="canonical"', "canonical link"],
    ['property="og:image"', "og:image"],
    ["application/ld+json", "JSON-LD structured data"],
    ['src="assets/video/stoken-hero-loop.mp4"', "shared hero video"],
    ["assets/css/styles.css", "stylesheet"]
  ]) {
    if (!indexHtml.includes(needle)) failures.push(`index.html: missing ${label}`);
  }
  const h1count = (indexHtml.match(/<h1[\s>]/g) || []).length;
  if (h1count !== 1) failures.push(`index.html: expected exactly one <h1>, found ${h1count}`);

  const mob = await inspectMobilePage("index.html");
  if (mob.error) {
    failures.push(`index.html: mobile inspection failed: ${mob.error}`);
  } else if (mob.scrollWidth > mob.innerWidth + 1) {
    failures.push(`index.html: mobile horizontal overflow ${mob.scrollWidth}px > ${mob.innerWidth}px (${mob.wideElements.join(", ")})`);
  }
}

for (const page of pages) {
  const result = await inspectMobilePage(page.file);
  if (result.error) {
    failures.push(`${page.file}: mobile inspection failed: ${result.error}`);
    continue;
  }
  if (result.scrollWidth > result.innerWidth + 1) {
    failures.push(`${page.file}: mobile horizontal overflow ${result.scrollWidth}px > ${result.innerWidth}px (${result.wideElements.join(", ")})`);
  }
  for (const element of result.clippedElements) {
    failures.push(`${page.file}: mobile content clips horizontally: ${element}`);
  }
  for (const text of result.clippedText) {
    failures.push(`${page.file}: mobile text paints outside viewport: ${text}`);
  }
  if (result.heroAriaHidden !== "true") {
    failures.push(`${page.file}: decorative hero video must remain aria-hidden at runtime`);
  }
  for (const image of result.failedV2Assets) {
    failures.push(`${page.file}: V2 image failed to load: ${image}`);
  }
}

for (const file of ["index.html", "about.html", "the-asset.html", "for-issuers.html", "how-it-works.html"]) {
  for (const width of [981, 1000, 1101, 1240, 1241, 1315, 1316]) {
    const result = await inspectMobilePage(file, { width, height: 1200, mobile: false });
    if (result.error) {
      failures.push(`${file}: ${width}px breakpoint inspection failed: ${result.error}`);
      continue;
    }
    if (result.scrollWidth > result.innerWidth + 1) {
      failures.push(`${file}: ${width}px breakpoint horizontal overflow ${result.scrollWidth}px > ${result.innerWidth}px (${result.wideElements.join(", ")})`);
    }
    for (const element of result.clippedElements) {
      failures.push(`${file}: ${width}px breakpoint content clips horizontally: ${element}`);
    }
    for (const text of result.clippedText) {
      failures.push(`${file}: ${width}px breakpoint text paints outside viewport: ${text}`);
    }
  }
}

if (failures.length) {
  console.error(`Non-homepage V2 regression test failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log("Non-homepage V2 sections are green.");

async function inspectMobilePage(file, viewport = { width: 390, height: 1000, mobile: true }) {
  const url = `file://${path.join(siteRoot, file)}`;
  const chromeProfile = mkdtempSync(path.join(tmpdir(), "stoken-nonhomepage-test-"));
  const chrome = spawn("google-chrome", [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-crashpad",
    "--disable-crash-reporter",
    "--remote-debugging-port=0",
    `--user-data-dir=${chromeProfile}`,
    `--window-size=${viewport.width},${viewport.height}`,
    url
  ], { stdio: ["ignore", "pipe", "pipe"] });

  const cleanup = () => {
    chrome.kill("SIGTERM");
    try {
      rmSync(chromeProfile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    } catch {
      // Chrome can briefly hold profile files after SIGTERM; the OS will clear /tmp.
    }
  };

  try {
    const endpoint = await waitForDevtools(chrome);
    const pageTarget = await waitForPageTarget(endpoint, url);
    const socket = new WebSocket(pageTarget.webSocketDebuggerUrl);
    const pending = new Map();
    let id = 0;

    socket.addEventListener("message", event => {
      const message = JSON.parse(event.data);
      if (message.id && pending.has(message.id)) {
        pending.get(message.id)(message);
        pending.delete(message.id);
      }
    });

    await new Promise(resolve => socket.addEventListener("open", resolve, { once: true }));
    const send = (method, params = {}) => {
      const requestId = ++id;
      socket.send(JSON.stringify({ id: requestId, method, params }));
      return new Promise(resolve => pending.set(requestId, resolve));
    };

    await send("Page.enable");
    await send("Emulation.setDeviceMetricsOverride", {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: viewport.mobile
    });
    await send("Page.reload", { ignoreCache: true });
    await new Promise(resolve => setTimeout(resolve, 900));

    const evaluation = await send("Runtime.evaluate", {
      returnByValue: true,
      awaitPromise: true,
      expression: `(async () => {
        const requiredAssets = ${JSON.stringify(requiredAssets)};
        await Promise.all([...document.images]
          .filter(img => img.currentSrc.includes("/assets/img/sections/v2/"))
          .map(img => img.decode().catch(() => {})));
        const failedV2Assets = [...document.images]
          .filter(img => img.currentSrc.includes("/assets/img/sections/v2/"))
          .filter(img => !img.complete || img.naturalWidth === 0)
          .map(img => img.getAttribute("src"));
        const probeResults = await Promise.all(requiredAssets.map(asset => new Promise(resolve => {
          const img = new Image();
          img.onload = () => resolve(null);
          img.onerror = () => resolve(asset);
          img.src = "assets/img/sections/v2/" + asset;
        })));
        failedV2Assets.push(...probeResults.filter(Boolean));
        const visibleContent = [...document.querySelectorAll([
          ".page-head .crumb",
          ".page-head h1",
          ".page-head .page-head__sub",
          ".v2-section .eyebrow",
          ".v2-section h2",
          ".v2-section h3",
          ".v2-section h4",
          ".v2-section p",
          ".v2-section a",
          ".v2-section li",
          ".v2-section strong",
          ".v2-section img"
        ].join(","))];
        const clippedElements = visibleContent
          .filter(el => {
            const style = getComputedStyle(el);
            if (style.display === "none" || style.visibility === "hidden" || style.position === "fixed") return false;
            if (el.closest(".visually-hidden")) return false;
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && (rect.left < -2 || rect.right > window.innerWidth + 2);
          })
          .slice(0, 8)
          .map(el => {
            const rect = el.getBoundingClientRect();
            return [el.tagName.toLowerCase(), el.id || "", el.className || "", Math.round(rect.left), Math.round(rect.right)].join(":");
          });
        const clippedText = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (walker.nextNode() && clippedText.length < 8) {
          const node = walker.currentNode;
          const text = node.textContent.replace(/\\s+/g, " ").trim();
          if (!text) continue;
          const element = node.parentElement;
          if (!element || !element.closest(".page-head, .v2-section")) continue;
          if (element.closest(".visually-hidden")) continue;
          const style = getComputedStyle(element);
          if (style.display === "none" || style.visibility === "hidden" || style.position === "fixed") continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const rect of range.getClientRects()) {
            if (rect.width > 0 && (rect.left < -2 || rect.right > window.innerWidth + 2)) {
              clippedText.push([element.tagName.toLowerCase(), element.id || "", element.className || "", Math.round(rect.left), Math.round(rect.right), text.slice(0, 36)].join(":"));
              break;
            }
          }
          range.detach();
        }
        const wideElements = [...document.body.querySelectorAll("*")]
          .filter(el => {
            const style = getComputedStyle(el);
            if (style.display === "none" || style.visibility === "hidden" || style.position === "fixed") return false;
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.right > window.innerWidth + 2;
          })
          .slice(0, 6)
          .map(el => {
            const rect = el.getBoundingClientRect();
            return [el.tagName.toLowerCase(), el.id || "", el.className || "", Math.round(rect.left), Math.round(rect.right)].join(":");
          });
        return {
          innerWidth: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          heroAriaHidden: document.querySelector("[data-hero-video]")?.getAttribute("aria-hidden"),
          failedV2Assets,
          clippedElements,
          clippedText,
          wideElements
        };
      })()`
    });

    socket.close();
    if (evaluation.result.exceptionDetails) {
      return { error: evaluation.result.exceptionDetails.text || "Runtime.evaluate exception" };
    }
    const value = evaluation.result.result?.value;
    if (!value || !Array.isArray(value.failedV2Assets) || !Array.isArray(value.clippedElements) || !Array.isArray(value.clippedText)) {
      return { error: `Runtime.evaluate returned unexpected payload: ${JSON.stringify(evaluation.result)}` };
    }
    return value;
  } finally {
    cleanup();
  }
}

async function waitForDevtools(processHandle) {
  let stderr = "";
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Chrome DevTools endpoint timed out")), 8000);
    processHandle.stderr.on("data", chunk => {
      stderr += chunk.toString();
      const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1].replace(/^ws:\/\//, "http://").replace(/\/devtools\/browser\/.+$/, ""));
      }
    });
    processHandle.on("exit", code => {
      clearTimeout(timer);
      reject(new Error(`Chrome exited before DevTools was ready: ${code}\n${stderr}`));
    });
  });
}

async function waitForPageTarget(endpoint, url) {
  for (let i = 0; i < 30; i += 1) {
    const targets = await fetch(`${endpoint}/json`).then(r => r.json());
    const target = targets.find(item => item.type === "page" && item.url === url);
    if (target) return target;
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  throw new Error(`Page target not found in Chrome: ${url}`);
}
