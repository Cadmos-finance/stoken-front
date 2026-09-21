import { evaluate, withHomepage } from "./browser-page.mjs";

await withHomepage(async ({ send }) => {
  const result = await evaluate(send, `(() => {
    const proof = document.querySelector('[data-section="proof-band"]');
    const visibleText = el => !!el && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden";
    const items = [...(proof?.querySelectorAll(".proof-logo") || [])].map(item => {
      const style = getComputedStyle(item);
      const img = item.querySelector("img");
      return {
        label: item.getAttribute("aria-label") || item.textContent.replace(/\\s+/g, " ").trim(),
        text: item.textContent.replace(/\\s+/g, " ").trim(),
        imageSrc: img?.getAttribute("src") || "",
        imageAlt: img?.getAttribute("alt") || "",
        imageLoaded: !!img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0,
        href: item.getAttribute("href") || "",
        target: item.getAttribute("target") || "",
        rel: item.getAttribute("rel") || "",
        captionLines: item.querySelector("span")?.getClientRects().length || 0,
        visible: visibleText(item),
        filter: style.filter,
        opacity: style.opacity
      };
    });
    const proofTop = proof?.getBoundingClientRect().top ?? 99999;
    const whatWeDoTop = document.querySelector('[data-section="platform-capabilities"]')?.getBoundingClientRect().top ?? 0;
    const labelLines = [...(proof?.querySelectorAll(".proof-band__label-copy span") || [])].map(line => line.textContent.trim());
    return { present: !!proof, visible: visibleText(proof), items, labelLines, appearsBeforeWhatWeDo: proofTop < whatWeDoTop };
  })()`);

  const failures = [];
  const expected = [
    { label: "Moody's", src: "assets/img/partners/moodys.png", href: "https://www.moodys.com/web/en/us/capabilities/credit-risk.html" },
    { label: "Cadmos", src: "assets/img/partners/cadmos-gold.svg", href: "https://www.cadmos.finance/" },
    { label: "SO-FIT", src: "assets/img/partners/so-fit.svg", href: "https://so-fit.ch/" },
    { label: "Bonnard Lawson", src: "assets/img/partners/bonnard-lawson.svg", href: "https://www.bonnard-lawson.com/expertise/technology-outsourcing/" }
  ];
  if (!result.present || !result.visible) failures.push("expected visible high-trust proof band");
  if (JSON.stringify(result.labelLines) !== JSON.stringify(["Regulated financial intermediation,", "Integrating industry-", "leading infrastructure."])) {
    failures.push(`expected three-line proof-band label, got ${JSON.stringify(result.labelLines)}`);
  }
  for (const { label, src, href } of expected) {
    const item = result.items.find(entry => entry.visible && entry.label.includes(label));
    if (!item) {
      failures.push(`expected visible proof item for ${label}, got ${JSON.stringify(result.items)}`);
      continue;
    }
    if (!item.imageSrc.includes(src) || !item.imageAlt.includes(label)) {
      failures.push(`expected real image logo for ${label} from ${src}, got ${JSON.stringify(item)}`);
    }
    if (!item.imageLoaded) {
      failures.push(`expected ${label} logo image to load, got ${JSON.stringify(item)}`);
    }
    if (item.href !== href || item.target !== "_blank" || !item.rel.includes("noopener")) {
      failures.push(`expected ${label} logo to link to partner site ${href}, got ${JSON.stringify(item)}`);
    }
    if (label === "SO-FIT" && item.captionLines !== 1) {
      failures.push(`expected SO-FIT caption to stay on one line, got ${JSON.stringify(item)}`);
    }
  }
  if (!result.appearsBeforeWhatWeDo) failures.push("expected proof band to appear before the What we do section");

  if (failures.length) {
    console.error(`Homepage proof band test failed:\n- ${failures.join("\n- ")}`);
    process.exit(1);
  }

  console.log("Homepage proof band behavior is green.");
});
