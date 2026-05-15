import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

export const root = path.resolve(new URL("..", import.meta.url).pathname);
export const homepageUrl = `file://${path.join(root, "site/index.html")}`;

export async function withHomepage(test) {
  const chromeProfile = mkdtempSync(path.join(tmpdir(), "stoken-homepage-test-"));
  const chrome = spawn("google-chrome", [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-crash-reporter",
    "--remote-debugging-port=0",
    `--user-data-dir=${chromeProfile}`,
    "--window-size=1440,1000",
    homepageUrl
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

  process.once("exit", cleanup);

  const endpoint = await waitForDevtools(chrome);
  const pageTarget = await waitForPageTarget(endpoint, homepageUrl);
  const socket = new WebSocket(pageTarget.webSocketDebuggerUrl);
  const pending = new Map();
  const networkRequests = [];
  let id = 0;

  socket.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    if (message.method === "Network.requestWillBeSent") {
      networkRequests.push(message.params.request.url);
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

  try {
    await test({ send, networkRequests });
  } finally {
    socket.close();
    cleanup();
  }
}

export async function evaluate(send, expression) {
  const evaluation = await send("Runtime.evaluate", {
    returnByValue: true,
    expression
  });
  if (evaluation.exceptionDetails || !evaluation.result?.result) {
    throw new Error(`Could not evaluate page: ${JSON.stringify(evaluation.exceptionDetails || evaluation.result, null, 2)}`);
  }
  return evaluation.result.result.value;
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
  throw new Error("Homepage target not found in Chrome");
}
