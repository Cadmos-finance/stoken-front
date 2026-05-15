import { evaluate, withHomepage } from "./browser-page.mjs";

await withHomepage(async ({ send }) => {
  const result = await evaluate(send, `(() => {
    const metrics = document.querySelector('[data-section="metrics-strip"]');
    const cta = document.querySelector("#request");
    const visibleText = el => !!el && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden";
    const ctaLinks = [...(cta?.querySelectorAll("a") || [])].map(a => ({
      text: a.textContent.replace(/\\s+/g, " ").trim(),
      href: a.getAttribute("href")
    }));
    return {
      metricsPresent: !!metrics,
      metricsVisible: visibleText(metrics),
      metricsText: metrics?.textContent.replace(/\\s+/g, " ").trim() || "",
      ctaVisible: visibleText(cta),
      ctaText: cta?.textContent.replace(/\\s+/g, " ").trim() || "",
      ctaLinks
    };
  })()`);

  const failures = [];
  if (!result.metricsPresent || !result.metricsVisible) failures.push("expected compact metrics strip");
  for (const metric of ["$9T", "25", "360", "1 Stoken"]) {
    if (!result.metricsText.includes(metric)) failures.push(`expected metrics strip to include ${metric}`);
  }
  if (!/qualified institutional investors/i.test(result.ctaText)) failures.push("expected final CTA to retain qualified institutional investor framing");
  if (!result.ctaLinks.some(link => link.text.includes("Request Access") && link.href?.startsWith("mailto:info@stoken.finance"))) {
    failures.push(`expected final Request Access mailto CTA to info@stoken.finance, got ${JSON.stringify(result.ctaLinks)}`);
  }
  if (!result.ctaLinks.some(link => link.text.includes("Talk to the team") && link.href?.startsWith("mailto:info@stoken.finance"))) {
    failures.push(`expected Talk to the team mailto CTA to info@stoken.finance, got ${JSON.stringify(result.ctaLinks)}`);
  }

  if (failures.length) {
    console.error(`Homepage finish test failed:\n- ${failures.join("\n- ")}`);
    process.exit(1);
  }

  console.log("Homepage finish behavior is green.");
});
