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
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DIST_INDEX = resolve('dist/index.html');
const STATUS_FILE = resolve('dist/prerender-status.json');
const SETTLE_MS = 2500; // GSAP/font settle after the DOM is present

// Set once launch is attempted, so the failure path can inspect the binary.
let chromePath = null;

// Chrome's loader reports only the FIRST missing .so and exits, so debugging a
// bare build container one library per deploy is brutal. `ldd` lists every
// unresolved dependency at once — the whole shopping list in one round-trip.
function missingSharedLibs() {
  if (!chromePath || process.platform !== 'linux') return null;
  try {
    const out = execFileSync('ldd', [chromePath], { encoding: 'utf8', stdio: 'pipe' });
    return out
      .split('\n')
      .filter((l) => l.includes('not found'))
      .map((l) => l.trim().split(/\s+/)[0]);
  } catch {
    return null;
  }
}

// Because a failure here deliberately exits 0, a skipped prerender is invisible
// in a green deploy. Drop a breadcrumb into dist/ on BOTH paths so the outcome
// is fetchable at /prerender-status.json on the deployed site: 404 means the
// build command never ran the script at all, 200 + { ok: false } means it ran
// and Chrome/the snapshot failed (and says why).
function writeStatus(fields) {
  try {
    writeFileSync(
      STATUS_FILE,
      JSON.stringify({ at: new Date().toISOString(), node: process.version, ...fields }, null, 2),
      'utf8',
    );
  } catch {
    /* dist/ missing — nothing to report into */
  }
}

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

  // Sync in older puppeteer, a promise in v25 — await covers both.
  const execPath = await puppeteer.executablePath();
  chromePath = execPath;
  console.log('[prerender] chrome executablePath:', execPath);

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
    writeStatus({ ok: true, bytes: html.length, chrome: execPath });
    console.log(`[prerender] wrote composed DOM to dist/index.html (${html.length} bytes)`);
  } finally {
    await browser.close();
    await server.httpServer.close();
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    // Never fail the deploy: leave the plain SPA index.html and move on.
    // Set PRERENDER_STRICT=1 (e.g. as a Vercel env var) to turn this into a
    // hard build failure instead — useful while verifying the step actually
    // runs, since a silent skip is indistinguishable from success in the log.
    console.warn('[prerender] failed, keeping plain SPA index.html:', err?.message ?? err);
    const missingLibs = missingSharedLibs();
    if (missingLibs?.length) {
      console.warn('[prerender] chrome is missing shared libs:', missingLibs.join(' '));
    }
    writeStatus({
      ok: false,
      error: String(err?.message ?? err),
      chrome: chromePath,
      missingLibs,
      stack: err?.stack ?? null,
    });
    process.exit(process.env.PRERENDER_STRICT === '1' ? 1 : 0);
  });
