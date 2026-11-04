import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { conferenceSchema } from '../../src/content/schema';
import { findOverflow, groupDeadlines, ordinalWord, parseCommittees } from '../../src/lib/letter';
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

  it.each(['uk', 'en'] as const)('keeps every 2026 %s committee member', (lang) => {
    const c = conferenceSchema.parse(parse(readFileSync('src/content/conferences/2026.yaml', 'utf8')));
    const parsed = parseCommittees(c.committees[lang]);
    const members = parsed.flatMap((x) => x.groups.flatMap((g) => g.members));
    expect(parsed).toHaveLength(2);
    expect(members).toHaveLength(c.committees[lang].match(/^\*\*/gm)!.length);
  });
});

describe('findOverflow', () => {
  it('names the pages whose content is taller than the page', () => {
    expect(
      findOverflow([
        { scrollHeight: 900, clientHeight: 1000 },
        { scrollHeight: 1040, clientHeight: 1000 },
        { scrollHeight: 1001, clientHeight: 1000 },
      ]),
    ).toEqual([2]);
  });
});
