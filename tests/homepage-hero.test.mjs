import { evaluate, withHomepage } from "./browser-page.mjs";

await withHomepage(async ({ send }) => {
  const result = await evaluate(send, `(() => {
    const visibleText = el => !!el && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden";
    const hero = document.querySelector(".hero");
    const playlist = document.querySelector("[data-hero-video-playlist]");
    const eyebrow = document.querySelector(".hero__eyebrow");
    const ctas = [...document.querySelectorAll(".hero__cta a")].map(a => ({
      text: a.textContent.replace(/\\s+/g, " ").trim(),
      href: a.getAttribute("href"),
      visible: visibleText(a)
    }));
    const media = document.querySelector(".hero__media, .hero__video");
    const mediaStyle = media ? getComputedStyle(media) : null;
    const heroVideos = [...document.querySelectorAll("[data-hero-video]")].map(video => ({
      src: video.querySelector("source")?.getAttribute("src") || "",
      muted: video.muted,
      autoplay: video.autoplay,
      playsInline: video.playsInline,
      loop: video.loop,
      preload: video.getAttribute("preload"),
      active: video.classList.contains("is-active")
    }));
    return {
      heroVisible: visibleText(hero),
      title: document.querySelector(".hero__title")?.textContent.replace(/\\s+/g, " ").trim() || "",
      eyebrow: eyebrow?.textContent.replace(/\\s+/g, " ").trim() || "",
      sub: document.querySelector(".hero__sub")?.textContent.replace(/\\s+/g, " ").trim() || "",
      meta: document.querySelector(".hero__meta")?.textContent.replace(/\\s+/g, " ").trim() || "",
      ctas,
      mediaPresent: !!media,
      mediaVisible: !!media && visibleText(media) && mediaStyle.width !== "0px" && mediaStyle.height !== "0px",
      transitionMs: playlist?.dataset.transitionMs || "",
      transitionLead: playlist?.dataset.transitionLead || "",
      heroVideos
    };
  })()`);

  const failures = [];
  if (!result.heroVisible) failures.push("expected visible hero");
  if (!/Commodity finance\.\s*On-chain\./i.test(result.title)) failures.push(`expected approved headline, got "${result.title}"`);
  if (!/Swiss DLT Act/i.test(result.eyebrow) || !/Ledger-based Securities/i.test(result.eyebrow)) {
    failures.push(`expected Swiss DLT Act and Ledger-based Securities moat, got "${result.eyebrow}"`);
  }
  if (!/rated commodity trade finance/i.test(result.sub) || !/Ethereum/i.test(result.sub) || !/Swiss law/i.test(result.sub)) {
    failures.push(`expected tightened institutional hero subcopy, got "${result.sub}"`);
  }
  if (!/Stoken S\.A\./i.test(result.meta) || !/Geneva/i.test(result.meta) || !/SO-FIT/i.test(result.meta) || !/FINMA-recognised SRO/i.test(result.meta)) {
    failures.push(`expected full hero proof line, got "${result.meta}"`);
  }
  if (!result.ctas.some(cta => cta.visible && cta.text === "Request Access" && cta.href === "#request")) {
    failures.push(`expected Request Access hero CTA, got ${JSON.stringify(result.ctas)}`);
  }
  if (!result.ctas.some(cta => cta.visible && cta.text === "Bring a Facility" && cta.href === "for-issuers.html")) {
    failures.push(`expected Bring a Facility hero CTA, got ${JSON.stringify(result.ctas)}`);
  }
  if (!result.mediaPresent || !result.mediaVisible) failures.push("expected nonblank hero media fallback");
  if (result.transitionMs !== "1800" || result.transitionLead !== "1.8") {
    failures.push(`expected configured hero video crossfade timing, got ${JSON.stringify({ transitionMs: result.transitionMs, transitionLead: result.transitionLead })}`);
  }
  if (result.heroVideos.length !== 2) failures.push(`expected two hero playlist videos, got ${JSON.stringify(result.heroVideos)}`);
  if (!/256179086/.test(result.heroVideos[0]?.src || "")) failures.push(`expected Pond5 256179086 to play first, got ${JSON.stringify(result.heroVideos)}`);
  if (!/227742770/.test(result.heroVideos[1]?.src || "")) failures.push(`expected Pond5 227742770 to play second, got ${JSON.stringify(result.heroVideos)}`);
  if (!result.heroVideos[0]?.autoplay) failures.push(`expected first playlist video to request native autoplay, got ${JSON.stringify(result.heroVideos)}`);
  if (!result.heroVideos.every(video => video.muted && video.playsInline && !video.loop)) {
    failures.push(`expected playlist videos to be muted, inline, and non-looping individually, got ${JSON.stringify(result.heroVideos)}`);
  }
  if (!result.heroVideos[0]?.active) failures.push(`expected first playlist video to be active initially, got ${JSON.stringify(result.heroVideos)}`);

  if (failures.length) {
    console.error(`Homepage hero test failed:\n- ${failures.join("\n- ")}`);
    process.exit(1);
  }

  console.log("Homepage hero behavior is green.");
});
