import type { Conference, Lang } from '../content/schema';

// Ordinals for the cover line "Шістнадцята міжнародна…" / "Sixteenth International…".
// Ukrainian forms are feminine (конференція); compound numbers inflect only the last word.
const UK_UNITS = ['', 'перша', 'друга', 'третя', 'четверта', "п'ята", 'шоста', 'сьома', 'восьма', "дев'ята"];
const UK_TEENS = [
  'десята', 'одинадцята', 'дванадцята', 'тринадцята', 'чотирнадцята',
  "п'ятнадцята", 'шістнадцята', 'сімнадцята', 'вісімнадцята', "дев'ятнадцята",
];
const UK_TENS_ORDINAL = ['', '', 'двадцята', 'тридцята', 'сорокова'];
const UK_TENS_CARDINAL = ['', '', 'двадцять', 'тридцять', 'сорок'];

const EN_UNITS = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth'];
const EN_TEENS = [
  'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth',
  'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth',
];
const EN_TENS_ORDINAL = ['', '', 'twentieth', 'thirtieth', 'fortieth'];
const EN_TENS_CARDINAL = ['', '', 'twenty', 'thirty', 'forty'];

/** "шістнадцята" / "sixteenth", lower case, for 1–49. */
export function ordinalWord(n: number, lang: Lang): string {
  if (!Number.isInteger(n) || n < 1 || n > 49) throw new Error(`No ordinal word for ${n}`);
  const [units, teens, tensOrdinal, tensCardinal, join] =
    lang === 'uk'
      ? [UK_UNITS, UK_TEENS, UK_TENS_ORDINAL, UK_TENS_CARDINAL, ' ']
      : [EN_UNITS, EN_TEENS, EN_TENS_ORDINAL, EN_TENS_CARDINAL, '-'];
  if (n < 10) return units[n];
  if (n < 20) return teens[n - 10];
  const tens = Math.floor(n / 10);
  const unit = n % 10;
  return unit === 0 ? tensOrdinal[tens] : `${tensCardinal[tens]}${join}${units[unit]}`;
}

type Deadline = Conference['deadlines'][number];
export type DeadlineGroup = { group: Deadline['group']; items: Deadline[] };

/** The deadlines one language shows, grouped (participation / papers) in order of first appearance. */
export function groupDeadlines(c: Conference, lang: Lang): DeadlineGroup[] {
  const groups: DeadlineGroup[] = [];
  for (const d of c.deadlines) {
    if (!d.title[lang]) continue;
    const g = groups.find((x) => x.group === d.group);
    if (g) g.items.push(d);
    else groups.push({ group: d.group, items: [d] });
  }
  return groups;
}

export type Committee = { title: string; groups: { role: string; members: string[] }[] };

/**
 * Committees Markdown: "### Committee", "#### Role", then one "**Name**, titles…" paragraph per member.
 * Members before the first role heading go into a group with an empty role.
 */
export function parseCommittees(markdown: string): Committee[] {
  const committees: Committee[] = [];
  for (const block of markdown.split(/^### /m).filter((b) => b.trim())) {
    const [title, ...rest] = block.split('\n');
    const committee: Committee = { title: title.trim(), groups: [] };
    let group: Committee['groups'][number] | undefined;
    for (const para of rest.join('\n').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)) {
      if (para.startsWith('#### ')) {
        group = { role: para.slice(5).trim(), members: [] };
        committee.groups.push(group);
      } else {
        if (!group) {
          group = { role: '', members: [] };
          committee.groups.push(group);
        }
        group.members.push(para);
      }
    }
    committees.push(committee);
  }
  return committees;
}

/** 1-based numbers of the pages whose content is taller than the page (1px of rounding allowed). */
export function findOverflow(pages: { scrollHeight: number; clientHeight: number }[]): number[] {
  return pages.flatMap((p, i) => (p.scrollHeight > p.clientHeight + 1 ? [i + 1] : []));
}
