import { evaluate, withHomepage } from "./browser-page.mjs";

await withHomepage(async ({ send }) => {
  const initial = await evaluate(send, `(() => {
    const section = document.querySelector('[data-section="capital-flow"]');
    const visibleText = el => !!el && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden";
    return {
      present: !!section,
      visible: visibleText(section),
      controls: [...(section?.querySelectorAll("[data-flow-step]") || [])].map(button => button.textContent.replace(/\\s+/g, " ").trim()),
      activePanel: section?.querySelector(".capital-flow__panel.is-active")?.textContent.replace(/\\s+/g, " ").trim() || ""
    };
  })()`);

  const failures = [];
  const expected = ["Facility", "Rating", "Tokenization", "Allocation", "Coupon", "Repayment"];
  if (!initial.present || !initial.visible) failures.push("expected visible capital-flow module");
  for (const step of expected) {
    if (!initial.controls.some(control => control.includes(step))) {
      failures.push(`expected capital-flow control for ${step}, got ${JSON.stringify(initial.controls)}`);
    }
  }

  const visited = [];
  if (initial.present) {
    for (const step of expected) {
      const panel = await evaluate(send, `(() => {
        const section = document.querySelector('[data-section="capital-flow"]');
        const button = [...section.querySelectorAll("[data-flow-step]")].find(control => control.textContent.includes("${step}"));
        button?.click();
        return section.querySelector(".capital-flow__panel.is-active")?.textContent.replace(/\\s+/g, " ").trim() || "";
      })()`);
      visited.push(panel);
      if (!panel.includes(step)) failures.push(`expected active panel to mention ${step}, got "${panel}"`);
    }

    if (!visited.some(panel => /whitelisted|investor/i.test(panel))) failures.push("expected allocation/investor language in flow panels");
    if (!visited.some(panel => /coupon/i.test(panel))) failures.push("expected coupon state in flow panels");
    if (!visited.some(panel => /repayment|principal/i.test(panel))) failures.push("expected repayment/principal state in flow panels");
  }

  if (failures.length) {
    console.error(`Homepage capital-flow test failed:\n- ${failures.join("\n- ")}`);
    process.exit(1);
  }

  console.log("Homepage capital-flow behavior is green.");
});
