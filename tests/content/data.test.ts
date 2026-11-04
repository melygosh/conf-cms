import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { archiveSchema, conferenceSchema, siteSchema } from '../../src/content/schema';
import { toIso } from '../../src/lib/dates';

const load = (path: string) => parse(readFileSync(path, 'utf8'));
const yamlFiles = (dir: string) => readdirSync(dir).filter((f) => f.endsWith('.yaml')).map((f) => join(dir, f));

describe('content files', () => {
  it.each(yamlFiles('src/content/conferences'))('%s matches the conference schema', (path) => {
    const r = conferenceSchema.safeParse(load(path));
    expect(r.success, JSON.stringify(r.error?.issues)).toBe(true);
  });

  // Abstracts go only through the registration form: an email here is how they got lost and duplicated in 2026.
  it.each(yamlFiles('src/content/conferences'))('%s does not offer email for abstracts', (path) => {
    const { rules } = conferenceSchema.parse(load(path)).publication;
    expect(rules.uk).not.toMatch(/@|mailto:/);
    expect(rules.en).not.toMatch(/@|mailto:/);
  });

  it.each(yamlFiles('src/content/archive'))('%s matches the archive schema', (path) => {
    const r = archiveSchema.safeParse(load(path));
    expect(r.success, JSON.stringify(r.error?.issues)).toBe(true);
  });

  it('site.yaml matches the site schema and its partner logos exist', () => {
    const site = siteSchema.parse(load('src/content/site.yaml'));
    expect(site.partners).toHaveLength(7);
    for (const p of site.partners) expect(existsSync(join('public', p.image)), p.image).toBe(true);
  });
});

describe('2026 conference', () => {
  const c = conferenceSchema.parse(load('src/content/conferences/2026.yaml'));

  it('is the sixteenth edition, 17–19 February 2026', () => {
    expect(c.edition).toBe(16);
    expect(toIso(c.dates.start)).toBe('2026-02-17');
    expect(toIso(c.dates.end)).toBe('2026-02-19');
  });

  // Each language takes its prices from its own call for papers (UA: hryvnias only; EN: free for foreign participants).
  it('takes each language’s prices from its own call for papers', () => {
    expect(c.cost.uk.items.map((i) => i.amount)).toEqual(['300 грн', '150 грн']);
    expect(c.cost.en.items[0].note).toContain('free of charge for participants who are not citizens of Ukraine');
  });

  it('has the five UA and four EN key dates of the 2026 calls for papers', () => {
    expect(c.deadlines.filter((d) => d.title.uk)).toHaveLength(5);
    expect(c.deadlines.filter((d) => d.title.en)).toHaveLength(4);
    expect(c.deadlines.filter((d) => d.group === 'papers').map((d) => toIso(d.date))).toEqual(['2026-01-25', '2026-02-16']);
  });

  it('closes registration on 25 January', () => {
    expect(toIso(c.deadlines.find((d) => d.registration)!.date)).toBe('2026-01-25');
  });

  it('has separate registration forms per language', () => {
    expect(c.links.registration.uk).not.toBe(c.links.registration.en);
  });

  it('lists the six organizers, and every organizer logo exists', () => {
    expect(c.organizers).toHaveLength(6);
    for (const o of c.organizers) if (o.logo) expect(existsSync(join('public', o.logo)), o.logo).toBe(true);
    expect(c.organizers.find((o) => o.name.uk.includes('Харківський політехнічний'))?.logo).toBe('/images/organizers/khpi.png');
  });

  it('links every organizer to its website', () => {
    for (const o of c.organizers) expect(o.href, o.name.en).toMatch(/^https?:\/\//);
  });

  it('counts down to the abstracts deadline', () => {
    expect(c.deadlines.filter((d) => d.countdown).map((d) => toIso(d.date))).toEqual(['2026-01-25']);
  });
});
