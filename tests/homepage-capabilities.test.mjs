import { evaluate, withHomepage } from "./browser-page.mjs";

await withHomepage(async ({ send }) => {
  const result = await evaluate(send, `(() => {
    const section = document.querySelector('[data-section="platform-capabilities"]');
    const visibleText = el => !!el && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden";
    const capabilities = [...(section?.querySelectorAll("[data-capability]") || [])].map(item => ({
      key: item.getAttribute("data-capability"),
      text: item.textContent.replace(/\\s+/g, " ").trim(),
      visible: visibleText(item)
    }));
    const textLines = [...(section?.querySelectorAll("svg text") || [])].map(item => item.textContent.replace(/\\s+/g, " ").trim()).filter(Boolean);
    return {
      present: !!section,
      visible: visibleText(section),
      platformText: section?.textContent.replace(/\\s+/g, " ").trim() || "",
      graphicText: textLines.join(" "),
      capabilities
    };
  })()`);

  const failures = [];
  const expected = ["Origination", "Rating", "Tokenization", "Distribution"];
  if (!result.present || !result.visible) failures.push("expected visible platform capability system section");
  if (!/Stoken Platform/i.test(result.platformText)) failures.push("expected central Stoken Platform label");
  for (const capability of expected) {
    // SVG <text> renders the labels in uppercase by design; match case-insensitive.
    const probe = capability.toLowerCase();
    if (!result.capabilities.some(item => item.visible && item.text.toLowerCase().includes(probe))) {
      failures.push(`expected visible ${capability} capability, got ${JSON.stringify(result.capabilities)}`);
    }
  }
  if (!/Four capabilities/i.test(result.platformText) || !/One platform/i.test(result.platformText)) {
    failures.push("expected four-capabilities one-platform framing");
  }
  if (!/Stoken scoring/i.test(result.platformText) || !/RiskCalc/i.test(result.platformText) || !/investor capital is committed/i.test(result.platformText)) {
    failures.push("expected updated 02 Rating methodology copy in What we do");
  }
  if (!/Issuers are screened and assessed before any external rating or distribution process begins/i.test(result.graphicText)) {
    failures.push("expected restored 01 Origination copy in What we do");
  }

  if (failures.length) {
    console.error(`Homepage capabilities test failed:\n- ${failures.join("\n- ")}`);
    process.exit(1);
  }

  console.log("Homepage capability system behavior is green.");
});
