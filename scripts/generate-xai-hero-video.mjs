import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const BRIEF_PATH = path.join(ROOT, 'site/assets/video/hero-video-brief.md');
const OUT_DIR = path.join(ROOT, 'site/assets/video');

function getArg(name, fallback) {
  const prefix = `--${name}=`;
  const arg = process.argv.slice(2).find((item) => item.startsWith(prefix));
  if (!arg) return fallback;
  return arg.slice(prefix.length);
}

function hasFlag(name) {
  return process.argv.slice(2).includes(`--${name}`);
}

function parseNumberArg(name, fallback) {
  const value = Number(getArg(name, fallback));
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid --${name}; expected a number.`);
  }
  return value;
}

function extractSection(brief, heading, nextHeading) {
  const match = brief.match(new RegExp(`## ${heading}\\s+([\\s\\S]*?)\\n## ${nextHeading}`));
  if (!match) {
    throw new Error(`Could not extract "${heading}" from ${BRIEF_PATH}`);
  }
  return match[1].trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const detail = data?.error?.message || data?.message || text || response.statusText;
    throw new Error(`${response.status} ${response.statusText}: ${detail}`);
  }

  return data;
}

async function startGeneration({ apiKey, prompt, duration, aspectRatio, resolution }) {
  const payload = {
    model: 'grok-imagine-video',
    prompt,
    duration,
    aspect_ratio: aspectRatio,
    resolution,
  };

  const data = await requestJson('https://api.x.ai/v1/videos/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!data.request_id) {
    throw new Error(`xAI response did not include request_id: ${JSON.stringify(data)}`);
  }

  return data.request_id;
}

async function startExtension({ apiKey, prompt, videoUrl, duration }) {
  const payload = {
    model: 'grok-imagine-video',
    prompt,
    duration,
    video: { url: videoUrl },
  };

  const data = await requestJson('https://api.x.ai/v1/videos/extensions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!data.request_id) {
    throw new Error(`xAI extension response did not include request_id: ${JSON.stringify(data)}`);
  }

  return data.request_id;
}

async function pollGeneration({ apiKey, requestId, timeoutMs, intervalMs }) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const data = await requestJson(`https://api.x.ai/v1/videos/${requestId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (data.status === 'done') {
      if (!data.video?.url) {
        throw new Error(`Generation finished without video URL: ${JSON.stringify(data)}`);
      }
      return data.video;
    }

    if (data.status === 'failed' || data.status === 'expired') {
      throw new Error(`Generation ${data.status}: ${JSON.stringify(data)}`);
    }

    process.stdout.write('.');
    await sleep(intervalMs);
  }

  throw new Error(`Timed out after ${Math.round(timeoutMs / 1000)} seconds.`);
}

async function downloadVideo(url, outputPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(outputPath, buffer);
  return buffer.byteLength;
}

async function main() {
  const count = parseNumberArg('count', 2);
  const duration = parseNumberArg('duration', 15);
  const extendDuration = parseNumberArg('extend-duration', 10);
  const timeoutMs = parseNumberArg('timeout-ms', 12 * 60 * 1000);
  const intervalMs = parseNumberArg('interval-ms', 5000);
  const aspectRatio = getArg('aspect-ratio', '16:9');
  const resolution = getArg('resolution', '720p');
  const dryRun = hasFlag('dry-run');
  const apiKey = process.env.XAI_API_KEY;

  if (!Number.isInteger(count) || count < 1 || count > 10) {
    throw new Error('Invalid --count; expected an integer from 1 to 10.');
  }

  if (!Number.isInteger(duration) || duration < 1 || duration > 15) {
    throw new Error('Invalid --duration; xAI text-to-video allows 1 to 15 seconds.');
  }

  if (!Number.isInteger(extendDuration) || extendDuration < 0 || extendDuration > 10) {
    throw new Error('Invalid --extend-duration; xAI video extension allows 0 to 10 seconds in this script.');
  }

  if (extendDuration > 0 && duration < 2) {
    throw new Error('Invalid --duration; xAI video extension requires a 2 to 15 second input video.');
  }

  const brief = await readFile(BRIEF_PATH, 'utf8');
  const prompt = extractSection(brief, 'Prompt', 'Extension Prompt');
  const extensionPrompt = extractSection(brief, 'Extension Prompt', 'Reject Candidates That Show');
  const totalDuration = duration + extendDuration;
  const rate = resolution === '720p' ? 0.07 : 0.05;
  const estimatedCost = count * totalDuration * rate;

  console.log(`Model: grok-imagine-video`);
  console.log(`Candidates: ${count}`);
  console.log(`Base duration: ${duration}s`);
  console.log(`Extension duration: ${extendDuration}s`);
  console.log(`Approx. final duration: ${totalDuration}s`);
  console.log(`Aspect ratio: ${aspectRatio}`);
  console.log(`Resolution: ${resolution}`);
  console.log(`Estimated xAI generation cost: ~$${estimatedCost.toFixed(2)}`);
  console.log('Note: xAI currently documents 15s max text-to-video and 10s max extension.');

  if (dryRun) {
    console.log('\nDry run prompt:\n');
    console.log(prompt);
    if (extendDuration > 0) {
      console.log('\nDry run extension prompt:\n');
      console.log(extensionPrompt);
    }
    return;
  }

  if (!apiKey) {
    throw new Error('Missing XAI_API_KEY. Export it in your shell before running this script.');
  }

  await mkdir(OUT_DIR, { recursive: true });

  for (let index = 1; index <= count; index += 1) {
    console.log(`\nStarting candidate ${index}/${count}...`);
    const requestId = await startGeneration({
      apiKey,
      prompt,
      duration,
      aspectRatio,
      resolution,
    });
    console.log(`Request ID: ${requestId}`);
    process.stdout.write('Polling');

    const video = await pollGeneration({ apiKey, requestId, timeoutMs, intervalMs });
    process.stdout.write('\n');

    if (extendDuration > 0) {
      const baseOutputPath = path.join(OUT_DIR, `stoken-hero-candidate-${index}-base.mp4`);
      const baseBytes = await downloadVideo(video.url, baseOutputPath);
      console.log(`Saved base ${baseOutputPath} (${(baseBytes / 1024 / 1024).toFixed(2)} MB)`);

      console.log(`Extending candidate ${index}/${count}...`);
      const extensionRequestId = await startExtension({
        apiKey,
        prompt: extensionPrompt,
        videoUrl: video.url,
        duration: extendDuration,
      });
      console.log(`Extension request ID: ${extensionRequestId}`);
      process.stdout.write('Polling');

      const extendedVideo = await pollGeneration({
        apiKey,
        requestId: extensionRequestId,
        timeoutMs,
        intervalMs,
      });
      process.stdout.write('\n');

      const outputPath = path.join(OUT_DIR, `stoken-hero-candidate-${index}.mp4`);
      const bytes = await downloadVideo(extendedVideo.url, outputPath);
      console.log(`Saved extended ${outputPath} (${(bytes / 1024 / 1024).toFixed(2)} MB)`);
    } else {
      const outputPath = path.join(OUT_DIR, `stoken-hero-candidate-${index}.mp4`);
      const bytes = await downloadVideo(video.url, outputPath);
      console.log(`Saved ${outputPath} (${(bytes / 1024 / 1024).toFixed(2)} MB)`);
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
