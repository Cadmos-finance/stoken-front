## Parent

https://github.com/Cadmos-finance/stoken-front/issues/1

## What to build

Add a sober, app-style specimen facility preview to make the Stoken asset tangible without looking like AI art. The preview should feel like a restrained slice of the future platform and show illustrative terms consistently labelled as specimen or illustrative.

## Acceptance criteria

- [ ] Start with one RED browser-visible behavior test that proves the facility preview renders and includes a visible specimen/illustrative label whenever sample numbers are shown.
- [ ] The preview presents institutional facility data such as commodity tag, rating, indicative yield, tenor, currency, minimum ticket, status, and smart-contract style reference.
- [ ] Sample values stay consistent with the approved ranges: 5-12% indicative yield, up to 360 days, BB- to BBB+, $500,000 minimum ticket, and USDC / USDT currency.
- [ ] The visual treatment is sober app UI: no 3D coin, hologram overload, glossy AI illustration, or fake futuristic dashboard.
- [ ] The preview remains readable and non-overlapping on desktop and mobile; it may be hidden or simplified on small screens if that produces a better experience.
- [ ] The preview reinforces one Stoken / one facility and avoids implying that a live public offer exists.
- [ ] Refactor only after the browser-visible behavior test is green; tests assert visible labels and content rather than component internals.

## Blocked by

- https://github.com/Cadmos-finance/stoken-front/issues/2
