import { evaluate, withHomepage } from "./browser-page.mjs";

await withHomepage(async ({ send }) => {
  await waitForStokenReady(send);

  const desktop = await evaluate(send, `(() => {
    const required = [".hero", "[data-section='audience-routing']", "[data-section='proof-band']", "[data-section='facility-preview']", "[data-section='capital-flow']", "[data-section='platform-capabilities']", "[data-section='metrics-strip']", "#request"];
    const visibleText = el => !!el && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden";
    return {
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      missing: required.filter(selector => !visibleText(document.querySelector(selector))),
      googleFontLinks: performance.getEntriesByType("resource").filter(entry => /fonts\\.(googleapis|gstatic)\\.com/i.test(entry.name)).map(entry => entry.name)
    };
  })()`);

  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: true
  });
  await send("Page.reload", { ignoreCache: true });
  await waitForStokenReady(send);

  const mobile = await evaluate(send, `(() => {
    const burger = document.querySelector(".nav__burger");
    burger?.click();
    const mobileMenu = document.querySelector("#mobile-menu");
    const visibleText = el => !!el && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden";
    return {
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      burgerVisible: visibleText(burger),
      expanded: burger?.getAttribute("aria-expanded"),
      menuOpen: document.querySelector(".nav")?.classList.contains("open"),
      mobileLaunch: [...(mobileMenu?.querySelectorAll("a") || [])].some(a => a.textContent.includes("Launch Platform")),
      titleVisible: visibleText(document.querySelector(".hero-headline__title"))
    };
  })()`);

  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }]
  });
  await send("Page.reload", { ignoreCache: true });
  await waitForStokenReady(send);

  const reducedMotion = await evaluate(send, `(() => {
    const reveals = [...document.querySelectorAll(".reveal")];
    const isIdentityTransform = transform => transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)" || transform === "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)";
    const hiddenReveals = reveals.filter(el => {
      const style = getComputedStyle(el);
      return style.opacity === "0" || !isIdentityTransform(style.transform);
    }).length;
    const heroVideo = document.querySelector(".hero__video, .page-head__video");
    return { revealCount: reveals.length, hiddenReveals, heroVideoPaused: heroVideo ? heroVideo.paused : null };
  })()`);

  const failures = [];
  if (desktop.overflow > 2) failures.push(`desktop has horizontal overflow of ${desktop.overflow}px`);
  if (desktop.missing.length) failures.push(`desktop missing visible sections: ${desktop.missing.join(", ")}`);
  if (desktop.googleFontLinks.length) failures.push(`Google font requests detected: ${desktop.googleFontLinks.join(", ")}`);
  if (mobile.overflow > 2) failures.push(`mobile has horizontal overflow of ${mobile.overflow}px`);
  if (!mobile.burgerVisible || mobile.expanded !== "true" || !mobile.menuOpen) failures.push(`mobile menu did not open accessibly: ${JSON.stringify(mobile)}`);
  if (!mobile.mobileLaunch || !mobile.titleVisible) failures.push(`mobile missing launch link or hero title: ${JSON.stringify(mobile)}`);
  if (reducedMotion.hiddenReveals !== 0) {
    failures.push(`reduced motion should reveal content immediately: ${JSON.stringify(reducedMotion)}`);
  }
  if (reducedMotion.heroVideoPaused === false) {
    failures.push(`reduced motion should pause the looping hero video, got ${JSON.stringify(reducedMotion)}`);
  }

  if (failures.length) {
    console.error(`Homepage verification test failed:\n- ${failures.join("\n- ")}`);
    process.exit(1);
  }

  console.log("Homepage responsive and reduced-motion verification is green.");
});

async function waitForStokenReady(send) {
  for (let i = 0; i < 30; i += 1) {
    const ready = await evaluate(send, `document.documentElement.dataset.stokenReady === "true"`);
    if (ready) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("SToken homepage scripts did not finish initializing");
}
