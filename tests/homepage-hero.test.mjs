import { evaluate, withHomepage } from "./browser-page.mjs";

await withHomepage(async ({ send }) => {
  const result = await evaluate(send, `(() => {
    const visibleText = el => !!el && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden";
    const hero = document.querySelector(".hero");
    const heroBg = document.querySelector(".hero__bg");
    const headline = document.querySelector(".hero-headline");
    const eyebrow = document.querySelector(".hero-headline__eyebrow");
    const ctas = [...document.querySelectorAll(".hero-headline__cta a")].map(a => ({
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
      start: video.dataset.heroStart || "",
      active: video.classList.contains("is-active")
    }));
    return {
      heroVisible: visibleText(hero),
      headlineVisible: visibleText(headline),
      title: document.querySelector(".hero-headline__title")?.textContent.replace(/\\s+/g, " ").trim() || "",
      eyebrow: eyebrow?.textContent.replace(/\\s+/g, " ").trim() || "",
      sub: document.querySelector(".hero-headline__sub")?.textContent.replace(/\\s+/g, " ").trim() || "",
      meta: document.querySelector(".hero-headline__meta")?.textContent.replace(/\\s+/g, " ").trim() || "",
      ctas,
      mediaPresent: !!media,
      mediaVisible: !!media && visibleText(media) && mediaStyle.width !== "0px" && mediaStyle.height !== "0px",
      heroVideos
    };
  })()`);

  const failures = [];
  if (!result.heroVisible) failures.push("expected visible hero video band");
  if (!result.headlineVisible) failures.push("expected visible hero headline section below the video");
  if (!/Commodity\s*finance\s*On-[cC]hain/i.test(result.title)) failures.push(`expected chart-approved headline, got "${result.title}"`);
  if (result.eyebrow) failures.push(`expected no extra proof eyebrow in the chart headline block, got "${result.eyebrow}"`);
  if (!/rated commodity trade finance/i.test(result.sub) || !/Ethereum/i.test(result.sub) || !/Swiss law/i.test(result.sub)) {
    failures.push(`expected tightened institutional hero subcopy, got "${result.sub}"`);
  }
  if (result.meta) failures.push(`expected no extra proof meta line in the chart headline block, got "${result.meta}"`);
  if (!result.ctas.some(cta => cta.visible && /Request access/i.test(cta.text) && cta.href === "#request")) {
    failures.push(`expected Request access hero CTA, got ${JSON.stringify(result.ctas)}`);
  }
  if (!result.ctas.some(cta => cta.visible && cta.text === "Bring a Facility" && cta.href === "for-issuers.html")) {
    failures.push(`expected Bring a Facility hero CTA, got ${JSON.stringify(result.ctas)}`);
  }
  if (!result.mediaPresent || !result.mediaVisible) failures.push("expected nonblank hero media fallback");
  if (result.heroVideos.length !== 1) failures.push(`expected exactly one perfect-loop hero video, got ${JSON.stringify(result.heroVideos)}`);
  if (!/stoken-hero-loop\.mp4/.test(result.heroVideos[0]?.src || "")) {
    failures.push(`expected the chart-supplied stoken-hero-loop.mp4 source, got ${JSON.stringify(result.heroVideos)}`);
  }
  if (!result.heroVideos[0]?.autoplay) failures.push(`expected hero video to autoplay, got ${JSON.stringify(result.heroVideos)}`);
  if (!result.heroVideos[0]?.loop) failures.push(`expected hero video to loop natively (perfect loop), got ${JSON.stringify(result.heroVideos)}`);
  if (!result.heroVideos.every(video => video.muted && video.playsInline)) {
    failures.push(`expected hero video to be muted and inline, got ${JSON.stringify(result.heroVideos)}`);
  }
  if (result.heroVideos[0]?.start !== "0") {
    failures.push(`expected homepage hero video to start at 0s, got ${JSON.stringify(result.heroVideos)}`);
  }

  if (failures.length) {
    console.error(`Homepage hero test failed:\n- ${failures.join("\n- ")}`);
    process.exit(1);
  }

  console.log("Homepage hero behavior is green.");
});
