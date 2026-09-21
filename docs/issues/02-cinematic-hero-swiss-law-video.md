## Parent

https://github.com/Cadmos-finance/stoken-front/issues/1

## What to build

Build the homepage hero around the approved headline, Swiss-law moat, investor/issuer CTAs, and a credible media path. This slice should be demoable as a complete first viewport: visitors see "Commodity finance. On-chain.", the prominent Swiss DLT Act / Ledger-based Securities signal, Stoken's Geneva/SO-FIT/FINMA-recognised SRO proof line, "Request Access", "Bring a Facility", and a nonblank cinematic background via video, poster, or fallback.

Type: HITL. A human must approve or reject AI-generated hero video candidates before production use. The implementation must still work with a fallback image/video placeholder if no final video is approved.

## Acceptance criteria

- [ ] Start with one RED browser-visible behavior test that proves the first viewport renders the headline, regulatory moat, both hero CTAs, and a nonblank media fallback.
- [ ] The hero keeps the exact headline `Commodity finance. On-chain.`
- [ ] The regulatory eyebrow prominently communicates `Swiss DLT Act` and `Ledger-based Securities`.
- [ ] The hero proof/meta line includes Stoken S.A., Geneva, SO-FIT member, and FINMA-recognised SRO language without becoming a legal paragraph.
- [ ] The primary CTA routes investors to request access and the secondary CTA routes issuers to the issuer path.
- [ ] The hero media layer supports an AI-generated video, poster frame, and static fallback without leaving the hero blank.
- [ ] The AI video prompt and rejection criteria from the parent PRD are available to reviewers.
- [ ] Reduced-motion mode softens or disables continuous hero motion while preserving visual clarity.
- [ ] Refactor only after the browser-visible behavior test is green; tests assert rendered behavior rather than media implementation details.

## Blocked by

- https://github.com/Cadmos-finance/stoken-front/issues/2
