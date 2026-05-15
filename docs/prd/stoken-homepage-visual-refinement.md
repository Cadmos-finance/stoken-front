# PRD: Stoken Homepage Visual Refinement

Triage label: ready-for-agent

## Problem Statement

Stoken has a public website with the right core content and page structure, but the homepage needs a more premium, cinematic, and interaction-rich execution. The current implementation already reflects the Phase 1 content brief, the Stoken brand assets, the public pages, and the Swiss-law commodity finance narrative. However, it does not yet reach the desired visual quality of the Ripple Webflow reference: polished video-led hero, high-trust proof near the top, refined SaaS-style motion, stronger product-like visuals, and a more modern typographic system.

The homepage must carefully preserve Stoken's content, regulatory moat, and graphical chart while using Ripple only as a visual and interaction reference. The site should not copy Ripple's information architecture or generic SaaS structure. Stoken's homepage must speak to both sides of the market: on-chain institutional investors seeking rated real-economy yield, and commodity issuers seeking a complementary capital channel.

## Solution

Redesign the homepage first as the north-star experience for the rest of the public website, while extracting shared design tokens, typography, motion patterns, buttons, proof bands, cards, and visual modules that can later be applied to The Asset, How It Works, For Issuers, About, and Legal.

The homepage will remain mostly dark, use a deliberate cream contrast section for the investor/issuer audience routing, keep the hero headline "Commodity finance. On-chain.", and make the Swiss DLT Act / Ledger-based Securities moat prominent. The visual style should be premium institutional finance: cinematic but restrained, dark navy/black, cream highlights, controlled light-green accents, and no synthetic AI-art feeling.

The hero should use an AI-generated background video prototype first. The preferred subject is global commodity movement: port/logistics terminal, cargo vessel, cranes, containers or bulk commodity infrastructure. The video may lightly merge on-chain abstraction, but physical logistics should remain dominant. If the video looks synthetic, noisy, too crypto, or visually untrustworthy, the fallback is clean logistics footage plus a site-controlled CSS/canvas data overlay.

The homepage should add two clear hero CTAs: "Request Access" for investors and "Bring a Facility" for issuers. "Launch Platform" remains visible in the top navigation. Proof logos move higher, use all named partners for now, normalize to Stoken's monochrome palette, and reveal native/color emphasis on hover where available. The homepage should add an interactive product-style module that explains the capital flow from facility to token, replacing a passive generic demo video for now.

## User Stories

1. As a qualified institutional investor, I want to immediately understand that Stoken offers commodity finance on-chain, so that I can decide whether the asset is relevant to my capital mandate.
2. As an on-chain institutional investor, I want the homepage to show real-world commodity movement, so that the asset feels connected to genuine economic activity rather than crypto speculation.
3. As a stablecoin issuer, I want to see that Stoken facilities are rated and governed by Swiss law, so that I can evaluate them as treasury assets.
4. As a DAO treasury operator, I want to see proof that Stoken is built around whitelisted wallets and regulated participation, so that I can assess governance and compliance fit.
5. As a crypto-native fund manager, I want to see the yield, tenor, rating, currency, and minimum ticket in a concise format, so that I can quickly qualify the opportunity.
6. As a family office investor, I want the homepage to feel institutional and credible, so that I can trust the product enough to request access.
7. As a traditional institutional investor, I want the site to avoid flashy crypto tropes, so that the offering reads like a serious credit product.
8. As a commodity issuer, I want a clear path from the homepage to issuer information, so that I can understand how to bring a facility to Stoken.
9. As a commodity trader, I want the homepage to make clear that Stoken is a complementary capital channel, so that I do not assume it replaces bank lines.
10. As a prospective borrower, I want to see that the process is confidential and institutional, so that I feel comfortable engaging with Stoken.
11. As a first-time visitor, I want the hero to clearly state "Commodity finance. On-chain.", so that the proposition is memorable.
12. As a first-time visitor, I want a concise subheadline that explains rated commodity trade finance, Ethereum tokenization, and Swiss law, so that I understand the product without scrolling.
13. As a visitor evaluating regulatory credibility, I want "Swiss DLT Act" and "Ledger-based Securities" to be prominent, so that I see Stoken's moat immediately.
14. As a visitor evaluating institutional credibility, I want to see Stoken S.A., Geneva, SO-FIT membership, and FINMA-recognised SRO language, so that the company feels grounded.
15. As a visitor comparing Stoken to generic RWA sites, I want the visual identity to feel specific to commodity finance, so that the brand is differentiated.
16. As a user who prefers a quieter browsing experience, I want motion to be subtle and purposeful, so that the homepage does not become distracting.
17. As a user with reduced-motion settings, I want video and scroll animation to soften or disable, so that the site remains usable and accessible.
18. As a mobile visitor, I want the hero copy, CTAs, and proof signals to fit cleanly, so that I can understand the offer on a small screen.
19. As a mobile visitor, I want the audience split to be obvious, so that I can choose investor or issuer content without hunting.
20. As a desktop visitor, I want the hero to use cinematic whitespace and restrained motion, so that it feels premium rather than cluttered.
21. As a desktop visitor, I want any facility preview to feel like a sober app UI, so that it looks like a real product preview rather than AI art.
22. As a prospective platform user, I want to see a specimen facility with illustrative terms, so that I understand what a Stoken facility looks like.
23. As a compliance-sensitive visitor, I want sample facility numbers to be clearly labelled as illustrative, so that the homepage does not imply a live offer.
24. As an investor, I want the 5-12% yield range to be presented carefully as indicative product information, so that it does not read like retail yield marketing.
25. As an investor, I want the $500,000 minimum ticket and qualified investor posture to be visible, so that I understand access constraints.
26. As an investor, I want to see that each Stoken maps to one facility, so that I understand there is no pooling or hidden concentration risk.
27. As an investor, I want the rating language to include Stoken scoring and Moody's RiskCalc, so that risk assessment feels concrete.
28. As an investor, I want to see whitelisting and smart-contract enforcement referenced, so that on-chain participation feels controlled.
29. As an issuer, I want to see that Stoken connects commodity traders to stablecoin treasuries, DAOs, crypto-native institutions, and family offices, so that I understand the capital base.
30. As an issuer, I want to see an issuer-specific CTA, so that I know Stoken is not only investor-facing.
31. As a visitor, I want partner/proof logos near the top, so that credibility is established before I read detailed explanations.
32. As a visitor, I want partner logos to fit the Stoken palette, so that the proof band feels integrated with the brand.
33. As a visitor, I want partner logos to reveal native/color emphasis on hover, so that the interaction feels polished without breaking the palette.
34. As a visitor, I want the "What we do" sphere concept to become clearer and more system-like, so that I understand origination, rating, tokenization, and distribution as one platform.
35. As a visitor, I want the capital-flow module to explain facility, rating, tokenization, allocation, coupon, and repayment, so that I can understand the end-to-end mechanics quickly.
36. As a visitor, I want the stats row to remain but take less visual space, so that important proof points support rather than dominate the page.
37. As a visitor, I want regulatory proof to be concise on the homepage, so that I see the moat without reading legal detail.
38. As a visitor who wants deeper detail, I want links to The Asset, How It Works, and For Issuers, so that I can continue into the right page.
39. As a returning user, I want "Launch Platform" visible in the nav, so that I can access the gated app quickly.
40. As an implementation maintainer, I want shared components and CSS primitives, so that the homepage redesign can be propagated across the public site later.
41. As an implementation maintainer, I want fonts to be self-hosted, so that the site avoids external font calls and improves privacy posture.
42. As an implementation maintainer, I want the AI video to have a clean fallback path, so that the homepage is not blocked if generation quality is not good enough.
43. As a brand reviewer, I want the homepage to use Stoken's colors and logos carefully, so that it remains recognizably Stoken despite moving away from Montserrat.
44. As a legal reviewer, I want claims and partner logos to be easy to remove or adjust, so that disclosure cleanup can happen later without redesigning the page.
45. As a future agent, I want a precise PRD and implementation decisions, so that I can build the homepage without re-opening solved design questions.

## Implementation Decisions

- Use Ripple as a visual and interaction reference only. Do not copy Ripple's content model, page structure, or generic SaaS sections.
- Implement the homepage first, but build shared CSS primitives and reusable components so the visual system can later be applied to the remaining public pages.
- Preserve the current public site information architecture: Home, The Asset, How It Works, For Issuers, About, and Legal.
- Keep the hero headline exactly: "Commodity finance. On-chain."
- Tighten homepage copy while preserving the approved content, regulatory claims, and financial substance from the Phase 1 brief.
- Optimize the homepage for both investors and issuers. Use the homepage as a two-sided capital network entry point rather than investor-only.
- Use two hero CTAs: primary "Request Access" for investors and secondary "Bring a Facility" for commodity issuers.
- Keep "Launch Platform" visible in the top navigation.
- Keep dropdown navigation structure, but refine the visual treatment with lighter spacing, cleaner dropdown panels, polished hover behavior, and clearer CTA hierarchy.
- Keep the hero text left/bottom, with optional right-side facility preview on desktop only if it stays clean and does not crowd the video.
- Keep the regulatory eyebrow large and prominent because Swiss DLT Act / Ledger-based Securities is the moat.
- Split hero regulatory hierarchy: use the eyebrow for "Swiss DLT Act" and "Ledger-based Securities", and use a hero meta/proof line for Stoken S.A., Geneva, SO-FIT member, and FINMA-recognised SRO.
- Prototype the hero video with AI first. Use global commodity movement as the first two-second impression.
- Lightly merge on-chain abstraction into the AI video: subtle data traces, ledger-like light paths, faint nodes, and soft pulses. Avoid crypto coins, hologram overload, readable text, brands, people as main subject, and sci-fi visuals.
- Keep physical commodity logistics dominant over digital abstraction. Target roughly 70% real-world commodity movement and 30% restrained on-chain abstraction.
- If the AI video looks synthetic, noisy, too "crypto", or untrustworthy, fall back to clean logistics footage plus a site-controlled CSS/canvas data overlay.
- Use a mostly dark homepage with one deliberate cream contrast section.
- Use the cream contrast section for the investor/issuer routing module.
- Move proof higher on the homepage, near the hero or immediately after the audience routing.
- Include all named partner/proof logos for now: Moody's, Cadmos, SO-FIT, and Bonnard Lawson, with the understanding that legal/public disclosure cleanup may happen later.
- Normalize partner logos to the Stoken monochrome palette in the proof band and reveal native/color emphasis on hover where available.
- Add a Ripple-style demo moment as an interactive product-style module rather than a passive video.
- The interactive module should explain Stoken-specific capital flow: facility, rating, tokenization, allocation, coupon, and repayment.
- Redesign the current "What we do" sphere concept rather than removing it. Make it feel like a controlled financial operating system: central Stoken platform node, four capability panels, subtle data lines, and clear labels for Origination, Rating, Tokenization, and Distribution.
- Add a product-like facility visual only if it feels like real institutional app UI. If it looks AI-generated, glossy, holographic, or gimmicky, remove it.
- Facility visual should look like a sober slice of the platform: compact card/table, real labels, restrained numbers, no 3D coin, no fake holograms.
- Use illustrative sample numbers consistent with the brief and clearly label the visual as "Specimen facility" or "Illustrative terms."
- Keep the stats row but reduce visual weight. Include $9T+, 25+ years, 360 days, and 1 Stoken / facility as compact proof points.
- Present 5-12% yield carefully as indicative product information, not as a hero promise. Pair it with rated facility, tenor, qualified investors, and illustrative/specimen labelling.
- Keep concise regulatory language on the homepage: SO-FIT, Swiss DLT Act, ledger-based securities, Geneva, qualified investors, and whitelisted wallets.
- Move article-level legal explanation to deeper pages rather than expanding it on the homepage.
- Replace Montserrat with Inter for headings, body, and UI. This is an intentional brand-chart deviation for a cleaner SaaS/institutional feel.
- Use Geist Mono, not JetBrains Mono, for data labels, regulatory tags, facility IDs, hashes, ratings metadata, and numeric technical details.
- Self-host Inter and Geist Mono in site assets. Remove the Google Fonts dependency once font files are added.
- Use subtle but present motion: fade/slide reveals, data-line movement, facility module state transitions, and button/card hover interactions.
- Include a proper reduced-motion path using user motion preferences. Disable or soften video overlays, loops, and scroll animations where appropriate.
- Avoid one-note palettes and avoid generic gradient/orb decoration. Use Stoken's dark, cream, green, and dark blue palette with restraint.
- Avoid visible in-page text that explains the UI mechanics or animation. The site should show, not narrate, interaction behavior.
- Keep cards and UI surfaces sober and compact. Avoid nested cards and decorative section cards.
- Make the homepage responsive across desktop and mobile. Ensure text, CTAs, proof bands, logos, and facility previews do not overlap or overflow.
- Keep legal and partner claims easy to remove or swap because partner disclosure cleanup is expected later.

Recommended deep modules or implementation units:

- Design token and typography module: owns colors, spacing, type scale, Inter, Geist Mono, surfaces, borders, and reusable text styles.
- Motion controller module: owns reveal behavior, video fallback behavior, reduced-motion behavior, and data-line animation rules behind a small interface.
- Hero media module: owns video asset selection, poster fallback, overlay layering, and the light on-chain visual treatment.
- Proof logo module: owns normalized logo rendering, hover color reveal, responsive wrapping, and missing-logo fallback.
- Audience router module: owns the investor/issuer split, CTA routing, and cream-section contrast treatment.
- Facility preview module: owns specimen facility data rendering and ensures illustrative data is labelled consistently.
- Capital-flow module: owns the interactive sequence from facility to token to allocation to coupon/repayment.
- Capability system visual module: owns the redesigned Origination / Rating / Tokenization / Distribution platform visual.
- Shared navigation and CTA module: owns nav treatment, dropdown behavior, CTA hierarchy, and mobile behavior.

## Testing Decisions

- Tests should focus on external behavior and rendered outcomes, not internal CSS class implementation details.
- Visual verification should confirm that the homepage is nonblank, hero media loads or falls back, text remains readable, CTAs are visible, and sections are correctly framed across desktop and mobile widths.
- Responsive tests should cover at least desktop, tablet, and mobile viewports, including the fixed nav, hero, audience router, proof logo band, facility preview, and interactive capital-flow module.
- Accessibility checks should verify keyboard access for navigation/dropdowns, visible focus states, reduced-motion behavior, alt text or empty decorative alt usage for images, and readable contrast.
- Motion tests should verify that `prefers-reduced-motion` meaningfully reduces or disables scroll reveal, video overlay motion, and continuous decorative animation.
- CTA tests should verify that "Request Access", "Bring a Facility", and "Launch Platform" route to the expected destinations.
- Proof-logo tests should verify that logos render in normalized monochrome by default and that hover/focus states do not break layout.
- Facility-preview tests should verify that the specimen/illustrative label is always present when sample numbers are shown.
- Capital-flow tests should verify that the module can progress through the intended states and that the state labels/content remain legible on small screens.
- Font tests should verify that Inter and Geist Mono are loaded from local assets and that there is no dependency on Google Fonts.
- Basic static validation should check for broken local asset references, missing video poster fallback, and missing image files.
- There is no prior automated test suite visible in the current static-site workspace. Use Playwright or equivalent browser checks for behavior, screenshots, and responsive layout once implementation begins.

## Out of Scope

- Redesigning The Asset, How It Works, For Issuers, About, or Legal beyond shared CSS/component compatibility.
- Building or changing the gated app at app.stoken.finance.
- Implementing investor onboarding, KYC/KYB submission, wallet whitelisting, Cadmos integration, primary-market deposits, batch settlement, coupon payments, or repayment flows.
- Producing final legal copy for Privacy Policy, Terms of Use, Restricted Jurisdictions, or Regulatory Disclosures.
- Final partner-logo legal approval. All named logos may be included for now, but Stoken will clean/approve later.
- Creating final production AI video if the first generated attempts are not credible enough. The PRD covers the direction and fallback criteria.
- Making a generic landing page or marketing-only site. The homepage must remain a usable, information-rich institutional product entry point.
- Creating a passive demo video as the first approach. The agreed demo moment is an interactive module.
- Changing the core headline, public site page structure, or "Launch Platform" visibility.

## Further Notes

Suggested AI video prompt for the first hero prototype:

```text
A realistic cinematic 10-second seamless looping hero background video for an institutional commodity finance and tokenized securities website.

Scene: early-morning commodity port and logistics terminal, cargo vessel in the distance, cranes moving slowly, containers, bulk commodity silos, wet metal surfaces, subtle mist, restrained teal-green industrial lights.

Digital layer: very subtle transparent data traces and ledger-like light paths moving across the scene, as if capital is being routed through infrastructure. Minimal, elegant, not sci-fi. Fine grid lines, faint nodes, occasional soft pulse, no readable text, no floating crypto coins.

Camera: slow smooth dolly movement left to right, stable horizon, no fast cuts, no shake, designed as a website hero background with clean negative space in the left-center for headline text.

Style: ultra-realistic, premium Swiss institutional finance, dark navy and black atmosphere, cream highlights, controlled light-green accents, realistic physics, understated, credible.

Constraints: no visible company logos, no readable text, no people as main subject, no hologram overload, no token/coin symbols, no futuristic city, no oversaturated colors, no dramatic weather, no full-screen blur.

Output: 16:9 horizontal, 10 seconds, seamless loop, no audio.
```

Recommended generation workflow:

- Generate 3-5 variants.
- Prefer a strong model with high realism and 16:9 support.
- If the model supports image-to-video, generate or select a clean still frame first and animate it with restrained motion.
- Reject outputs with synthetic-looking cranes, distorted vessels, illegible pseudo-text, glossy sci-fi overlays, visible brands, people as the main subject, or crypto coin imagery.
- Compress final production video for web, include a poster frame, and provide a fallback still background.

Publishing note:

- This PRD was prepared locally because the current workspace does not expose a usable project issue tracker. The working directory is not a functional git repository, no tracker MCP resources are configured, and GitHub CLI authentication is currently invalid. Once tracker access exists, publish this PRD as an issue and apply the `ready-for-agent` label.
