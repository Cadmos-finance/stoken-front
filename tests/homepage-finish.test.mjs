import { evaluate, withHomepage } from "./browser-page.mjs";

await withHomepage(async ({ send }) => {
  const result = await evaluate(send, `(() => {
    const metrics = document.querySelector('[data-section="metrics-strip"]');
    const investorEdge = document.querySelector('[data-section="investor-edge"]');
    const cta = document.querySelector("#request");
    const visibleText = el => !!el && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden";
    const ctaLinks = [...(cta?.querySelectorAll("a") || [])].map(a => ({
      text: a.textContent.replace(/\\s+/g, " ").trim(),
      href: a.getAttribute("href")
    }));
    const investorEdgeText = [...(investorEdge?.querySelectorAll("svg text") || [])]
      .map(item => item.textContent.replace(/\\s+/g, " ").trim())
      .filter(Boolean)
      .join(" ");
    return {
      metricsPresent: !!metrics,
      metricsVisible: visibleText(metrics),
      metricsText: metrics?.textContent.replace(/\\s+/g, " ").trim() || "",
      investorEdgeVisible: visibleText(investorEdge),
      investorEdgeText,
      ctaVisible: visibleText(cta),
      ctaText: cta?.textContent.replace(/\\s+/g, " ").trim() || "",
      ctaLinks
    };
  })()`);

  const failures = [];
  if (!result.metricsPresent || !result.metricsVisible) failures.push("expected compact metrics strip");
  for (const metric of ["$9T", "50", "360", "1 Stoken"]) {
    if (!result.metricsText.includes(metric)) failures.push(`expected metrics strip to include ${metric}`);
  }
  if (!result.investorEdgeVisible) failures.push("expected investor edge section to be visible");
  if (!/ORIGINATION QUALITY/i.test(result.investorEdgeText) || !/world-leading commodity finance banks/i.test(result.investorEdgeText) || !/is offered to investors/i.test(result.investorEdgeText)) {
    failures.push("expected updated Origination Quality copy in investor edge");
  }
  if (!/qualified institutional investors/i.test(result.ctaText)) failures.push("expected final CTA to retain qualified institutional investor framing");
  if (!result.ctaLinks.some(link => /Request access/i.test(link.text) && link.href?.startsWith("mailto:info@stoken.finance"))) {
    failures.push(`expected final Request access mailto CTA to info@stoken.finance, got ${JSON.stringify(result.ctaLinks)}`);
  }
  if (!result.ctaLinks.some(link => link.text.includes("Get in touch") && link.href === "for-issuers.html")) {
    failures.push(`expected Get in touch secondary CTA, got ${JSON.stringify(result.ctaLinks)}`);
  }

  if (failures.length) {
    console.error(`Homepage finish test failed:\n- ${failures.join("\n- ")}`);
    process.exit(1);
  }

  console.log("Homepage finish behavior is green.");
});
