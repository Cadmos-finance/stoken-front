import { evaluate, withHomepage } from "./browser-page.mjs";

await withHomepage(async ({ send }) => {
  const result = await evaluate(send, `(() => {
    const section = document.querySelector('[data-section="audience-routing"]');
    const visibleText = el => !!el && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden";
    const cards = [...(section?.querySelectorAll(".audience-card") || [])].map(card => ({
      label: card.querySelector(".audience-card__label")?.textContent.replace(/\\s+/g, " ").trim() || "",
      heading: card.querySelector("h2, h3")?.textContent.replace(/\\s+/g, " ").trim() || "",
      body: card.textContent.replace(/\\s+/g, " ").trim(),
      link: card.querySelector("a")?.getAttribute("href") || "",
      linkText: card.querySelector("a")?.textContent.replace(/\\s+/g, " ").trim() || "",
      image: card.querySelector(".audience-card__image")?.getAttribute("src") || "",
      imageAlt: card.querySelector(".audience-card__image")?.getAttribute("alt")
    }));
    const style = section ? getComputedStyle(section) : null;
    return {
      present: !!section,
      visible: visibleText(section),
      background: style?.backgroundColor || "",
      color: style?.color || "",
      cards
    };
  })()`);

  const failures = [];
  if (!result.present || !result.visible) failures.push("expected visible investor/issuer routing section");
  if (!/rgb\(249,\s*246,\s*230\)/i.test(result.background)) failures.push(`expected cream contrast background, got "${result.background}"`);
  if (!result.cards.some(card => /investors/i.test(card.label) && /qualified|institutional|on-chain/i.test(card.body) && card.link === "#request")) {
    failures.push(`expected investor routing card, got ${JSON.stringify(result.cards)}`);
  }
  if (!result.cards.some(card => /issuers/i.test(card.label) && /commodity|facility|capital/i.test(card.body) && card.link === "for-issuers.html")) {
    failures.push(`expected issuer routing card, got ${JSON.stringify(result.cards)}`);
  }
  if (!result.cards.some(card => /investors/i.test(card.label) && /investors-trade-finance\.jpg/i.test(card.image) && card.imageAlt === "")) {
    failures.push(`expected decorative investor trade-finance hover image, got ${JSON.stringify(result.cards)}`);
  }
  if (!result.cards.some(card => /issuers/i.test(card.label) && /issuers-trade-finance\.jpg/i.test(card.image) && card.imageAlt === "")) {
    failures.push(`expected decorative issuer trade-finance hover image, got ${JSON.stringify(result.cards)}`);
  }

  if (failures.length) {
    console.error(`Homepage routing test failed:\n- ${failures.join("\n- ")}`);
    process.exit(1);
  }

  console.log("Homepage audience routing behavior is green.");
});
