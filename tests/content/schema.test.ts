import { describe, expect, it } from 'vitest';
import { archiveSchema, conferenceSchema } from '../../src/content/schema';
import { rawConference } from '../fixtures/conference';

const paths = (input: unknown) => {
  const r = conferenceSchema.safeParse(input);
  return r.success ? [] : r.error.issues.map((i) => i.path);
};

describe('conferenceSchema', () => {
  it('accepts a complete conference', () => {
    expect(conferenceSchema.safeParse(rawConference()).success).toBe(true);
  });

  it('rejects a missing English translation and names the field', () => {
    const raw = rawConference() as { title: Record<string, string> };
    delete raw.title.en;
    expect(paths(raw)).toContainEqual(['title', 'en']);
  });

  it('rejects a second registration deadline', () => {
    const raw = rawConference() as { deadlines: { registration?: boolean }[] };
    raw.deadlines[1].registration = true;
    expect(paths(raw)).toContainEqual(['deadlines', 1, 'registration']);
  });

  it('rejects a human-written date and names the field', () => {
    const raw = rawConference() as { deadlines: { date: string }[] };
    raw.deadlines[0].date = '25 січня';
    expect(paths(raw)).toContainEqual(['deadlines', 0, 'date']);
  });

  it.each([['January 25'], ['25 January 2027'], ['2027/01/25'], [20270125], ['2026-02-30']])(
    'rejects the loosely written date %s instead of guessing',
    (date) => {
      const raw = rawConference() as { deadlines: { date: unknown }[] };
      raw.deadlines[0].date = date;
      expect(paths(raw)).toContainEqual(['deadlines', 0, 'date']);
    },
  );

  it('accepts a YAML date (UTC midnight Date) and an ISO string', () => {
    const raw = rawConference() as { deadlines: { date: unknown }[] };
    raw.deadlines[0].date = new Date(Date.UTC(2026, 0, 25));
    expect(conferenceSchema.safeParse(raw).success).toBe(true);
  });

  it('rejects conference dates outside the conference year', () => {
    expect(paths({ ...rawConference(), year: 2027 })).toContainEqual(['dates', 'start']);
  });

  it('rejects a conference that ends before it starts', () => {
    expect(paths({ ...rawConference(), dates: { start: '2026-02-19', end: '2026-02-17' } })).toContainEqual(['dates', 'end']);
  });

  it('accepts a conference without an info letter link', () => {
    const raw = rawConference() as { links: Record<string, unknown> };
    delete raw.links.infoLetter;
    expect(conferenceSchema.safeParse(raw).success).toBe(true);
  });

  it('rejects an unknown deadline group and names the field', () => {
    const raw = rawConference() as { deadlines: { group?: string }[] };
    raw.deadlines[0].group = 'other';
    expect(paths(raw)).toContainEqual(['deadlines', 0, 'group']);
  });

  it('requires prices for each language separately', () => {
    const raw = rawConference() as { cost: Record<string, unknown> };
    delete raw.cost.en;
    expect(paths(raw)).toContainEqual(['cost', 'en']);
  });

  it('rejects a language with no price items', () => {
    const raw = rawConference() as { cost: { uk: { items: unknown[] } } };
    raw.cost.uk.items = [];
    expect(paths(raw)).toContainEqual(['cost', 'uk', 'items']);
  });

  it('allows a deadline that only one language has', () => {
    const raw = rawConference() as { deadlines: { title: Record<string, string>; only?: string }[] };
    delete raw.deadlines[2].title.en;
    raw.deadlines[2].only = 'uk';
    expect(conferenceSchema.safeParse(raw).success).toBe(true);
  });

  it('still requires both titles of a deadline both languages have', () => {
    const raw = rawConference() as { deadlines: { title: Record<string, string> }[] };
    delete raw.deadlines[2].title.en;
    expect(paths(raw)).toContainEqual(['deadlines', 2, 'title', 'en']);
  });

  it('allows an article template for one language only', () => {
    const raw = rawConference() as { publication: { articles: { templateUrl: Record<string, string> } } };
    delete raw.publication.articles.templateUrl.en;
    expect(conferenceSchema.safeParse(raw).success).toBe(true);
  });

  it('lets each language link its own venue page', () => {
    const raw = rawConference() as { venue: { url: unknown } };
    raw.venue.url = { uk: 'https://lpnu.ua/politekhnik-2', en: 'https://lpnu.ua/en/polytechnic-2-recreational-camp' };
    expect(conferenceSchema.safeParse(raw).success).toBe(true);
  });

  it('rejects unknown top-level fields', () => {
    expect(conferenceSchema.safeParse({ ...rawConference(), extra: 1 }).success).toBe(false);
  });
});

describe('archiveSchema', () => {
  it('accepts a year with only a proceedings link', () => {
    const a = archiveSchema.parse({ year: 2024, proceedings: 'https://repository.kpi.kharkov.ua/handle/KhPI-Press/74015' });
    expect(a.proceedings).toBe('https://repository.kpi.kharkov.ua/handle/KhPI-Press/74015');
    expect(a.presentations).toEqual([]);
  });

  it('rejects a proceedings value that is not a URL', () => {
    expect(archiveSchema.safeParse({ year: 2024, proceedings: 'KhPI-Press/74015' }).success).toBe(false);
  });
});
