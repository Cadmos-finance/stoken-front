import { writeFileSync } from "node:fs";
import { withHomepage, evaluate } from "../tests/browser-page.mjs";

await withHomepage(async ({ send }) => {
  await new Promise(r => setTimeout(r, 1800));
  const docHeight = await evaluate(send, "document.documentElement.scrollHeight");
  const viewportHeight = await evaluate(send, "window.innerHeight");
  console.log("doc=" + docHeight + " viewport=" + viewportHeight);

  const shot = async () => {
    const msg = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    return Buffer.from(msg.result.data, "base64");
  };

  // Capture top of page — nav should be transparent over the video
  await evaluate(send, "window.scrollTo(0, 0)");
  await new Promise(r => setTimeout(r, 300));
  writeFileSync("/tmp/nav-top.png", await shot());

  // Scroll down to trigger .scrolled state — dispatch native scroll event in case the listener is keyed off it
  await evaluate(send, `document.documentElement.scrollTop = 600; document.body.scrollTop = 600; window.dispatchEvent(new Event("scroll"));`);
  await new Promise(r => setTimeout(r, 600));
  writeFileSync("/tmp/nav-scrolled.png", await shot());

  const scrolledState = await evaluate(send, `JSON.stringify({
    cls: document.querySelector(".nav").className,
    bg: getComputedStyle(document.querySelector(".nav")).backgroundImage.slice(0, 120),
    scrollY: window.scrollY,
  })`);
  console.log("SCROLLED-state:", scrolledState);

  // Scroll to audience-router for cards + hover capture
  const audienceY = await evaluate(send, `Math.round(document.querySelector(".audience-router").getBoundingClientRect().top + window.scrollY - 80)`);
  await evaluate(send, `window.scrollTo({ top: ${audienceY}, behavior: 'instant' });`);
  await new Promise(r => setTimeout(r, 400));
  writeFileSync("/tmp/audience-default.png", await shot());

  // Hover investors card
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 350, y: 500, button: "none", clickCount: 0 });
  await new Promise(r => setTimeout(r, 600));
  writeFileSync("/tmp/audience-investors-hover.png", await shot());

  // Hover issuers card
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1050, y: 500, button: "none", clickCount: 0 });
  await new Promise(r => setTimeout(r, 600));
  writeFileSync("/tmp/audience-issuers-hover.png", await shot());

  // Full-page screenshot to verify section background mapping
  await evaluate(send, `window.scrollTo({ top: 0, behavior: 'instant' });`);
  await new Promise(r => setTimeout(r, 300));
  const fullMsg = await send("Page.captureScreenshot", { format: "jpeg", quality: 70, captureBeyondViewport: true });
  writeFileSync("/tmp/full-page.jpg", Buffer.from(fullMsg.result.data, "base64"));

  // Scroll to proof-band
  const proofY = await evaluate(send, `Math.round(document.querySelector(".proof-band").getBoundingClientRect().top + window.scrollY - 60)`);
  await evaluate(send, `window.scrollTo({ top: ${proofY}, behavior: 'instant' });`);
  await new Promise(r => setTimeout(r, 400));
  writeFileSync("/tmp/proof-default.png", await shot());

  // Scroll to investor-edge / swiss-framework transition
  const teY = await evaluate(send, `Math.round(document.querySelector(".swiss-framework").getBoundingClientRect().top + window.scrollY - 300)`);
  await evaluate(send, `window.scrollTo({ top: ${teY}, behavior: 'instant' });`);
  await new Promise(r => setTimeout(r, 400));
  writeFileSync("/tmp/green-to-dark.png", await shot());

  // Capture capital-flow ("From facility to token" / "See how capital moves") section
  const cfY = await evaluate(send, `Math.round(document.querySelector(".capital-flow").getBoundingClientRect().top + window.scrollY - 60)`);
  await evaluate(send, `window.scrollTo({ top: ${cfY}, behavior: 'instant' });`);
  await new Promise(r => setTimeout(r, 400));
  writeFileSync("/tmp/capital-flow.png", await shot());

  // Click COUPON tab to verify the bug
  await evaluate(send, `document.querySelector('[data-flow-step="coupon"]').click();`);
  await new Promise(r => setTimeout(r, 400));
  writeFileSync("/tmp/capital-flow-coupon.png", await shot());

  // Debug: capture computed dimensions of module, controls, stage, panel
  const dims = await evaluate(send, `(() => {
    const m = document.querySelector(".capital-flow__module").getBoundingClientRect();
    const c = document.querySelector(".capital-flow__controls").getBoundingClientRect();
    const s = document.querySelector(".capital-flow__stage").getBoundingClientRect();
    const p = document.querySelector(".capital-flow__panel.is-active").getBoundingClientRect();
    return JSON.stringify({
      module: { y: Math.round(m.y), h: Math.round(m.height) },
      controls: { y: Math.round(c.y), h: Math.round(c.height) },
      stage: { y: Math.round(s.y), h: Math.round(s.height) },
      panel: { y: Math.round(p.y), h: Math.round(p.height) },
    });
  })()`);
  console.log("DIMS:", dims);

  await evaluate(send, `document.querySelector('[data-flow-step="repayment"]').click();`);
  await new Promise(r => setTimeout(r, 400));
  writeFileSync("/tmp/capital-flow-repayment.png", await shot());

  // Reset to facility
  await evaluate(send, `document.querySelector('[data-flow-step="facility"]').click();`);
  await new Promise(r => setTimeout(r, 200));

  // Specimen facility (STK-GRN-180 table)
  const fpY = await evaluate(send, `Math.round(document.querySelector(".facility-preview-section").getBoundingClientRect().top + window.scrollY - 60)`);
  await evaluate(send, `window.scrollTo({ top: ${fpY}, behavior: 'instant' });`);
  await new Promise(r => setTimeout(r, 400));
  writeFileSync("/tmp/specimen.png", await shot());

  // Capability platform
  const capY = await evaluate(send, `Math.round(document.querySelector(".capability-system").getBoundingClientRect().top + window.scrollY - 60)`);
  await evaluate(send, `window.scrollTo({ top: ${capY}, behavior: 'instant' });`);
  await new Promise(r => setTimeout(r, 400));
  writeFileSync("/tmp/capability.png", await shot());

  // Tight crop of just the facility-card element for pixel comparison
  await evaluate(send, `document.querySelectorAll(".reveal").forEach(el => el.classList.add("in"));`);
  await evaluate(send, `document.querySelector(".facility-card").scrollIntoView({ block: "center", behavior: "instant" });`);
  await new Promise(r => setTimeout(r, 500));
  const cardProbe = await evaluate(send, `(() => { const r = document.querySelector(".facility-card").getBoundingClientRect(); return JSON.stringify({x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height), op: getComputedStyle(document.querySelector(".facility-card")).opacity}); })()`);
  console.log("CARD:", cardProbe);
  const cardBox = await evaluate(send, `(() => {
    const r = document.querySelector(".facility-card").getBoundingClientRect();
    return JSON.stringify({ x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) });
  })()`);
  const cb = JSON.parse(cardBox);
  const cardMsg = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false, clip: { x: cb.x, y: cb.y, width: cb.w, height: cb.h, scale: 1 } });
  writeFileSync("/tmp/facility-card.png", Buffer.from(cardMsg.result.data, "base64"));

  // Force :hover via CDP so we can screenshot the hover state in headless
  await send("DOM.enable");
  await send("CSS.enable");
  const docMsg = await send("DOM.getDocument");
  const docNodeId = docMsg.result?.root?.nodeId;
  const qsMsg = await send("DOM.querySelector", { nodeId: docNodeId, selector: ".proof-logo--moodys" });
  console.log("moodys nodeId:", qsMsg.result?.nodeId);
  await send("CSS.forcePseudoState", { nodeId: qsMsg.result.nodeId, forcedPseudoClasses: ["hover"] });
  await new Promise(r => setTimeout(r, 400));
  const hoverProbe = await evaluate(send, `(() => {
    const el = document.querySelector('.proof-logo--moodys');
    const img = el.querySelector('img');
    return JSON.stringify({
      bgColor: getComputedStyle(el).backgroundColor,
      borderColor: getComputedStyle(el).borderColor,
      imgFilter: getComputedStyle(img).filter,
    });
  })()`);
  console.log("forced-hover probe:", hoverProbe);
  writeFileSync("/tmp/proof-hover.png", await shot());
  await send("CSS.forcePseudoState", { nodeId: qsMsg.result.nodeId, forcedPseudoClasses: [] });
});
