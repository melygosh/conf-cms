import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Conference } from '../../src/content/schema';
import { checkLetterFreshness, letterHash, letterInputs, letterPaths } from '../../src/lib/letter-freshness';
import { conference } from '../fixtures/conference';

let root: string;
let c: Conference;

const write = (path: string, text: string) => {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), text);
};

/** What `npm run letter` leaves behind: both PDFs and the hash of the inputs. */
const generate = () => {
  const paths = letterPaths(2026);
  write(paths.pdf.uk, '%PDF uk');
  write(paths.pdf.en, '%PDF en');
  write(paths.hash, letterHash(letterInputs(2026, root), root));
};

beforeEach(async () => {
  root = mkdtempSync(join(tmpdir(), 'letter-'));
  write('src/content/conferences/2026.yaml', 'year: 2026\n');
  write('src/content/site.yaml', 'contacts: {}\n');
  write('src/i18n/ui.ts', 'export const ui = {};\n');
  write('src/letter/Cover.astro', '<section />\n');
  write('src/lib/letter.ts', 'export {};\n');
  write('src/lib/qr.ts', 'export {};\n');
  const base = await conference();
  c = { ...base, links: { registration: base.links.registration } };
});

afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('letterInputs', () => {
  it('lists the year, the site data, the strings and the letter code, sorted', () => {
    expect(letterInputs(2026, root)).toEqual([
      'src/content/conferences/2026.yaml',
      'src/content/site.yaml',
      'src/i18n/ui.ts',
      'src/letter/Cover.astro',
      'src/lib/letter.ts',
      'src/lib/qr.ts',
    ]);
  });
});

describe('checkLetterFreshness', () => {
  it('is fresh right after the letter was generated', () => {
    generate();
    expect(checkLetterFreshness(c, { root })).toEqual({ ok: true });
  });

  it('is stale after the conference YAML changes', () => {
    generate();
    write('src/content/conferences/2026.yaml', 'year: 2026\n# a new deadline\n');
    const r = checkLetterFreshness(c, { root });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.message).toMatch(/npm run letter/);
  });

  it('is stale after the letter design changes', () => {
    generate();
    write('src/letter/Cover.astro', '<section class="new" />\n');
    expect(checkLetterFreshness(c, { root }).ok).toBe(false);
  });

  it('reports a missing PDF by name', () => {
    generate();
    rmSync(join(root, letterPaths(2026).pdf.en));
    const r = checkLetterFreshness(c, { root });
    expect(!r.ok && r.message).toContain('info-letter-2026-en.pdf');
  });

  it('does not check a year that links its own info letter', () => {
    const own = { ...c, links: { ...c.links, infoLetter: { uk: 'https://x/uk.pdf', en: 'https://x/en.pdf' } } };
    expect(checkLetterFreshness(own, { root })).toEqual({ ok: true });
  });
});
