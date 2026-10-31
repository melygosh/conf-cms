// The page is built once, but read for months: recompute the date-dependent
// parts on the visitor's date. Markup contract: src/components/sections/Dates.astro.
import type { Lang } from '../content/schema';
import { daysUntil, deadlineState, pluralDays } from '../lib/dates';

export function applyDateStates(root: ParentNode, now: Date): void {
  root.querySelectorAll<HTMLElement>('[data-deadline]').forEach((el) => {
    el.dataset.state = deadlineState(el.dataset.deadline!, now);
  });

  root.querySelectorAll<HTMLElement>('[data-countdown]').forEach((el) => {
    const iso = el.dataset.countdown!;
    const past = deadlineState(iso, now) === 'past';
    el.hidden = past;
    const days = el.querySelector('strong');
    if (days && !past) days.textContent = pluralDays(daysUntil(iso, now), el.dataset.lang as Lang);
  });

  root.querySelectorAll<HTMLElement>('[data-finished-after]').forEach((el) => {
    el.hidden = deadlineState(el.dataset.finishedAfter!, now) !== 'past';
  });
}

if (typeof document !== 'undefined') applyDateStates(document, new Date());
