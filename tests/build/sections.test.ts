import { describe, expect, it } from 'vitest';
import { ui } from '../../src/i18n/ui';
import { md, mdInline } from '../../src/lib/markdown';
import { archive, attr, conference as c, countdownIso, deadlineIsos, endIso, pages, registrationIso, site } from './expected';

const SECTION_IDS = ['about', 'topics', 'publication', 'dates', 'cost', 'authors', 'committees', 'registration', 'archive', 'partners', 'contacts'];

describe('page sections', () => {
  it.each(pages)('%s has every section anchor', (_, html) => {
    for (const id of SECTION_IDS) expect(html, id).toContain(`id="${id}"`);
  });

  it.each(pages)('%s embeds the venue map and the KhPI map', (_, html) => {
    expect(html).toContain(`src="${attr(c.venue.mapEmbedUrl)}"`);
    expect(html).toContain(`src="${attr(site.khpiMapEmbedUrl)}"`);
  });

  it.each(pages)('%s marks deadlines and the countdown for the client script', (_, html) => {
    for (const iso of deadlineIsos) expect(html).toContain(`data-deadline="${iso}"`);
    expect(html).toContain(`data-countdown="${countdownIso}"`);
    expect(html).toContain(`data-finished-after="${endIso}"`);
  });

  it.each(pages)('%s ties registration to the conference end date', (lang, html) => {
    const form = attr(c.links.registration[lang]);
    const registerLinks = html.match(/<a[^>]*>/g)!.filter((a) => a.includes(`href="${form}"`) && a.includes('class="button'));
    expect(registerLinks.length).toBeGreaterThan(0);
    expect(registerLinks).toHaveLength(3); // hero, publication, registration band
    for (const a of registerLinks) {
      expect(a).toContain(`data-hidden-after="${endIso}"`);
      if (registrationIso) expect(a).toContain(`data-closed-after="${registrationIso}"`);
    }
    expect(html).toMatch(new RegExp(`id="registration"[^>]*data-hidden-after="${endIso}"`));
  });

  it.each(pages)('%s sends abstracts to the registration form from the publication rules', (lang, html) => {
    const section = html.slice(html.indexOf('id="publication"'), html.indexOf('id="cost"'));
    expect(section).toContain(`href="${attr(c.links.registration[lang])}"`);
  });

  it.each(pages)('%s has one hero button for both registration and abstracts', (lang, html) => {
    const hero = html.slice(html.indexOf('class="hero"'), html.indexOf('id="dates"'));
    const toForm = hero.match(/<a[^>]*>.*?<\/a>/g)!.filter((a) => a.includes(`href="${attr(c.links.registration[lang])}"`));
    expect(toForm).toHaveLength(1);
    expect(toForm[0]).toContain(`>${attr(ui[lang].register)}<`);
    expect(toForm[0]).toContain(`>${attr(ui[lang].registrationClosed)}<`);
  });

  it.each(pages)('%s uses native disclosure for the authors section', (_, html) => {
    expect(html).toContain('<details');
  });

  it.each(pages)('%s lists every partner', (_, html) => {
    expect(html.match(/<a[^>]*class="partner"/g) ?? []).toHaveLength(site.partners.length);
  });

  it.each(pages)('%s shows every archive year with its proceedings, photos and presentations', (_, html) => {
    const section = html.slice(html.indexOf('id="archive"'), html.indexOf('id="partners"'));
    for (const year of archive) {
      expect(section, String(year.year)).toContain(`>${year.year}<`);
      for (const href of [year.proceedings, year.photos, ...year.presentations.map((p) => p.href)])
        if (href) expect(section).toContain(`href="${attr(href)}"`);
    }
  });

  it.each(pages)('%s links every organizer card to its site in a new tab', (_, html) => {
    const cards = html.match(/<a[^>]*class="organizer[^"]*"[^>]*>/g) ?? [];
    expect(cards).toHaveLength(c.organizers.length);
    for (const o of c.organizers) {
      const card = cards.find((a) => a.includes(`href="${attr(o.href)}"`));
      expect(card, o.href).toBeDefined();
      expect(card).toContain('target="_blank"');
    }
  });

  it.each(pages)('%s has no empty links', (_, html) => {
    expect(html).not.toContain('href=""');
  });

  it.each(pages)('%s shows its own prices and payment details', (lang, html) => {
    for (const row of c.cost.rows) {
      expect(html).toContain(mdInline(row.label[lang]));
      if (row.abroad[lang].trim() !== '-') expect(html).toContain(row.abroad[lang]);
    }
    expect(html).toContain(md(c.cost.payment[lang]));
  });

  it('does not leak one language’s payment details into the other', () => {
    const [[, uk], [, en]] = pages;
    if (c.cost.payment.uk !== c.cost.payment.en) {
      expect(uk).not.toContain(md(c.cost.payment.en));
      expect(en).not.toContain(md(c.cost.payment.uk));
    }
  });
});
