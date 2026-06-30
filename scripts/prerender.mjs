// Post-build prerender: snapshot the fully-composed DOM of the SPA into
// dist/index.html so non-JS crawlers and social link-preview bots (LinkedIn,
// Slack, WhatsApp, Bing) see real section text + correct meta instead of an
// empty <div id="root">. The live client still boots from the same <script>
// tags and re-renders over the snapshot — this only fattens the first paint.
//
// Why a real headless Chrome (not vite-react-ssg / Node SSR): the scene is
// WebGL (<Canvas>) plus GSAP/ScrollTrigger/Lenis and window/matchMedia access
// that throw in jsdom. Puppeteer runs a real browser with WebGL, so the app
// renders exactly as it does for a visitor.
//
// Opt-in by design — NOT wired into the default `npm run build`, so the
// zero-config Vercel deploy can't be broken by a Chromium hiccup. Run via
// `npm run build:prerender` (or set that as the Vercel build command). Any
// failure here exits 0 and leaves the normal SPA index.html in place.

import { preview } from 'vite';
import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DIST_INDEX = resolve('dist/index.html');
const SETTLE_MS = 2500; // GSAP/font settle after the DOM is present

async function run() {
  // Fail fast (but softly) if there's no build to snapshot.
  try {
    readFileSync(DIST_INDEX);
  } catch {
    console.warn('[prerender] dist/index.html not found — run `vite build` first. Skipping.');
    return;
  }

  const server = await preview({ preview: { port: 4319 } });
  const base = server.resolvedUrls?.local?.[0] ?? 'http://localhost:4319/';

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--use-gl=swiftshader',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--lang=en-US',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    // Pin the snapshot to English so it's deterministic across build machines
    // and matches the static canonical/OG tags. The locale store reads
    // navigator.language (useLocaleStore.getInitialLocale), so override it
    // before any app script runs. (German stays a client-side toggle.)
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'language', { get: () => 'en-US' });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    });
    // Compose the hero instantly (skip the veil/construction intro) so the
    // snapshot is a clean, finished frame rather than a mid-tween one.
    await page.emulateMediaFeatures([
      { name: 'prefers-reduced-motion', value: 'reduce' },
    ]);

    await page.goto(base, { waitUntil: 'networkidle0', timeout: 60000 });
    // Wait until the React tree has actually rendered the sections.
    await page.waitForSelector('#root section#Contact', { timeout: 60000 });
    await page.evaluate(() => document.fonts?.ready);
    await new Promise((r) => setTimeout(r, SETTLE_MS));

    const html = await page.content();
    writeFileSync(DIST_INDEX, html, 'utf8');
    console.log('[prerender] wrote composed DOM to dist/index.html');
  } finally {
    await browser.close();
    await server.httpServer.close();
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    // Never fail the deploy: leave the plain SPA index.html and move on.
    console.warn('[prerender] failed, keeping plain SPA index.html:', err?.message ?? err);
    process.exit(0);
  });
