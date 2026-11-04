import { describe, expect, it } from 'vitest';
import { assertConferenceFiles, countdownTarget, deadlinesByDay, isFinished, letterHref, pickCurrent, registrationClose, toRoman } from '../../src/lib/conference';
import { conference } from '../fixtures/conference';

describe('pickCurrent', () => {
  it('picks the latest year', async () => {
    const c2026 = await conference();
    const c2027 = { ...c2026, year: 2027 };
    expect(pickCurrent([c2026, c2027]).year).toBe(2027);
  });

  it('throws when there is no conference', () => {
    expect(() => pickCurrent([])).toThrow();
  });
});

describe('toRoman', () => {
  it('converts editions', () => {
    expect(toRoman(16)).toBe('XVI');
    expect(toRoman(17)).toBe('XVII');
  });
});

describe('countdownTarget', () => {
  it('targets the abstracts deadline before it passes', async () => {
    const target = countdownTarget(await conference(), new Date('2025-11-15T10:00:00Z'));
    expect(target?.iso).toBe('2026-01-25');
  });

  it('is null once every deadline has passed', async () => {
    expect(countdownTarget(await conference(), new Date('2026-02-20T10:00:00Z'))).toBeNull();
  });
});

describe('registrationClose', () => {
  it('is the date of the deadline marked registration', async () => {
    expect(registrationClose(await conference())).toBe('2026-01-20');
  });

  it('is null when no deadline is marked', async () => {
    const c = await conference();
    expect(registrationClose({ ...c, deadlines: c.deadlines.map((d) => ({ ...d, registration: false })) })).toBeNull();
  });
});

describe('isFinished', () => {
  it('is false on the last conference day and true after it', async () => {
    const c = await conference();
    expect(isFinished(c, new Date('2026-02-19T10:00:00Z'))).toBe(false);
    expect(isFinished(c, new Date('2026-02-20T10:00:00Z'))).toBe(true);
  });
});

describe('assertConferenceFiles', () => {
  it('accepts files named after their year', async () => {
    const c = await conference();
    expect(() => assertConferenceFiles([{ id: '2026', data: c }])).not.toThrow();
  });

  it('fails when a copied file keeps the old year', async () => {
    const c = await conference();
    expect(() => assertConferenceFiles([{ id: '2026', data: c }, { id: '2027', data: c }])).toThrow(/2027\.yaml.*year: 2026/);
  });
});

describe('letterHref', () => {
  it('links the generated letter when the year has no info letter link', async () => {
    const c = await conference();
    expect(letterHref({ ...c, links: { registration: c.links.registration } }, 'en')).toBe('/letters/info-letter-2026-en.pdf');
  });

  it('keeps an explicit info letter link', async () => {
    const c = await conference();
    const links = { ...c.links, infoLetter: { uk: 'https://x/uk.pdf', en: 'https://x/en.pdf' } };
    expect(letterHref({ ...c, links }, 'uk')).toBe('https://x/uk.pdf');
  });
});

describe('deadlinesByDay', () => {
  it('gives each date one entry, in order, with every event of that day', async () => {
    const c = await conference();
    c.deadlines = [
      { ...c.deadlines[0], date: new Date('2026-01-25T00:00:00Z'), title: { uk: 'Заявка', en: 'Registration' } },
      { ...c.deadlines[1], date: new Date('2026-01-25T00:00:00Z'), title: { uk: 'Тези', en: 'Abstracts' } },
      { ...c.deadlines[2], date: new Date('2026-02-16T00:00:00Z'), title: { uk: 'Рецензування', en: 'Review' } },
    ];
    expect(deadlinesByDay(c, 'uk')).toEqual([
      { iso: '2026-01-25', titles: ['Заявка', 'Тези'] },
      { iso: '2026-02-16', titles: ['Рецензування'] },
    ]);
  });

  it('leaves out events the language does not have', async () => {
    const c = await conference();
    c.deadlines[0] = { ...c.deadlines[0], only: 'uk', title: { uk: 'Оргвнесок' } };
    expect(deadlinesByDay(c, 'en').flatMap((d) => d.titles)).not.toContain('Оргвнесок');
    expect(deadlinesByDay(c, 'en')).toHaveLength(2);
  });
});
