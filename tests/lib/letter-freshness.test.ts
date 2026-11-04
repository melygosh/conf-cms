import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { checkLetterFreshness, letterPaths, renderedLetterHash } from '../../src/lib/letter-freshness';

let root: string;
const dist = () => join(root, 'dist');

const write = (path: string, text: string) => {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), text);
};

const letterHtml = (lang: string, extra = '') =>
  `<html lang="${lang}"><head><meta name="letter-check" content="2026"><link rel="stylesheet" href="/_astro/letter.css"></head>` +
  `<body><section class="page" style="background-image: url(/_astro/photo.jpg)"><img src="/images/organizers/mon.svg">${extra}</section></body></html>`;

/** What `npm run letter` leaves behind: both PDFs and the hash of the rendered letter. */
const generate = () => {
  const paths = letterPaths(2026);
  write(paths.pdf.uk, '%PDF uk');
  write(paths.pdf.en, '%PDF en');
  write(paths.hash, renderedLetterHash(dist()));
};

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'letter-'));
  write('dist/letter/index.html', letterHtml('uk'));
  write('dist/en/letter/index.html', letterHtml('en'));
  write('dist/_astro/letter.css', '@font-face { src: url(/_astro/manrope.woff2) }');
  write('dist/_astro/manrope.woff2', 'font v1');
  write('dist/_astro/photo.jpg', 'photo v1');
  write('dist/images/organizers/mon.svg', '<svg>v1</svg>');
  write('dist/index.html', '<html>site</html>');
});

afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('checkLetterFreshness', () => {
  it('is fresh right after the letter was generated', () => {
    generate();
    expect(checkLetterFreshness(dist(), root)).toEqual({ ok: true });
  });

  it('is stale when the rendered letter changes', () => {
    generate();
    write('dist/en/letter/index.html', letterHtml('en', '<p>new deadline</p>'));
    const r = checkLetterFreshness(dist(), root);
    expect(r.ok).toBe(false);
    expect(!r.ok && r.message).toMatch(/npm run letter/);
  });

  it('is stale when a logo the letter shows is replaced', () => {
    generate();
    write('dist/images/organizers/mon.svg', '<svg>v2</svg>');
    expect(checkLetterFreshness(dist(), root).ok).toBe(false);
  });

  it('is stale when a font its stylesheet loads changes', () => {
    generate();
    write('dist/_astro/manrope.woff2', 'font v2');
    expect(checkLetterFreshness(dist(), root).ok).toBe(false);
  });

  it('is stale when the cover photo changes', () => {
    generate();
    write('dist/_astro/photo.jpg', 'photo v2');
    expect(checkLetterFreshness(dist(), root).ok).toBe(false);
  });

  it('ignores changes the letter does not show', () => {
    generate();
    write('dist/index.html', '<html>site, edited</html>');
    expect(checkLetterFreshness(dist(), root)).toEqual({ ok: true });
  });

  it('reports a missing PDF by name', () => {
    generate();
    rmSync(join(root, letterPaths(2026).pdf.en));
    const r = checkLetterFreshness(dist(), root);
    expect(!r.ok && r.message).toContain('info-letter-2026-en.pdf');
  });

  it('does not check a year that links its own info letter (no letter-check mark)', () => {
    write('dist/letter/index.html', '<html lang="uk"><body></body></html>');
    expect(checkLetterFreshness(dist(), root)).toEqual({ ok: true });
  });
});
