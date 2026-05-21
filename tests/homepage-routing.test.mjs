import { evaluate, withHomepage } from "./browser-page.mjs";

await withHomepage(async ({ send }) => {
  const result = await evaluate(send, `(() => {
    const section = document.querySelector('[data-section="audience-routing"]');
    const visibleText = el => !!el && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden";
    const cards = [...(section?.querySelectorAll(".audience-card") || [])].map(card => {
      const inner = card.querySelector(".audience-card__inner");
      const innerStyle = inner ? getComputedStyle(inner) : null;
      return {
        label: card.querySelector(".audience-card__label")?.textContent.replace(/\\s+/g, " ").trim() || "",
        heading: card.querySelector("h2, h3")?.textContent.replace(/\\s+/g, " ").trim() || "",
        body: card.textContent.replace(/\\s+/g, " ").trim(),
        link: card.querySelector("a")?.getAttribute("href") || "",
        linkText: card.querySelector("a")?.textContent.replace(/\\s+/g, " ").trim() || "",
        innerBackground: innerStyle?.backgroundColor || "",
        innerHasDarkBg: !!innerStyle && (/rgba?\\(13,\\s*20,\\s*28/.test(innerStyle.backgroundImage || "") || /rgb\\(13,\\s*20,\\s*28\\)/.test(innerStyle?.backgroundColor || "")),
        headingOpacity: card.querySelector("h2, h3") ? getComputedStyle(card.querySelector("h2, h3")).opacity : "",
        classList: card.className,
        borderColor: getComputedStyle(card).borderColor || ""
      };
    });
    const style = section ? getComputedStyle(section) : null;
    return {
      present: !!section,
      visible: visibleText(section),
      backgroundColor: style?.backgroundColor || "",
      backgroundImage: style?.backgroundImage || "",
      color: style?.color || "",
      cards
    };
  })()`);

  const failures = [];
  if (!result.present || !result.visible) failures.push("expected visible investor/issuer routing section");
  // Section background should be green-toned (rgb 43,100,117 or near) — either as color or as the green BG image overlay
  const isGreenSection = /rgb\(43,\s*100,\s*117\)/.test(result.backgroundColor) ||
                         /bg-green\.jpg/.test(result.backgroundImage) ||
                         /43,\s*100,\s*117/.test(result.backgroundImage);
  if (!isGreenSection) {
    failures.push(`expected green section background, got color="${result.backgroundColor}" image="${result.backgroundImage}"`);
  }
  if (!result.cards.some(card => /investors/i.test(card.label) && /qualified|institutional|on-chain/i.test(card.body) && card.link === "#request")) {
    failures.push(`expected investor routing card, got ${JSON.stringify(result.cards)}`);
  }
  if (!result.cards.some(card => /issuers/i.test(card.label) && /commodity|facility|capital/i.test(card.body) && card.link === "for-issuers.html")) {
    failures.push(`expected issuer routing card, got ${JSON.stringify(result.cards)}`);
  }
  // The two cards must carry distinct modifier classes so the hover SVG can target each side
  if (!result.cards.some(card => /audience-card--investors/.test(card.classList))) {
    failures.push("expected investor card to have audience-card--investors modifier (for hover illustration target)");
  }
  if (!result.cards.some(card => /audience-card--issuers/.test(card.classList))) {
    failures.push("expected issuer card to have audience-card--issuers modifier (for hover illustration target)");
  }
  // Per client direction: BOTH cards transparent by default, dark mesh fills
  // the full card on hover. No default-dark for the investor card.
  if (result.cards.some(card => card.innerHasDarkBg)) {
    failures.push(`expected audience cards transparent by default (dark fill only on hover), got ${JSON.stringify(result.cards)}`);
  }
  if (result.cards.some(card => card.headingOpacity === "0")) {
    failures.push(`expected audience card copy to stay visible over dark hover/default states, got ${JSON.stringify(result.cards)}`);
  }

  if (failures.length) {
    console.error(`Homepage routing test failed:\n- ${failures.join("\n- ")}`);
    process.exit(1);
  }

  console.log("Homepage audience routing behavior is green.");
});
