import { describe, expect, it } from 'vitest';
import { ui } from '../../src/i18n/ui';
import { toRoman } from '../../src/lib/conference';
import { ordinalWord } from '../../src/lib/letter';
import { attr, conference as c, letters, site } from './expected';

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
/** How Astro writes a string into HTML text. */
const text = (s: string) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

describe('info letter', () => {
  it.each(letters)('%s letter is a standalone, unindexed A4 document of seven pages', (lang, html) => {
    expect(html).toContain(`<html lang="${lang}"`);
    expect(html).toContain('<meta name="robots" content="noindex">');
    expect(html.match(/<section class="page[ "]/g)).toHaveLength(7);
    expect(html).not.toContain('class="site-header');
  });

  it.each(letters)('%s cover carries the edition, title, dates and the registration QR', (lang, html) => {
    const cover = html.slice(0, html.indexOf('</section>'));
    expect(cover).toContain(`>${toRoman(c.edition)}<`);
    expect(cover).toContain(ui[lang].letter.editionWords(cap(ordinalWord(c.edition, lang))));
    expect(cover).toContain(c.title[lang]);
    expect(cover).toContain(c.cost[lang].items[0].amount);
    expect(cover).toContain(`href="${attr(c.links.registration[lang])}"`);
    expect(cover).toMatch(/<svg[^>]*viewBox="0 0 \d+ \d+"[^>]*>\s*<path/);
  });

  it.each(letters)('%s back cover has the registration card and both contact blocks', (lang, html) => {
    const back = html.slice(html.lastIndexOf('<section class="page'));
    expect(back).toContain(ui[lang].letter.registerCta);
    expect(back).toContain(`href="${attr(c.links.registration[lang])}"`);
    for (const email of site.contacts[lang].match(/[\w.]+@[\w.]+/g) ?? []) expect(back).toContain(email);
  });
});

describe('info letter inner pages', () => {
  it.each(letters)('%s keeps every block of its call for papers', (lang, html) => {
    expect(html).toContain(text(c.venue.name[lang]));
    expect(html).toContain(text(c.venue.address[lang]));
    for (const o of c.organizers) expect(html).toContain(text(o.name[lang]));
    for (const s of c.sections) expect(html).toContain(s.name[lang]);
    for (const d of c.deadlines.filter((x) => x.title[lang])) expect(html).toContain(d.title[lang]!);
    for (const step of c.submission[lang]) expect(html).toContain(step.title);
    for (const item of c.cost[lang].items) expect(html).toContain(item.amount);
    for (const b of c.publication.articles.badges[lang]) expect(html).toContain(b);
    expect(html).toContain(`href="${attr(c.publication.articles.journalUrl)}"`);
    const template = c.publication.articles.templateUrl[lang];
    if (template) expect(html).toContain(`href="${attr(template)}"`);
  });

  it('shows a deadline only in the language that has it', () => {
    const [[, uk], [, en]] = letters;
    for (const d of c.deadlines.filter((x) => x.only === 'uk')) {
      expect(uk).toContain(d.title.uk!);
      expect(en.match(/class="tline__step/g)).toHaveLength(c.deadlines.filter((x) => x.title.en).length);
    }
  });

  it.each(letters)('%s lists every committee member verbatim', (lang, html) => {
    for (const name of c.committees[lang].match(/^\*\*[^*]+\*\*/gm)!) expect(html).toContain(name.slice(2, -2));
  });

  it.each(letters)('%s renders raw HTML from Markdown as markup', (_, html) => {
    expect(html).not.toContain('&lt;br');
    expect(html).not.toContain('&lt;sup');
    expect(html).not.toContain('undefined');
  });
});
