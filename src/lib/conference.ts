import type { Conference, Lang } from '../content/schema';
import { deadlineState, toIso } from './dates';

/**
 * Guards the yearly copy-and-edit workflow: a file copied to 2027.yaml that still says
 * `year: 2026` would otherwise build green and keep showing the old conference.
 */
export function assertConferenceFiles(entries: { id: string; data: Conference }[]): void {
  const seen = new Set<number>();
  for (const { id, data } of entries) {
    if (id !== String(data.year)) {
      throw new Error(`src/content/conferences/${id}.yaml has year: ${data.year}; the file name and year must match`);
    }
    if (seen.has(data.year)) throw new Error(`Two conference files for year ${data.year}`);
    seen.add(data.year);
  }
}

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

/** The day after which registration is closed, or null when no deadline closes it. */
export function registrationClose(conf: Conference): string | null {
  const d = conf.deadlines.find((x) => x.registration);
  return d ? toIso(d.date) : null;
}

export function isFinished(conf: Conference, now: Date): boolean {
  return deadlineState(toIso(conf.dates.end), now) === 'past';
}

/** The info letter: the year's own link if it has one, otherwise the PDF `npm run letter` generates. */
export function letterHref(c: Conference, lang: Lang): string {
  return c.links.infoLetter?.[lang] ?? `/letters/info-letter-${c.year}-${lang}.pdf`;
}

/** The key dates one language shows, one entry per day (several events often share a deadline day). */
export function deadlinesByDay(c: Conference, lang: Lang): { iso: string; titles: string[] }[] {
  const days: { iso: string; titles: string[] }[] = [];
  for (const d of c.deadlines) {
    const title = d.title[lang];
    if (!title) continue;
    const iso = toIso(d.date);
    const day = days.find((x) => x.iso === iso);
    if (day) day.titles.push(title);
    else days.push({ iso, titles: [title] });
  }
  return days;
}
