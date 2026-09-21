## Parent

https://github.com/Cadmos-finance/stoken-front/issues/1

## What to build

Establish the homepage visual foundation as a TDD tracer bullet: shared design tokens, self-hosted Inter and Geist Mono typography, refined navigation/dropdown behavior, and baseline reduced-motion support. The completed slice should be demoable by loading the homepage and seeing the refreshed typographic system, navigation, and CTA hierarchy in place without external font dependencies.

## Acceptance criteria

- [ ] Start with one RED browser-visible behavior test that proves the homepage loads with the refreshed navigation, visible `Launch Platform`, local font usage, and no Google Fonts request.
- [ ] Inter is used for headings/body/UI and Geist Mono is used for technical/data labels, both loaded from self-hosted assets.
- [ ] The external Google Fonts dependency is removed from the public site.
- [ ] Desktop navigation keeps the approved dropdown structure while presenting cleaner spacing, hover/focus states, and CTA hierarchy.
- [ ] Mobile navigation remains reachable, readable, and route-complete for the existing public pages and CTAs.
- [ ] A baseline reduced-motion path exists so future slices can disable or soften continuous motion consistently.
- [ ] Refactor only after the browser-visible behavior test is green; tests assert rendered behavior rather than CSS implementation details.

## Blocked by

None - can start immediately
