import { readFileSync } from "node:fs";
import path from "node:path";
import { root } from "./browser-page.mjs";

const indexHtml = readFileSync(path.join(root, "site/index.html"), "utf8");
const assetHtml = readFileSync(path.join(root, "site/the-asset.html"), "utf8");

const failures = [];

if (/data-section="facility-preview"/.test(indexHtml)) {
  failures.push("expected specimen facility preview to be moved off the homepage");
}

if (!/data-section="asset-specimen-facility"/.test(assetHtml) || !/id="terms"/.test(assetHtml)) {
  failures.push("expected The Asset #terms section to own the specimen facility preview");
}

for (const expected of [
  "Specimen facility",
  "A single borrower, one facility, no repackaging.",
  "Grain trading",
  "STK-GRN-180",
  "BBB+",
  "8.4%",
  "180 days",
  "USDC / USDT",
  "$500,000",
  "Senior unsecured",
  "HoldCo guarantee, Swiss arbitration, NYC enforcement.",
  "0xSTK...973e",
  "Whitelisted wallets only"
]) {
  if (!assetHtml.includes(expected)) {
    failures.push(`expected The Asset specimen facility to include "${expected}"`);
  }
}

if (!/not a live offer or solicitation/i.test(assetHtml)) {
  failures.push("expected specimen facility safeguards to remain on The Asset page");
}

if (failures.length) {
  console.error(`Specimen facility placement test failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log("Specimen facility placement is green.");
