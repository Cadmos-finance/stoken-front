# SToken Front

Static homepage prototype for the SToken public site.

## Test locally

Open the homepage directly:

```sh
open site/index.html
```

If `open` is not available on your system, double-click `site/index.html` in a file browser or open it from your browser with `Ctrl+O`.

Run the browser behavior suite:

```sh
npm run test:homepage
```

The tests launch a local headless Chrome instance through the Chrome DevTools Protocol and verify the homepage structure, responsive layout, motion fallback, audience routing, proof band, specimen facility preview, capital-flow module, and CTA finish.

## AI hero video

The first-pass AI video brief is in `site/assets/video/hero-video-brief.md`. Generate the video from that brief, export it as a web-optimized MP4/WebM pair, then add it beside the brief and wire it into the hero `<video>` element in `site/index.html`.

Generate Grok Imagine candidates with the xAI API:

```sh
export XAI_API_KEY="your_xai_api_key"
npm run video:xai -- --count=2 --duration=15 --extend-duration=10 --resolution=720p
```

The script saves local candidates as `site/assets/video/stoken-hero-candidate-*.mp4`. Those throwaway candidates are gitignored. xAI currently documents 15 seconds as the maximum text-to-video duration and 10 seconds as the maximum extension duration, so the default command produces roughly 25-second extended candidates. After selecting the best candidate, rename or copy it to `site/assets/video/stoken-hero.mp4` and wire it into the hero video element.
