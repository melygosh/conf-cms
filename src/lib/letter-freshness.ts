// Build-time only (Node fs/crypto): is the committed info letter PDF up to date with what the build renders?
// The hash covers the rendered letter pages and every file they load (stylesheets, fonts, images, logos),
// so any change the letter would show — data, strings, code, a replaced logo — makes the PDF stale.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const LETTER_PAGES = ['letter/index.html', 'en/letter/index.html'];

export function letterPaths(year: number) {
  return {
    pdf: { uk: `public/letters/info-letter-${year}-uk.pdf`, en: `public/letters/info-letter-${year}-en.pdf` },
    hash: `public/letters/info-letter-${year}.hash`,
  };
}

/** Site-absolute paths a page or stylesheet loads: src/href attributes and CSS url(). */
function references(text: string): string[] {
  const refs = [
    ...text.matchAll(/(?:src|href)="(\/[^"#?]*)/g),
    ...text.matchAll(/url\(\s*['"]?(\/[^'")?#]+)/g),
  ].map((m) => m[1]);
  return refs.filter((r) => !r.startsWith('//'));
}

/** Hash of both rendered letter pages in `dist` and, transitively through stylesheets, every local file they load. */
export function renderedLetterHash(dist: string): string {
  const seen = new Set<string>();
  const queue = [...LETTER_PAGES];
  while (queue.length) {
    const path = queue.shift()!;
    if (seen.has(path)) continue;
    const file = join(dist, path);
    if (!existsSync(file)) continue;
    seen.add(path);
    if (['.html', '.css'].includes(extname(path))) {
      for (const ref of references(readFileSync(file, 'utf8'))) queue.push(ref.replace(/^\//, ''));
    }
  }
  const hash = createHash('sha256');
  for (const path of [...seen].sort()) hash.update(path).update('\0').update(readFileSync(join(dist, path))).update('\0');
  return hash.digest('hex');
}

export type Freshness = { ok: true } | { ok: false; message: string };

/**
 * The letter page carries `<meta name="letter-check" content="<year>">` unless the year links its own info letter.
 * Then both PDFs must exist and their saved hash must match the letter just built.
 */
export function checkLetterFreshness(dist: string, root = '.'): Freshness {
  const page = join(dist, LETTER_PAGES[0]);
  const year = existsSync(page) ? readFileSync(page, 'utf8').match(/<meta name="letter-check" content="(\d+)"/)?.[1] : undefined;
  if (!year) return { ok: true };
  const paths = letterPaths(Number(year));
  for (const pdf of [paths.pdf.uk, paths.pdf.en]) {
    if (!existsSync(join(root, pdf))) return { ok: false, message: `${pdf} is missing: run npm run letter` };
  }
  const saved = existsSync(join(root, paths.hash)) ? readFileSync(join(root, paths.hash), 'utf8').trim() : '';
  if (saved !== renderedLetterHash(dist)) {
    return { ok: false, message: `The ${year} info letter PDFs are older than what the site now shows: run npm run letter` };
  }
  return { ok: true };
}
