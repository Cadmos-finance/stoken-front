import { evaluate, withHomepage } from "./browser-page.mjs";

await withHomepage(async ({ send }) => {
  const result = await evaluate(send, `(() => {
    const section = document.querySelector('[data-section="facility-preview"]');
    const visibleText = el => !!el && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden";
    const text = section?.textContent.replace(/\\s+/g, " ").trim() || "";
    const terms = [...(section?.querySelectorAll("[data-term]") || [])].map(term => ({
      key: term.getAttribute("data-term"),
      text: term.textContent.replace(/\\s+/g, " ").trim()
    }));
    return {
      present: !!section,
      visible: visibleText(section),
      text,
      terms,
      label: section?.querySelector(".facility-preview__label")?.textContent.replace(/\\s+/g, " ").trim() || ""
    };
  })()`);

  const failures = [];
  if (!result.present || !result.visible) failures.push("expected visible specimen facility preview");
  if (!/specimen|illustrative/i.test(result.label + " " + result.text)) {
    failures.push("expected specimen or illustrative label whenever sample terms are shown");
  }
  for (const expected of ["BBB+", "8.4%", "180 days", "USDC / USDT", "$500,000"]) {
    if (!result.text.includes(expected)) failures.push(`expected facility preview to include ${expected}`);
  }
  if (!/one facility/i.test(result.text) || !/not a live offer/i.test(result.text)) {
    failures.push("expected one-facility and not-live-offer safeguards");
  }

  if (failures.length) {
    console.error(`Homepage facility preview test failed:\n- ${failures.join("\n- ")}`);
    process.exit(1);
  }

  console.log("Homepage facility preview behavior is green.");
});
