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
    return {
      present: !!section,
      visible: visibleText(section),
      platformText: section?.textContent.replace(/\\s+/g, " ").trim() || "",
      capabilities
    };
  })()`);

  const failures = [];
  const expected = ["Origination", "Rating", "Tokenization", "Distribution"];
  if (!result.present || !result.visible) failures.push("expected visible platform capability system section");
  if (!/Stoken Platform/i.test(result.platformText)) failures.push("expected central Stoken Platform label");
  for (const capability of expected) {
    if (!result.capabilities.some(item => item.visible && item.text.includes(capability))) {
      failures.push(`expected visible ${capability} capability, got ${JSON.stringify(result.capabilities)}`);
    }
  }
  if (!/Four capabilities/i.test(result.platformText) || !/One platform/i.test(result.platformText)) {
    failures.push("expected four-capabilities one-platform framing");
  }

  if (failures.length) {
    console.error(`Homepage capabilities test failed:\n- ${failures.join("\n- ")}`);
    process.exit(1);
  }

  console.log("Homepage capability system behavior is green.");
});
