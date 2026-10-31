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
