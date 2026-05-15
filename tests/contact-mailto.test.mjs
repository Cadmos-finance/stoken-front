import { readFileSync } from "node:fs";
import path from "node:path";
import { root } from "./browser-page.mjs";

const requestAccessMailto = "mailto:info@stoken.finance?subject=Request%20Access%20%E2%80%94%20Stoken";
const pages = ["index.html", "the-asset.html", "how-it-works.html", "for-issuers.html", "about.html", "legal.html"];
const failures = [];

for (const page of pages) {
  const html = readFileSync(path.join(root, "site", page), "utf8");
  if (!html.includes(`<a class="btn btn--ghost" href="${requestAccessMailto}">Request Access</a>`)) {
    failures.push(`${page}: expected desktop nav Request Access to open request mailto`);
  }
  if (!html.includes(`<a href="${requestAccessMailto}">Request Access</a>`)) {
    failures.push(`${page}: expected mobile nav Request Access to open request mailto`);
  }
  if (!html.includes(`<a href="index.html" aria-label="Stoken home"><img src="assets/img/logos/stoken-cream.svg" alt="Stoken"></a>`)) {
    failures.push(`${page}: expected footer Stoken logo to link home`);
  }
}

const aboutHtml = readFileSync(path.join(root, "site/about.html"), "utf8");
const contactHtml = aboutHtml.match(/<section class="section section--cream" id="contact"[\s\S]*?<\/section>/)?.[0] || "";
const visibleEmailLinks = contactHtml.match(/>info@stoken\.finance</g) || [];
const contactButtons = contactHtml.match(/class="btn contact-card__button"/g) || [];
const contactTextBlocks = contactHtml.match(/class="contact-card__text"/g) || [];

if (visibleEmailLinks.length !== 0) {
  failures.push(`expected About contact cards not to render repeated clear email text, got ${visibleEmailLinks.length}`);
}
if (contactButtons.length !== 3) {
  failures.push(`expected one mailto button per About contact card, got ${contactButtons.length}`);
}
if (contactTextBlocks.length !== 3) {
  failures.push(`expected balanced contact-card text blocks, got ${contactTextBlocks.length}`);
}
for (const label of ["Request access", "Discuss facility", "Contact office"]) {
  if (!contactHtml.includes(`>${label}</a>`)) {
    failures.push(`expected differentiated contact CTA "${label}"`);
  }
}
const styles = readFileSync(path.join(root, "site/assets/css/styles.css"), "utf8");
const cardBlock = styles.match(/\.contact-card\s*\{[\s\S]*?\n\}/)?.[0] || "";
const buttonBlock = styles.match(/\.contact-card__button\s*\{[\s\S]*?\n\}/)?.[0] || "";
if (!cardBlock.includes("display: flex;") || !cardBlock.includes("flex-direction: column;")) {
  failures.push("expected contact cards to use a vertical flex layout");
}
if (!cardBlock.includes("gap: 16px;") || !cardBlock.includes("min-height: 224px;")) {
  failures.push("expected contact cards to use compact, even spacing");
}
if (!buttonBlock.includes("padding: 11px 16px;") || !buttonBlock.includes("font-size: 0.84rem;")) {
  failures.push("expected contact buttons to use compact secondary-action sizing");
}

if (failures.length) {
  console.error(`Contact mailto test failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log("Contact mailto behavior is green.");
