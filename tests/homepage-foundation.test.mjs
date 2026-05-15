import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const siteUrl = `file://${path.join(root, "site/index.html")}`;
const cssText = readFileSync(path.join(root, "site/assets/css/styles.css"), "utf8");
const chromeProfile = mkdtempSync(path.join(tmpdir(), "stoken-homepage-test-"));
const chrome = spawn("google-chrome", [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--disable-crash-reporter",
  "--remote-debugging-port=0",
  `--user-data-dir=${chromeProfile}`,
  "--window-size=1440,1000",
  siteUrl
], { stdio: ["ignore", "pipe", "pipe"] });

let cleaned = false;
const cleanup = () => {
  if (cleaned) return;
  cleaned = true;
  chrome.kill("SIGTERM");
  try {
    rmSync(chromeProfile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  } catch {
    // Chrome can briefly hold profile files after SIGTERM; the OS will clear /tmp.
  }
};

process.on("exit", cleanup);
process.on("SIGINT", () => {
  cleanup();
  process.exit(130);
});

const endpoint = await waitForDevtools(chrome);
const pageTarget = await waitForPageTarget(endpoint, siteUrl);
const socket = new WebSocket(pageTarget.webSocketDebuggerUrl);
const pending = new Map();
const blockedRequests = [];
let id = 0;

socket.addEventListener("message", event => {
  const message = JSON.parse(event.data);
  if (message.method === "Network.requestWillBeSent") {
    const url = message.params.request.url;
    if (/fonts\.(googleapis|gstatic)\.com/i.test(url)) blockedRequests.push(url);
  }
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

await send("Network.enable");
await send("Page.enable");
await send("Page.reload", { ignoreCache: true });
await new Promise(resolve => setTimeout(resolve, 1200));

const evaluation = await send("Runtime.evaluate", {
  returnByValue: true,
  expression: `(() => {
    const visibleText = el => !!el && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden";
    const bodyFont = getComputedStyle(document.body).fontFamily;
    const mono = getComputedStyle(document.querySelector(".hero__eyebrow")).fontFamily;
    const navTexts = [...document.querySelectorAll(".nav__links a")].map(a => a.textContent.trim());
    const launch = document.querySelector('.nav__cta a[href*="app.stoken.finance"]');
    const request = document.querySelector('.nav__cta a[href="#request"]');
    const heroTitle = document.querySelector(".hero__title");
    return {
      title: heroTitle?.textContent.replace(/\\s+/g, " ").trim() || "",
      bodyFont,
      mono,
      navTexts,
      launchVisible: visibleText(launch),
      requestVisible: visibleText(request),
      launchText: launch?.textContent.replace(/\\s+/g, " ").trim() || ""
    };
  })()`
});

if (evaluation.exceptionDetails || !evaluation.result?.result?.value) {
  console.error("Homepage foundation test could not evaluate the page.");
  console.error(JSON.stringify(evaluation.exceptionDetails || evaluation.result, null, 2));
  process.exit(1);
}

const result = evaluation.result.result.value;
if (!result || !Array.isArray(result.navTexts)) {
  console.error("Homepage foundation test returned an unexpected payload.");
  console.error(JSON.stringify(evaluation.result.result, null, 2));
  socket.close();
  cleanup();
  process.exit(1);
}
const failures = [];

if (!/Commodity finance\.\s*On-chain\./i.test(result.title)) {
  failures.push(`expected hero headline, got "${result.title}"`);
}
if (!result.navTexts.includes("The Asset") || !result.navTexts.includes("How It Works")) {
  failures.push(`expected primary nav links, got ${JSON.stringify(result.navTexts)}`);
}
if (!result.launchVisible || result.launchText !== "Launch Platform") {
  failures.push("expected visible Launch Platform nav CTA");
}
if (!result.requestVisible) {
  failures.push("expected visible Request Access nav CTA");
}
if (!/Inter/i.test(result.bodyFont)) {
  failures.push(`expected Inter body font, got "${result.bodyFont}"`);
}
if (!/Geist Mono/i.test(result.mono)) {
  failures.push(`expected Geist Mono technical font, got "${result.mono}"`);
}
if (!/@font-face[\s\S]+Inter[\s\S]+(?:assets\/fonts|\.\.\/fonts)/i.test(cssText) || !/@font-face[\s\S]+Geist Mono[\s\S]+(?:assets\/fonts|\.\.\/fonts)/i.test(cssText)) {
  failures.push("expected local @font-face rules under assets/fonts");
}
if (/fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(cssText) || blockedRequests.length) {
  failures.push(`expected no Google Fonts dependency, saw ${blockedRequests.join(", ") || "CSS import"}`);
}

if (failures.length) {
  console.error(`Homepage foundation test failed:\n- ${failures.join("\n- ")}`);
  socket.close();
  cleanup();
  process.exit(1);
} else {
  console.log("Homepage foundation behavior is green.");
  socket.close();
  cleanup();
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
      reject(new Error(`Chrome exited before DevTools was ready: ${code}\\n${stderr}`));
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
  throw new Error("Homepage target not found in Chrome");
}
