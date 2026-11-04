import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { conferenceSchema } from '../../src/content/schema';
import { findOverflow, groupDeadlines, ordinalWord, parseCommittees, shortDate, shortRange } from '../../src/lib/letter';
import { conference } from '../fixtures/conference';

describe('ordinalWord', () => {
  it.each([
    [1, 'перша', 'first'],
    [16, 'шістнадцята', 'sixteenth'],
    [17, 'сімнадцята', 'seventeenth'],
    [20, 'двадцята', 'twentieth'],
    [21, 'двадцять перша', 'twenty-first'],
    [23, 'двадцять третя', 'twenty-third'],
    [30, 'тридцята', 'thirtieth'],
    [42, 'сорок друга', 'forty-second'],
  ])('%i', (n, uk, en) => {
    expect(ordinalWord(n, 'uk')).toBe(uk);
    expect(ordinalWord(n, 'en')).toBe(en);
  });

  it.each([0, 50])('refuses %i', (n) => expect(() => ordinalWord(n, 'uk')).toThrow());
});

describe('groupDeadlines', () => {
  it('groups in order of first appearance', async () => {
    const c = await conference();
    expect(groupDeadlines(c, 'uk').map((g) => [g.group, g.items.length])).toEqual([
      ['participation', 2],
      ['papers', 1],
    ]);
  });

  it('drops a group that has no deadlines', async () => {
    const c = await conference();
    c.deadlines = c.deadlines.map((d) => ({ ...d, group: 'participation' as const }));
    expect(groupDeadlines(c, 'uk').map((g) => g.group)).toEqual(['participation']);
  });

  it('leaves out deadlines the language does not have', async () => {
    const c = await conference();
    c.deadlines[0] = { ...c.deadlines[0], only: 'uk', title: { uk: 'Оргвнесок' } };
    expect(groupDeadlines(c, 'en')[0].items).toHaveLength(1);
  });
});

describe('parseCommittees', () => {
  it('splits committees, roles and members', () => {
    const r = parseCommittees('### A\n\n#### Chair\n\n**X**, prof.\n\n#### Members\n\n**Y**, doc.\n\n**Z**, doc.\n\n### B\n\n**W**, PhD');
    expect(r).toEqual([
      { title: 'A', groups: [{ role: 'Chair', members: ['**X**, prof.'] }, { role: 'Members', members: ['**Y**, doc.', '**Z**, doc.'] }] },
      { title: 'B', groups: [{ role: '', members: ['**W**, PhD'] }] },
    ]);
  });

  it('reads a role heading followed directly by a member, without a blank line', () => {
    expect(parseCommittees('### A\n#### Chair\n**X**, prof.\n\n**Y**, doc.')).toEqual([
      { title: 'A', groups: [{ role: 'Chair', members: ['**X**, prof.', '**Y**, doc.'] }] },
    ]);
  });

  it.each(['uk', 'en'] as const)('keeps every 2026 %s committee member', (lang) => {
    const c = conferenceSchema.parse(parse(readFileSync('src/content/conferences/2026.yaml', 'utf8')));
    const parsed = parseCommittees(c.committees[lang]);
    const members = parsed.flatMap((x) => x.groups.flatMap((g) => g.members));
    expect(parsed).toHaveLength(2);
    expect(members).toHaveLength(c.committees[lang].match(/^\*\*/gm)!.length);
  });
});

describe('findOverflow', () => {
  const box = (page: number, h: [number, number], w: [number, number] = [700, 700]) => ({
    page,
    scrollHeight: h[0],
    clientHeight: h[1],
    scrollWidth: w[0],
    clientWidth: w[1],
  });

  it('names the pages whose content is taller than its box', () => {
    expect(findOverflow([box(1, [900, 1000]), box(2, [1040, 1000]), box(3, [1001, 1000])])).toEqual([2]);
  });

  it('catches text wider than its box, e.g. a long amount in the cover strip', () => {
    expect(findOverflow([box(1, [190, 190], [740, 700])])).toEqual([1]);
  });

  it('names a page once however many of its boxes overflow', () => {
    expect(findOverflow([box(1, [200, 190]), box(1, [1000, 900]), box(7, [10, 10], [900, 700])])).toEqual([1, 7]);
  });
});

describe('short dates', () => {
  it('writes a day and month as DD.MM', () => expect(shortDate('2026-01-05')).toBe('05.01'));
  it('shares the month inside one month', () => expect(shortRange('2026-02-17', '2026-02-19')).toBe('17–19.02'));
  it('writes both months across a month boundary', () => expect(shortRange('2026-02-27', '2026-03-01')).toBe('27.02–01.03'));
  it('writes a one-day event as one date', () => expect(shortRange('2026-02-17', '2026-02-17')).toBe('17.02'));
});
