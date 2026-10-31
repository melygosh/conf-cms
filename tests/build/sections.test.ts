import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const uk = readFileSync('dist/index.html', 'utf8');
const en = readFileSync('dist/en/index.html', 'utf8');
const pages = [['uk', uk], ['en', en]] as const;

const SECTION_IDS = ['about', 'topics', 'publication', 'dates', 'cost', 'authors', 'committees', 'registration', 'archive', 'partners', 'contacts'];

describe('page sections', () => {
  it.each(pages)('%s has every section anchor', (_, html) => {
    for (const id of SECTION_IDS) expect(html, id).toContain(`id="${id}"`);
  });

  it.each(pages)('%s embeds the venue map and the KhPI map', (_, html) => {
    expect(html).toMatch(/<iframe[^>]*src="[^"]*!2d23\.46006058048362/);
    expect(html).toMatch(/<iframe[^>]*src="[^"]*!2d36\.2498081/);
  });

  it.each(pages)('%s marks deadlines and the countdown for the client script', (_, html) => {
    expect(html).toContain('data-deadline="2026-01-25"');
    expect(html).toContain('data-deadline="2026-02-16"');
    expect(html).toContain('data-countdown="2026-01-25"');
    expect(html).toContain('data-finished-after="2026-02-19"');
  });

  it.each(pages)('%s ties registration to the conference end date', (_, html) => {
    expect(html).toMatch(/<a[^>]*data-hidden-after="2026-02-19"[^>]*docs\.google\.com\/forms|<a[^>]*docs\.google\.com\/forms[^>]*data-hidden-after="2026-02-19"/);
    expect(html).toMatch(/id="registration"[^>]*data-hidden-after="2026-02-19"|data-hidden-after="2026-02-19"[^>]*id="registration"/);
  });

  it.each(pages)('%s uses native disclosure for the authors section', (_, html) => {
    expect(html).toContain('<details');
  });

  it.each(pages)('%s lists 7 partners and the 2018 photos', (_, html) => {
    const partners = html.match(/<a[^>]*class="partner"/g) ?? [];
    expect(partners).toHaveLength(7);
    expect(html).toContain('https://photos.app.goo.gl/V2orFOwz0o38lC543');
  });

  it.each(pages)('%s links organizer cards to their sites in a new tab', (_, html) => {
    const cards = html.match(/<a[^>]*class="organizer[^"]*"[^>]*>/g) ?? [];
    expect(cards).toHaveLength(6);
    for (const card of cards) {
      expect(card).toMatch(/href="https?:\/\//);
      expect(card).toContain('target="_blank"');
    }
  });

  it.each(pages)('%s has no empty links', (_, html) => {
    expect(html).not.toContain('href=""');
  });

  it('keeps per-language prices and payment details', () => {
    expect(uk).toContain('5 USD');
    expect(uk).toContain('UA283052990000026002045921275');
    expect(en).toContain('5 EUR');
    expect(en).toContain('contact the Program Committee');
    expect(en).not.toContain('UA283052990000026002045921275');
  });
});
