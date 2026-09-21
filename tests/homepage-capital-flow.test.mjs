import { evaluate, withHomepage } from "./browser-page.mjs";

await withHomepage(async ({ send }) => {
  const initial = await evaluate(send, `(() => {
    const section = document.querySelector('[data-section="capital-flow"]');
    const visibleText = el => !!el && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden";
    return {
      present: !!section,
      visible: visibleText(section),
      controls: [...(section?.querySelectorAll("[data-flow-step]") || [])].map(button => button.textContent.replace(/\\s+/g, " ").trim()),
      activePanel: section?.querySelector(".capital-flow__panel.is-active")?.textContent.replace(/\\s+/g, " ").trim() || "",
      activeStepBg: getComputedStyle(section?.querySelector(".capital-flow__step.is-active") || document.body).backgroundColor,
      activeStepColor: getComputedStyle(section?.querySelector(".capital-flow__step.is-active") || document.body).color,
      stageBg: getComputedStyle(section?.querySelector(".capital-flow__stage") || document.body).backgroundColor,
      moduleBgImage: getComputedStyle(section?.querySelector(".capital-flow__module") || document.body).backgroundImage
    };
  })()`);

  const failures = [];
  const expected = ["Facility", "Rating", "Tokenization", "Allocation", "Coupon", "Repayment"];
  if (!initial.present || !initial.visible) failures.push("expected visible capital-flow module");
  // Per client direction: the table widget has a dark mesh background, with
  // the active tab + stage panel sitting on top in a dark fill that visually
  // merges with the panel. Either a solid ink fill or a translucent dark
  // overlay over the module's mesh is acceptable.
  const isDarkFill = bg => /rgb\(13,\s*20,\s*28\)/.test(bg) || /rgba?\(13,\s*20,\s*28,\s*0?\.[5-9]/.test(bg);
  if (!isDarkFill(initial.activeStepBg)) failures.push(`expected active flow tab to use dark chart fill, got ${initial.activeStepBg}`);
  if (initial.activeStepColor !== "rgb(249, 246, 230)") failures.push(`expected active flow tab to use cream text, got ${initial.activeStepColor}`);
  if (!isDarkFill(initial.stageBg)) failures.push(`expected flow panel to use dark Background_Chapitre fill, got ${initial.stageBg}`);
  // Module wrapper itself is transparent — only the active tab and stage
  // panel carry the dark mesh, so the green section shows through unselected
  // tabs per PDF page-1 layout.
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
