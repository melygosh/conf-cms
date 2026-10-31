import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ui } from '../../src/i18n/ui';
import { toRoman } from '../../src/lib/conference';
import { formatRange, toIso } from '../../src/lib/dates';
import { attr, conference as c, endIso, pages } from './expected';

const [[, uk], [, en]] = pages;
const range = (lang: 'uk' | 'en') => formatRange(toIso(c.dates.start), endIso, lang);

describe('Ukrainian page', () => {
  it('is in Ukrainian', () => expect(uk).toContain('<html lang="uk"'));
  it('draws the current year into the logo', () => expect(uk).toMatch(new RegExp(`<text[^>]*>${c.year}</text>`)));
  it('shows the edition and dates', () => {
    expect(uk).toContain(ui.uk.editionLine(toRoman(c.edition)));
    expect(uk).toContain(range('uk'));
  });
  it('links the Ukrainian registration form', () => expect(uk).toContain(`href="${attr(c.links.registration.uk)}"`));
  it('switches to English', () => expect(uk).toContain('href="/en/"'));
});

describe('English page', () => {
  it('is in English', () => expect(en).toContain('<html lang="en"'));
  it('shows the edition and dates', () => {
    expect(en).toContain(ui.en.editionLine(toRoman(c.edition)));
    expect(en).toContain(range('en'));
  });
  it('links the English registration form', () => expect(en).toContain(`href="${attr(c.links.registration.en)}"`));
  it('switches to Ukrainian', () => expect(en).toContain('href="/"'));
});

describe('both pages', () => {
  it.each(pages)('%s has no leaked placeholders or legacy libraries', (_, html) => {
    for (const bad of ['undefined', '[object Object]', 'bootstrap', 'jquery']) {
      expect(html.toLowerCase()).not.toContain(bad.toLowerCase());
    }
  });
});

describe('legacy URLs', () => {
  it('redirects /index_eng.html to /en/', () => {
    const html = readFileSync('dist/index_eng.html', 'utf8');
    expect(html).toContain('<meta http-equiv="refresh" content="0; url=/en/">');
    expect(html).toContain('<link rel="canonical" href="https://imconf.com.ua/en/">');
  });

  it('redirects /?lang=en to /en/ from the Ukrainian page only', () => {
    expect(uk).toMatch(/lang=en[\s\S]*location\.replace\('\/en\/'\)|location\.replace\('\/en\/'\)[\s\S]*lang=en/);
    expect(en).not.toContain("location.replace('/en/')");
  });
});
