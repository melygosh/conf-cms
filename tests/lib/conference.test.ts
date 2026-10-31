import { describe, expect, it } from 'vitest';
import { assertConferenceFiles, countdownTarget, isFinished, pickCurrent, toRoman } from '../../src/lib/conference';
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
