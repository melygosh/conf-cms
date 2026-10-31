import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const uk = readFileSync('dist/index.html', 'utf8');
const en = readFileSync('dist/en/index.html', 'utf8');

const UK_FORM = 'https://docs.google.com/forms/d/e/1FAIpQLScH4NPI31ig5qQ7ENp5DNdq-89fkvnv0CWZfmoMKaqpb7DwSA/viewform?usp=header';
const EN_FORM = 'https://docs.google.com/forms/d/e/1FAIpQLScEfkk2mFtDALmhYqns17EhPYjNVtGsQJrJtH649Xot4c57jg/viewform?usp=header';

describe('Ukrainian page', () => {
  it('is in Ukrainian', () => expect(uk).toContain('<html lang="uk"'));
  it('draws the year into the logo', () => expect(uk).toMatch(/<text[^>]*>2026<\/text>/));
  it('shows the edition and dates', () => {
    expect(uk).toContain('XVI міжнародна науково-практична конференція');
    expect(uk).toContain('17–19 лютого 2026');
  });
  it('links the Ukrainian registration form', () => expect(uk).toContain(`href="${UK_FORM}"`));
  it('switches to English', () => expect(uk).toContain('href="/en/"'));
});

describe('English page', () => {
  it('is in English', () => expect(en).toContain('<html lang="en"'));
  it('shows the dates', () => expect(en).toContain('17–19 February 2026'));
  it('links the English registration form', () => expect(en).toContain(`href="${EN_FORM}"`));
  it('switches to Ukrainian', () => expect(en).toContain('href="/"'));
});

describe('both pages', () => {
  it.each([['uk', uk], ['en', en]])('%s has no leaked placeholders or legacy libraries', (_, html) => {
    for (const bad of ['undefined', '[object Object]', 'bootstrap', 'jquery']) {
      expect(html.toLowerCase()).not.toContain(bad.toLowerCase());
    }
  });
});
