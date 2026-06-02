import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const sourceRoot = path.join(
  root,
  "Suite des elements/Package website graphic items/Package website graphic items"
);

const args = new Map(
  process.argv.slice(2).map(arg => {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    return match ? [match[1], match[2]] : [arg.replace(/^--/, ""), "true"];
  })
);

const round = args.get("round") || timestampRound();
const outDir = path.resolve(args.get("out") || path.join(tmpdir(), `stoken-review-round-${round}`));
const width = Number(args.get("width") || 1316);
const height = Number(args.get("height") || 1000);
const deviceScaleFactor = Number(args.get("scale") || 1);

const elements = [
  {
    slug: "asset-credit-section",
    page: "the-asset.html",
    selector: ".v2-asset-credit",
    reference: "specs/the-asset-page/01-what-are-stokens-credit-market.png"
  },
  {
    slug: "asset-credit-cartouche",
    page: "the-asset.html",
    selector: ".v2-cartouche",
    reference: "The Asset/The credit market behind the real economy_tokenized_Cartouche.svg",
    sectionCrop: {
      section: "asset-credit-section",
      crop: { x: 0.055, y: 0.37, width: 0.47, height: 0.45 }
    }
  },
  {
    slug: "asset-credit-market",
    page: "the-asset.html",
    selector: ".v2-credit-graphic",
    reference: "The Asset/The credit market behind the real economy_tokenized.svg",
    sectionCrop: {
      section: "asset-credit-section",
      crop: { x: 0.54, y: 0.14, width: 0.43, height: 0.66 }
    }
  },
  {
    slug: "asset-terms-section",
    page: "the-asset.html",
    selector: ".v2-terms",
    reference: "specs/the-asset-page/02-the-terms-table.png"
  },
  {
    slug: "asset-terms-table",
    page: "the-asset.html",
    selector: ".v2-table-shell",
    reference: "The Asset/The Terms - tableau.svg",
    sectionCrop: {
      section: "asset-terms-section",
      crop: { x: 0.105, y: 0.34, width: 0.81, height: 0.57 }
    }
  },
  {
    slug: "asset-getting-started-section",
    page: "the-asset.html",
    selector: ".v2-getting-started",
    reference: "specs/the-asset-page/03-getting-started-process.png"
  },
  {
    slug: "asset-getting-started",
    page: "the-asset.html",
    selector: ".v2-chevron-graphic",
    reference: "The Asset/Getting started_Graphique.svg",
    sectionCrop: {
      section: "asset-getting-started-section",
      crop: { x: 0.04, y: 0.37, width: 0.92, height: 0.42 }
    }
  },
  {
    slug: "how-pipeline-section",
    page: "how-it-works.html",
    selector: ".v2-how-pipeline",
    reference: "specs/how-it-works/01-from-trade-to-token-full.png"
  },
  {
    slug: "how-stage-01",
    page: "how-it-works.html",
    selector: ".v2-how-pipeline .split:nth-child(1)",
    reference: "specs/how-it-works/01a-origination.png",
    sectionPad: 0
  },
  {
    slug: "how-stage-02",
    page: "how-it-works.html",
    selector: ".v2-how-pipeline .split:nth-child(2)",
    reference: "specs/how-it-works/01b-rating.png",
    sectionPad: 0
  },
  {
    slug: "how-stage-03",
    page: "how-it-works.html",
    selector: ".v2-how-pipeline .split:nth-child(3)",
    reference: "specs/how-it-works/01c-tokenization.png",
    sectionPad: 0
  },
  {
    slug: "how-stage-04",
    page: "how-it-works.html",
    selector: ".v2-how-pipeline .split:nth-child(4)",
    reference: "specs/how-it-works/01d-distribution.png",
    sectionPad: 0
  },
  {
    slug: "money-moves-section",
    page: "how-it-works.html",
    selector: ".v2-money-moves",
    reference: "specs/how-it-works/02-how-the-money-moves.png"
  },
  {
    slug: "money-moves",
    page: "how-it-works.html",
    selector: ".v2-money-moves .money-flow",
    reference: "How the money moves _ graphic.svg",
    sectionCrop: {
      section: "money-moves-section",
      crop: { x: 0.06, y: 0.49, width: 0.9, height: 0.4 }
    }
  },
  {
    slug: "issuer-opportunity-section",
    page: "for-issuers.html",
    selector: ".v2-issuer-opportunity",
    reference: "specs/for-issuers/01-the-opportunity.png"
  },
  {
    slug: "issuer-stat-cartouche",
    page: "for-issuers.html",
    selector: ".v2-issuer-stat",
    reference: "The Opportunity cartouche cream.svg",
    sectionCrop: {
      section: "issuer-opportunity-section",
      crop: { x: 0.055, y: 0.64, width: 0.22, height: 0.25 }
    }
  },
  {
    slug: "issuer-process-section",
    page: "for-issuers.html",
    selector: ".v2-issuer-process",
    reference: "specs/for-issuers/02-the-process.png"
  },
  {
    slug: "issuer-process-card",
    page: "for-issuers.html",
    selector: ".v2-issuer-process .timeline-step:nth-child(2)",
    reference: "The process_background_cartouche.svg",
    sectionCrop: {
      section: "issuer-process-section",
      crop: { x: 0.19, y: 0.42, width: 0.145, height: 0.45 }
    }
  },
  {
    slug: "team-section",
    page: "about.html",
    selector: ".v2-team",
    reference: "specs/team/01-team-members.png"
  },
  {
    slug: "team-sergei",
    page: "about.html",
    selector: ".v2-team-member:first-child .v2-team-member__portrait",
    reference: "Profil Sergei.svg",
    sectionCrop: {
      section: "team-section",
      crop: { x: 0.055, y: 0.36, width: 0.34, height: 0.32 }
    }
  },
  {
    slug: "team-romain",
    page: "about.html",
    selector: ".v2-team-member:nth-child(2) .v2-team-member__portrait",
    reference: "Profil Romain.svg",
    sectionCrop: {
      section: "team-section",
      crop: { x: 0.48, y: 0.36, width: 0.36, height: 0.32 }
    }
  },
  {
    slug: "linkedin",
    page: "about.html",
    selector: ".v2-linkedin img",
    reference: "Logo LinkedIN.svg",
    sectionCrop: {
      section: "team-section",
      crop: { x: 0.22, y: 0.68, width: 0.28, height: 0.25 }
    }
  },
  {
    slug: "roadmap-section",
    page: "about.html",
    selector: ".v2-roadmap",
    reference: "specs/team/02-roadmap.png"
  },
  {
    slug: "roadmap-graphic",
    page: "about.html",
    selector: ".v2-roadmap-graphic",
    reference: "Platform launch Q3 2026 - Roadmap.svg",
    sectionCrop: {
      section: "roadmap-section",
      crop: { x: 0.02, y: 0.1, width: 0.96, height: 0.82 }
    }
  }
];

mkdirSync(outDir, { recursive: true });

const profile = mkdtempSync(path.join(tmpdir(), "stoken-compare-chrome-"));
const chrome = spawn("google-chrome", [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--disable-crashpad",
  "--disable-crash-reporter",
  "--remote-debugging-port=0",
  `--user-data-dir=${profile}`,
  `--window-size=${width},${height}`,
  "about:blank"
], { stdio: ["ignore", "pipe", "pipe"] });

let cleaned = false;
const cleanup = () => {
  if (cleaned) return;
  cleaned = true;
  chrome.kill("SIGTERM");
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  } catch {
    // Chrome may briefly hold profile locks after SIGTERM.
  }
};

process.on("exit", cleanup);
process.on("SIGINT", () => {
  cleanup();
  process.exit(130);
});

try {
  const endpoint = await waitForDevtools(chrome);
  const pageTarget = await waitForAnyPageTarget(endpoint);
  const client = await createClient(pageTarget.webSocketDebuggerUrl);
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor,
    mobile: false
  });

  const generated = [];
  const capturesBySlug = new Map();

  for (const item of elements) {
    console.error(`Capturing ${item.slug}`);
    const livePath = path.join(outDir, `${item.slug}.live.png`);
    const referencePath = path.join(outDir, `${item.slug}.reference.png`);
    const compareHtmlPath = path.join(outDir, `${item.slug}.compare.html`);
    const comparePath = path.join(outDir, `${item.slug}.compare.png`);
    const sourcePath = resolveReference(item.reference);
    let comparisonSourcePath = sourcePath;
    let comparisonMode = "element";
    let sectionCrop = null;

    if (item.sectionCrop) {
      const sectionCapture = capturesBySlug.get(item.sectionCrop.section);
      if (!sectionCapture) {
        throw new Error(`${item.slug} requested section crop from ${item.sectionCrop.section}, but that section has not been captured yet`);
      }
      comparisonSourcePath = sectionCapture.reference;
      comparisonMode = "section-crop";
      sectionCrop = {
        section: item.sectionCrop.section,
        crop: item.sectionCrop.crop,
        originalSource: sourcePath,
        contextSource: sectionCapture.source
      };
      await cropImageRegion(client, {
        sourcePath: sectionCapture.live,
        outPath: livePath,
        crop: item.sectionCrop.crop,
        masks: item.sectionCrop.liveMasks || []
      });
      await cropImageRegion(client, {
        sourcePath: sectionCapture.reference,
        outPath: referencePath,
        crop: item.sectionCrop.crop,
        masks: item.sectionCrop.referenceMasks || []
      });
    } else {
      const liveUrl = pathToFileURL(path.join(root, "site", item.page)).href;
      await captureElement(client, {
        url: liveUrl,
        selector: item.selector,
        outPath: livePath,
        pad: item.sectionPad ?? 0,
        beforeCapture: livePrepExpression()
      });

      await captureElement(client, {
        url: pathToFileURL(sourcePath).href,
        selector: sourcePath.endsWith(".svg") ? "svg" : "img",
        outPath: referencePath,
        pad: sourcePath.endsWith(".svg") ? 12 : 0,
        artworkOnly: sourcePath.endsWith(".svg"),
        beforeCapture: sourcePrepExpression(sourcePath)
      });
    }

    writeFileSync(compareHtmlPath, comparisonHtml({
      item,
      round,
      livePath,
      referencePath,
      sourcePath,
      comparisonSourcePath,
      comparisonMode,
      sectionCrop
    }));

    await captureElement(client, {
      url: pathToFileURL(compareHtmlPath).href,
      selector: ".comparison-page",
      outPath: comparePath,
      pad: 0,
      beforeCapture: "document.documentElement.style.background = '#e9e6d6';"
    });

    const captureRecord = {
      slug: item.slug,
      page: item.page,
      selector: item.selector,
      live: livePath,
      reference: referencePath,
      compare: comparePath,
      source: sourcePath,
      comparisonMode,
      sectionCrop
    };
    generated.push(captureRecord);
    capturesBySlug.set(item.slug, captureRecord);
  }

  const manifest = {
    round,
    width,
    height,
    outDir,
    generated
  };
  writeFileSync(path.join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify(manifest, null, 2));
  cleanup();
} catch (error) {
  cleanup();
  console.error(error.stack || error.message || String(error));
  process.exit(1);
}

function resolveReference(reference) {
  if (reference.startsWith("specs/")) return path.join(root, reference);
  return path.join(sourceRoot, reference);
}

function livePrepExpression() {
  return `
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";
    let reviewFreeze = document.getElementById("review-freeze");
    if (!reviewFreeze) {
      reviewFreeze = document.createElement("style");
      reviewFreeze.id = "review-freeze";
      reviewFreeze.textContent = \`
        *, *::before, *::after {
          animation-delay: 0s !important;
          animation-duration: 0s !important;
          transition-delay: 0s !important;
          transition-duration: 0s !important;
        }
        .reveal,
        .reveal.in {
          opacity: 1 !important;
          transform: none !important;
          transition: none !important;
        }
      \`;
      document.head.append(reviewFreeze);
    }
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("in"));
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
    await document.fonts.ready.catch(() => {});
  `;
}

function sourcePrepExpression(sourcePath) {
  const background = sourcePath.endsWith(".svg") ? "#e9e6d6" : "#e9e6d6";
  return `
    document.documentElement.style.background = ${JSON.stringify(background)};
    if (document.body) {
      document.body.style.margin = "0";
      document.body.style.background = ${JSON.stringify(background)};
    }
    await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
    document.querySelectorAll("img").forEach(img => {
      const naturalWidth = img.naturalWidth || img.width;
      const naturalHeight = img.naturalHeight || img.height;
      img.style.maxWidth = "none";
      img.style.maxHeight = "none";
      img.style.width = naturalWidth ? naturalWidth + "px" : "auto";
      img.style.height = naturalHeight ? naturalHeight + "px" : "auto";
    });
    await document.fonts?.ready?.catch?.(() => {});
  `;
}

async function captureElement(client, { url, selector, outPath, pad = 0, artworkOnly = false, beforeCapture = "" }) {
  await client.send("Page.navigate", { url });
  await waitForLoad(client);
  await new Promise(resolve => setTimeout(resolve, 450));

  const evaluation = await client.send("Runtime.evaluate", {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      ${beforeCapture}
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) throw new Error("Selector not found: ${escapeForJs(selector)}");
      let rect = el.getBoundingClientRect();
      if (${artworkOnly} && el instanceof SVGSVGElement && typeof el.getBBox === "function") {
        const bbox = el.getBBox();
        const matrix = el.getScreenCTM();
        if (matrix && bbox.width > 0 && bbox.height > 0) {
          const points = [
            new DOMPoint(bbox.x, bbox.y),
            new DOMPoint(bbox.x + bbox.width, bbox.y),
            new DOMPoint(bbox.x + bbox.width, bbox.y + bbox.height),
            new DOMPoint(bbox.x, bbox.y + bbox.height)
          ].map(point => point.matrixTransform(matrix));
          const left = Math.min(...points.map(point => point.x));
          const right = Math.max(...points.map(point => point.x));
          const top = Math.min(...points.map(point => point.y));
          const bottom = Math.max(...points.map(point => point.y));
          rect = { left, top, width: right - left, height: bottom - top };
        }
      }
      const scrollX = window.scrollX || document.documentElement.scrollLeft || 0;
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const doc = document.documentElement;
      const body = document.body || doc;
      const maxWidth = Math.max(doc.scrollWidth, body.scrollWidth, doc.clientWidth);
      const maxHeight = Math.max(doc.scrollHeight, body.scrollHeight, doc.clientHeight);
      const x = Math.max(0, rect.left + scrollX - ${pad});
      const y = Math.max(0, rect.top + scrollY - ${pad});
      const width = Math.min(maxWidth - x, rect.width + (${pad} * 2));
      const height = Math.min(maxHeight - y, rect.height + (${pad} * 2));
      return {
        x,
        y,
        width: Math.max(1, width),
        height: Math.max(1, height),
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        outerText: el.innerText || el.getAttribute("aria-label") || el.getAttribute("alt") || ""
      };
    })()`
  });

  if (evaluation.result.exceptionDetails) {
    throw new Error(`Could not capture ${selector} on ${url}: ${evaluation.result.exceptionDetails.text}`);
  }

  const clip = evaluation.result.result.value;
  if (!clip || !Number.isFinite(clip.x) || !Number.isFinite(clip.y) || !Number.isFinite(clip.width) || !Number.isFinite(clip.height)) {
    throw new Error(`Invalid capture rect for ${selector} on ${url}: ${JSON.stringify(evaluation.result)}`);
  }
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: Math.max(width, Math.ceil(Math.min(clip.width + clip.x, 2200))),
    height: Math.max(height, Math.ceil(Math.min(clip.height + 80, 2200))),
    deviceScaleFactor,
    mobile: false
  });

  const screenshot = await client.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    fromSurface: true,
    clip: {
      x: clip.x,
      y: clip.y,
      width: clip.width,
      height: clip.height,
      scale: 1
    }
  });

  writeFileSync(outPath, Buffer.from(screenshot.result.data, "base64"));

  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor,
    mobile: false
  });

  return clip;
}

async function cropImageRegion(client, { sourcePath, outPath, crop, masks = [] }) {
  const cropHtmlPath = path.join(outDir, `${path.basename(outPath, ".png")}.crop.html`);
  writeFileSync(cropHtmlPath, cropHtml({ sourcePath, crop, masks }));
  await captureElement(client, {
    url: pathToFileURL(cropHtmlPath).href,
    selector: ".crop-frame",
    outPath,
    beforeCapture: "await window.prepareCrop();"
  });
}

function cropHtml({ sourcePath, crop, masks }) {
  const imageSrc = pathToFileURL(sourcePath).href;
  const safeJson = value => JSON.stringify(value).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    :root { color-scheme: light; }
    html,
    body {
      margin: 0;
      min-width: 1px;
      min-height: 1px;
      overflow: visible;
      background: transparent;
    }
    .crop-frame {
      position: relative;
      overflow: hidden;
      width: 1px;
      height: 1px;
      background: transparent;
    }
    .crop-frame img {
      position: absolute;
      top: 0;
      left: 0;
      display: block;
      max-width: none;
      transform-origin: top left;
    }
    .mask {
      position: absolute;
      z-index: 1;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div class="crop-frame"><img src="${imageSrc}" alt=""></div>
  <script>
    window.prepareCrop = async () => {
      const crop = ${safeJson(crop)};
      const masks = ${safeJson(masks)};
      const frame = document.querySelector(".crop-frame");
      const img = frame.querySelector("img");
      await img.decode().catch(() => {});
      const naturalWidth = img.naturalWidth || img.width || 1;
      const naturalHeight = img.naturalHeight || img.height || 1;
      const sx = Math.max(0, Math.round(naturalWidth * crop.x));
      const sy = Math.max(0, Math.round(naturalHeight * crop.y));
      const sw = Math.max(1, Math.min(naturalWidth - sx, Math.round(naturalWidth * crop.width)));
      const sh = Math.max(1, Math.min(naturalHeight - sy, Math.round(naturalHeight * crop.height)));
      frame.style.width = \`\${sw}px\`;
      frame.style.height = \`\${sh}px\`;
      img.style.width = \`\${naturalWidth}px\`;
      img.style.height = \`\${naturalHeight}px\`;
      img.style.transform = \`translate(\${-sx}px, \${-sy}px)\`;
      masks.forEach(mask => {
        const el = document.createElement("div");
        el.className = "mask";
        el.style.left = \`\${Math.round(sw * mask.x)}px\`;
        el.style.top = \`\${Math.round(sh * mask.y)}px\`;
        el.style.width = \`\${Math.round(sw * mask.width)}px\`;
        el.style.height = \`\${Math.round(sh * mask.height)}px\`;
        el.style.background = mask.fill || "#f9f6e6";
        frame.append(el);
      });
    };
  </script>
</body>
</html>
`;
}

function comparisonHtml({ item, round, livePath, referencePath, sourcePath, comparisonSourcePath, comparisonMode, sectionCrop }) {
  const safe = text => String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  const liveSrc = pathToFileURL(livePath).href;
  const referenceSrc = pathToFileURL(referencePath).href;
  const cropMeta = sectionCrop
    ? `<div class="meta">Comparison mode: <code>section crop</code> from <code>${safe(sectionCrop.section)}</code> using normalized crop <code>${safe(JSON.stringify(sectionCrop.crop))}</code></div>
      <div class="meta">Original element source: <code>${safe(path.relative(root, sectionCrop.originalSource))}</code></div>
      <div class="meta">Section reference source: <code>${safe(path.relative(root, sectionCrop.contextSource))}</code></div>`
    : `<div class="meta">Comparison mode: <code>${safe(comparisonMode)}</code></div>
      <div class="meta">Reference source: <code>${safe(path.relative(root, comparisonSourcePath || sourcePath))}</code></div>`;
  const referenceLabel = sectionCrop ? "Designer section crop" : "Designer source crop";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${safe(item.slug)} comparison</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #e9e6d6;
      color: #0d141c;
      font-family: Arial, Helvetica, sans-serif;
    }
    .comparison-page {
      width: 1640px;
      padding: 28px;
    }
    header {
      display: grid;
      gap: 6px;
      margin-bottom: 20px;
    }
    h1 {
      margin: 0;
      font-size: 28px;
      line-height: 1.1;
      letter-spacing: 0;
    }
    .meta {
      font-size: 13px;
      line-height: 1.35;
      color: rgba(13, 20, 28, 0.72);
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      align-items: start;
    }
    .panel {
      min-width: 0;
      background: #f9f6e6;
      border: 2px solid #0d141c;
    }
    .panel h2 {
      margin: 0;
      padding: 10px 12px;
      background: #0d141c;
      color: #f9f6e6;
      font-size: 15px;
      letter-spacing: 0;
      text-transform: uppercase;
    }
    .frame {
      display: grid;
      min-height: 220px;
      place-items: center;
      padding: 16px;
      overflow: hidden;
    }
    img {
      display: block;
      max-width: 100%;
      height: auto;
      background: transparent;
    }
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    }
  </style>
</head>
<body>
  <main class="comparison-page">
    <header>
      <h1>Round ${safe(round)} · ${safe(item.slug)}</h1>
      <div class="meta">Live: <code>${safe(item.page)}</code> selector <code>${safe(item.selector)}</code></div>
      ${cropMeta}
    </header>
    <div class="grid">
      <section class="panel">
        <h2>Website crop</h2>
        <div class="frame"><img src="${liveSrc}" alt=""></div>
      </section>
      <section class="panel">
        <h2>${safe(referenceLabel)}</h2>
        <div class="frame"><img src="${referenceSrc}" alt=""></div>
      </section>
    </div>
  </main>
</body>
</html>
`;
}

async function waitForDevtools(processHandle) {
  let stderr = "";
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Chrome DevTools endpoint timed out\n${stderr}`)), 8000);
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

async function waitForAnyPageTarget(endpoint) {
  for (let i = 0; i < 40; i += 1) {
    const targets = await fetch(`${endpoint}/json`).then(response => response.json());
    const target = targets.find(item => item.type === "page");
    if (target) return target;
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  throw new Error("No Chrome page target found");
}

async function createClient(webSocketDebuggerUrl) {
  const socket = new WebSocket(webSocketDebuggerUrl);
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

  return {
    send(method, params = {}) {
      const requestId = ++id;
      socket.send(JSON.stringify({ id: requestId, method, params }));
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(requestId);
          reject(new Error(`CDP request timed out: ${method}`));
        }, 12000);
        pending.set(requestId, message => {
          clearTimeout(timer);
          if (message.error) reject(new Error(`${method}: ${message.error.message} ${JSON.stringify(params)}`));
          else resolve({ result: message.result });
        });
      });
    },
    close() {
      socket.close();
    }
  };
}

async function waitForLoad(client) {
  for (let i = 0; i < 80; i += 1) {
    const result = await client.send("Runtime.evaluate", {
      returnByValue: true,
      expression: "document.readyState"
    }).catch(() => null);
    if (result?.result?.result?.value === "complete") return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

function timestampRound() {
  const now = new Date();
  return [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
    String(now.getUTCHours()).padStart(2, "0"),
    String(now.getUTCMinutes()).padStart(2, "0"),
    String(now.getUTCSeconds()).padStart(2, "0")
  ].join("");
}

function escapeForJs(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
