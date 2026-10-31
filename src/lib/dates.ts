import type { Lang } from '../content/schema';

const TIME_ZONE = 'Europe/Kyiv';
const DAY_MS = 86_400_000;
const LOCALE: Record<Lang, string> = { uk: 'uk-UA', en: 'en-GB' };

const pad = (n: number) => String(n).padStart(2, '0');

/** Calendar date of a UTC-midnight Date (as YAML dates are parsed). */
export function toIso(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Today's calendar date in Kyiv. */
export function kyivToday(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

const isoToUtc = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};

/** Calendar days from today (Kyiv) to `iso`; negative once it has passed. */
export function daysUntil(iso: string, now: Date): number {
  return Math.round((isoToUtc(iso) - isoToUtc(kyivToday(now))) / DAY_MS);
}

export type DeadlineState = 'upcoming' | 'today' | 'past';

export function deadlineState(iso: string, now: Date): DeadlineState {
  const days = daysUntil(iso, now);
  return days > 0 ? 'upcoming' : days === 0 ? 'today' : 'past';
}

const DAY_WORDS: Record<Lang, Partial<Record<Intl.LDMLPluralRule, string>> & { other: string }> = {
  uk: { one: 'день', few: 'дні', many: 'днів', other: 'дня' },
  en: { one: 'day', other: 'days' },
};

export function pluralDays(n: number, lang: Lang): string {
  const rule = new Intl.PluralRules(LOCALE[lang]).select(n);
  return `${n} ${DAY_WORDS[lang][rule] ?? DAY_WORDS[lang].other}`;
}

/** "25 січня" / "25 January" (no year). */
function dayMonth(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALE[lang], { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(
    new Date(isoToUtc(iso)),
  );
}

const yearOf = (iso: string) => iso.slice(0, 4);
const monthOf = (iso: string) => iso.slice(0, 7);

export function formatDate(iso: string, lang: Lang): string {
  return `${dayMonth(iso, lang)} ${yearOf(iso)}`;
}

export function formatRange(startIso: string, endIso: string, lang: Lang): string {
  if (startIso === endIso) return formatDate(startIso, lang);
  if (yearOf(startIso) !== yearOf(endIso)) return `${formatDate(startIso, lang)} – ${formatDate(endIso, lang)}`;
  if (monthOf(startIso) === monthOf(endIso)) {
    return `${Number(startIso.slice(8))}–${formatDate(endIso, lang)}`;
  }
  return `${dayMonth(startIso, lang)} – ${formatDate(endIso, lang)}`;
}
