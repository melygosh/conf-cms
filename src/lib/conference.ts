import type { Conference } from '../content/schema';
import { deadlineState, toIso } from './dates';

/** The current conference is the one with the latest year. */
export function pickCurrent(list: Conference[]): Conference {
  if (list.length === 0) throw new Error('No conference data in src/content/conferences');
  return list.reduce((a, b) => (b.year > a.year ? b : a));
}

const ROMAN: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

export function toRoman(n: number): string {
  let out = '';
  for (const [value, numeral] of ROMAN) {
    while (n >= value) {
      out += numeral;
      n -= value;
    }
  }
  return out;
}

type Deadline = Conference['deadlines'][number];

/** The deadline the "N days left" line counts down to, or null when none is left. */
export function countdownTarget(conf: Conference, now: Date): { iso: string; title: Deadline['title'] } | null {
  const next = conf.deadlines.find((d) => d.countdown && deadlineState(toIso(d.date), now) !== 'past');
  return next ? { iso: toIso(next.date), title: next.title } : null;
}

export function isFinished(conf: Conference, now: Date): boolean {
  return deadlineState(toIso(conf.dates.end), now) === 'past';
}
