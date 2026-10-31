// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { applyDateStates } from '../../src/scripts/date-states';

// Markup as Dates.astro renders it when built on 2025-11-15 (contract shared with that component).
const BUILT_IN_NOVEMBER = `
  <table><tbody>
    <tr data-deadline="2026-01-25" data-state="upcoming"><th>Тези</th></tr>
    <tr data-deadline="2026-02-16" data-state="upcoming"><th>Статті</th></tr>
    <tr data-deadline="2026-02-19" data-state="upcoming"><th>Конференція</th></tr>
  </tbody></table>
  <p data-countdown="2026-01-25" data-lang="uk">До кінця прийому тез: <strong>71 день</strong></p>
  <p data-finished-after="2026-02-19" hidden>Конференція відбулася</p>
`;

const state = (iso: string) => document.querySelector(`[data-deadline="${iso}"]`)!.getAttribute('data-state');
const countdown = () => document.querySelector<HTMLElement>('[data-countdown]')!;
const finished = () => document.querySelector<HTMLElement>('[data-finished-after]')!;

describe('applyDateStates', () => {
  beforeEach(() => {
    document.body.innerHTML = BUILT_IN_NOVEMBER;
  });

  it('recounts days on the visitor date, not the build date', () => {
    applyDateStates(document, new Date('2026-01-20T10:00:00Z'));
    expect(countdown().textContent?.replace(/\s+/g, ' ').trim()).toBe('До кінця прийому тез: 5 днів');
    expect(countdown().hidden).toBe(false);
    expect(state('2026-01-25')).toBe('upcoming');
  });

  it('shows the deadline day in Kyiv as today with 0 days', () => {
    applyDateStates(document, new Date('2026-01-24T22:30:00Z'));
    expect(state('2026-01-25')).toBe('today');
    expect(countdown().textContent).toContain('0 днів');
  });

  it('hides the countdown and shows "finished" after the conference, with no negative numbers', () => {
    applyDateStates(document, new Date('2026-02-20T10:00:00Z'));
    expect(countdown().hidden).toBe(true);
    expect(finished().hidden).toBe(false);
    for (const iso of ['2026-01-25', '2026-02-16', '2026-02-19']) expect(state(iso)).toBe('past');
    expect(document.body.textContent).not.toMatch(/-\d/);
  });
});
