import { describe, expect, it } from 'vitest';
import { ui } from '../../src/i18n/ui';
import { letterHref } from '../../src/lib/conference';
import { toIso } from '../../src/lib/dates';
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

  it.each(pages)('%s shows one date card per day, so the key dates fit one row', (lang, html) => {
    const days = new Set(c.deadlines.filter((d) => d.title[lang]).map((d) => toIso(d.date)));
    expect(html.match(/<li class="date-card"/g)).toHaveLength(days.size);
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

  it.each(pages)('%s links the current year\'s book of abstracts in the hero once it is published', (lang, html) => {
    const hero = html.slice(html.indexOf('class="hero"'), html.indexOf('id="dates"'));
    const proceedings = archive.find((a) => a.year === c.year)?.proceedings;
    if (proceedings) expect(hero).toMatch(new RegExp(`href="${attr(proceedings)}"[^>]*>${ui[lang].proceedings} ↗<`));
    else expect(hero).not.toContain(`>${ui[lang].proceedings} ↗<`);
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

  it.each(pages)('%s shows every price item of its own language and its payment details', (lang, html) => {
    const section = html.slice(html.indexOf('id="cost"'), html.indexOf('id="authors"'));
    for (const item of c.cost[lang].items) {
      expect(section).toContain(mdInline(item.label));
      expect(section).toContain(item.amount);
    }
    expect(section).toContain(md(c.cost[lang].payment));
  });

  it('does not leak one language’s payment details into the other', () => {
    const [[, uk], [, en]] = pages;
    expect(uk).not.toContain(md(c.cost.en.payment));
    expect(en).not.toContain(md(c.cost.uk.payment));
  });

  it.each(pages)('%s shows the venue address and its link', (lang, html) => {
    expect(html).toContain(c.venue.address[lang]);
    expect(html).toContain(`href="${attr(c.venue.url[lang])}"`);
  });

  it.each(pages)('%s hero links the info letter', (lang, html) => {
    expect(html).toContain(`href="${attr(letterHref(c, lang))}"`);
  });

  it.each(pages)('%s lists what goes to the Program Committee', (lang, html) => {
    for (const step of c.submission[lang]) expect(html).toContain(step.title);
  });
});
