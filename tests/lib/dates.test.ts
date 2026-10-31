import { describe, expect, it } from 'vitest';
import { daysUntil, deadlineState, formatRange, kyivToday, pluralDays } from '../../src/lib/dates';

describe('Kyiv calendar dates', () => {
  it('is already the next day in Kyiv at 22:30 UTC', () => {
    expect(kyivToday(new Date('2026-01-24T22:30:00Z'))).toBe('2026-01-25');
  });

  it('treats the deadline day itself as today, not past', () => {
    const now = new Date('2026-01-24T22:30:00Z');
    expect(deadlineState('2026-01-25', now)).toBe('today');
    expect(daysUntil('2026-01-25', now)).toBe(0);
  });

  it('marks the deadline past from the next Kyiv day', () => {
    expect(deadlineState('2026-01-25', new Date('2026-01-25T22:30:00Z'))).toBe('past');
  });

  it('counts calendar days across months', () => {
    expect(daysUntil('2026-02-17', new Date('2025-11-15T10:00:00Z'))).toBe(94);
  });
});

describe('pluralDays', () => {
  it.each([
    [1, '1 день'], [2, '2 дні'], [5, '5 днів'], [11, '11 днів'],
    [21, '21 день'], [22, '22 дні'], [25, '25 днів'],
  ])('uk %i → %s', (n, expected) => {
    expect(pluralDays(n, 'uk')).toBe(expected);
  });

  it.each([[1, '1 day'], [2, '2 days']])('en %i → %s', (n, expected) => {
    expect(pluralDays(n, 'en')).toBe(expected);
  });
});

describe('formatRange', () => {
  it('formats a same-month range', () => {
    expect(formatRange('2026-02-17', '2026-02-19', 'uk')).toBe('17–19 лютого 2026');
    expect(formatRange('2026-02-17', '2026-02-19', 'en')).toBe('17–19 February 2026');
  });

  it('formats a range across months', () => {
    expect(formatRange('2027-01-30', '2027-02-01', 'uk')).toBe('30 січня – 1 лютого 2027');
  });
});
