## Parent

https://github.com/Cadmos-finance/stoken-front/issues/1

## What to build

Build the Ripple-style demo moment as a Stoken-specific interactive module, not a passive generic video. The module should let visitors understand the capital path from facility creation through rating, tokenization, allocation, coupon distribution, and repayment.

## Acceptance criteria

- [ ] Start with one RED browser-visible behavior test that proves the capital-flow module renders and can advance through observable states.
- [ ] The sequence includes facility, rating, tokenization, investor allocation, coupon, and repayment states.
- [ ] The module explains the Stoken mechanics through concise visible labels and UI state, not explanatory instructions about how the animation works.
- [ ] State changes are subtle, premium, and readable; no sci-fi hologram treatment or crypto coin imagery.
- [ ] The module remains usable on mobile, either as a compact stepper, scroll sequence, or equivalent responsive interaction.
- [ ] Reduced-motion mode preserves the content while disabling or softening nonessential transitions.
- [ ] Refactor only after the browser-visible behavior test is green; tests assert user-observable state changes rather than animation internals.

## Blocked by

- https://github.com/Cadmos-finance/stoken-front/issues/2
