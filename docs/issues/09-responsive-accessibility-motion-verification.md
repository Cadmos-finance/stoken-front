## Parent

https://github.com/Cadmos-finance/stoken-front/issues/1

## What to build

Run the final behavior-focused verification pass for the refined homepage. This slice should ensure the page is robust across desktop and mobile, accessible by keyboard, respectful of reduced-motion preferences, resilient to missing media, and free of obvious overlap or clipped core text.

## Acceptance criteria

- [ ] Start with one RED browser-visible behavior test that captures at least one known missing verification behavior before implementation.
- [ ] Desktop and mobile browser checks confirm the homepage is nonblank, correctly framed, and free of overlap or clipped core text in the hero, routing section, proof band, facility preview, capital-flow module, capability visual, metrics, and final CTA.
- [ ] Keyboard navigation reaches the main nav, dropdown links, mobile menu, proof interactions, hero CTAs, and interactive module controls where applicable.
- [ ] Focus states are visible and do not shift or break layout.
- [ ] Reduced-motion mode disables or softens continuous hero, data-line, scroll reveal, and module animations while preserving content.
- [ ] Hero media fallback works when video is unavailable.
- [ ] Self-hosted font behavior is verified, including no Google Fonts request.
- [ ] CTA routing is verified for Request Access, Bring a Facility, Launch Platform, and deeper-page links.
- [ ] The specimen facility preview always displays a specimen/illustrative label when sample terms are present.
- [ ] Refactor only after the browser-visible behavior tests are green; tests assert user-observable outcomes rather than implementation details.

## Blocked by

- https://github.com/Cadmos-finance/stoken-front/issues/3
- https://github.com/Cadmos-finance/stoken-front/issues/4
- https://github.com/Cadmos-finance/stoken-front/issues/5
- https://github.com/Cadmos-finance/stoken-front/issues/6
- https://github.com/Cadmos-finance/stoken-front/issues/7
- https://github.com/Cadmos-finance/stoken-front/issues/8
- https://github.com/Cadmos-finance/stoken-front/issues/9
