// Build-time only (Node fs/crypto): is the committed info letter PDF up to date with the data it was printed from?
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Conference } from '../content/schema';

export function letterPaths(year: number) {
  return {
    pdf: { uk: `public/letters/info-letter-${year}-uk.pdf`, en: `public/letters/info-letter-${year}-en.pdf` },
    hash: `public/letters/info-letter-${year}.hash`,
  };
}

const filesUnder = (root: string, dir: string): string[] =>
  existsSync(join(root, dir))
    ? readdirSync(join(root, dir), { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? filesUnder(root, `${dir}/${e.name}`) : [`${dir}/${e.name}`],
      )
    : [];

/** Everything the letter is printed from: the year's data, site data, interface strings and the letter's own code. */
export function letterInputs(year: number, root = '.'): string[] {
  return [
    `src/content/conferences/${year}.yaml`,
    'src/content/site.yaml',
    'src/i18n/ui.ts',
    ...filesUnder(root, 'src/letter'),
    'src/lib/letter.ts',
    'src/lib/qr.ts',
  ].sort();
}

export function letterHash(files: string[], root = '.'): string {
  const hash = createHash('sha256');
  for (const f of files) hash.update(f).update('\0').update(readFileSync(join(root, f))).update('\0');
  return hash.digest('hex');
}

export type Freshness = { ok: true } | { ok: false; message: string };

/** A year that links its own info letter is not checked; otherwise both PDFs must exist and match the current inputs. */
export function checkLetterFreshness(c: Conference, { root = '.' }: { root?: string } = {}): Freshness {
  if (c.links.infoLetter) return { ok: true };
  const paths = letterPaths(c.year);
  for (const pdf of [paths.pdf.uk, paths.pdf.en]) {
    if (!existsSync(join(root, pdf))) return { ok: false, message: `${pdf} is missing: run npm run letter` };
  }
  const saved = existsSync(join(root, paths.hash)) ? readFileSync(join(root, paths.hash), 'utf8').trim() : '';
  if (saved !== letterHash(letterInputs(c.year, root), root)) {
    return { ok: false, message: `The ${c.year} info letter PDFs are older than the data they show: run npm run letter` };
  }
  return { ok: true };
}
