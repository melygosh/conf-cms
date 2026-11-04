// npm run letter: print the current conference's info letter (/letter/, /en/letter/) to
// public/letters/info-letter-<year>-<lang>.pdf and record the hash of the data it was printed from.
// Fails without writing anything when a page's content does not fit on the page.
import { spawnSync } from 'node:child_process';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';
import { findOverflow } from '../src/lib/letter.ts';
import { letterHash, letterInputs, letterPaths } from '../src/lib/letter-freshness.ts';

const PORT = 4339;
const LANGS = { uk: '/letter/', en: '/en/letter/' };

const year = Math.max(
  ...readdirSync('src/content/conferences')
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => parse(readFileSync(`src/content/conferences/${f}`, 'utf8')).year),
);

const build = spawnSync('npx', ['astro', 'build'], { stdio: 'inherit', env: { ...process.env, LETTER_BUILD: '1' } });
if (build.status !== 0) process.exit(build.status ?? 1);

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Playwright is not installed: npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

// A tiny static server for dist/ (astro preview allows one instance per project, and the owner may be running one).
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const server = createServer((req, res) => {
  let file = join('dist', decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
const stop = () => server.close();

// Playwright's own Chromium if installed, otherwise the installed Google Chrome.
async function launch() {
  try {
    return await chromium.launch();
  } catch (e) {
    if (!String(e).includes("Executable doesn't exist")) throw e;
    return chromium.launch({ channel: 'chrome' });
  }
}

let browser;
try {
  browser = await launch();
  const page = await browser.newPage();
  await page.emulateMedia({ media: 'print' });

  const pdfs = {};
  const problems = [];
  for (const [lang, path] of Object.entries(LANGS)) {
    await page.goto(`http://127.0.0.1:${PORT}${path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const sizes = await page.$$eval('.page__body', (els) =>
      els.map((e) => ({ scrollHeight: e.scrollHeight, clientHeight: e.clientHeight })),
    );
    for (const n of findOverflow(sizes)) problems.push(`${lang}: page ${n} overflows`);
    pdfs[lang] = await page.pdf({ preferCSSPageSize: true, printBackground: true });
  }

  if (problems.length) {
    console.error(`The letter does not fit its pages; nothing was written.\n${problems.join('\n')}`);
    process.exitCode = 1;
  } else {
    const paths = letterPaths(year);
    mkdirSync('public/letters', { recursive: true });
    for (const lang of Object.keys(LANGS)) writeFileSync(paths.pdf[lang], pdfs[lang]);
    writeFileSync(paths.hash, `${letterHash(letterInputs(year))}\n`);
    console.log(`Wrote ${paths.pdf.uk}, ${paths.pdf.en} and ${paths.hash}`);
  }
} catch (e) {
  if (String(e).includes("Executable doesn't exist") || String(e).includes('Chromium distribution')) {
    console.error('No browser to print with: npx playwright install chromium (or install Google Chrome)');
  } else {
    console.error(e);
  }
  process.exitCode = 1;
} finally {
  await browser?.close();
  stop();
}
