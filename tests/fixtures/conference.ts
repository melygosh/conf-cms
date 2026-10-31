import type { Conference } from '../../src/content/schema';

const l = (uk: string, en: string) => ({ uk, en });

/** Raw YAML-like input (dates as strings), valid against conferenceSchema. */
export function rawConference(): Record<string, unknown> {
  return {
    year: 2026,
    edition: 16,
    title: l('Інтегроване стратегічне управління', 'Integrated Strategic Management'),
    dates: { start: '2026-02-17', end: '2026-02-19' },
    venue: {
      place: l('Славсько', 'Slavsko'),
      description: l('Карпати', 'Carpathians'),
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=x',
      mapLink: 'https://maps.app.goo.gl/xyA32VJdHeu1uJ4a6',
    },
    links: {
      registration: l('https://example.com/uk', 'https://example.com/en'),
      infoLetter: l('https://example.com/uk.pdf', 'https://example.com/en.pdf'),
    },
    organizers: l('МОН України', 'Ministry of Education'),
    aim: l('Мета', 'Aim'),
    sections: [{ name: l('Секція 1', 'Section 1'), items: { uk: ['a'], en: ['a'] } }],
    languages: l('Українська', 'Ukrainian'),
    publication: { summary: l('s', 's'), rules: l('r', 'r'), formatting: l('f', 'f') },
    deadlines: [
      { date: '2026-01-25', title: l('Тези', 'Abstracts'), countdown: true },
      { date: '2026-02-16', title: l('Статті', 'Papers') },
    ],
    cost: {
      headers: { uk: ['Умови', 'Україна', 'Інші'], en: ['Terms', 'Ukraine', 'Abroad'] },
      rows: [{ label: l('Публікація', 'Publication'), ukraine: l('150 грн', '150 UAH'), abroad: l('5 USD', '5 EUR') }],
      notes: l('n', 'n'),
      payment: l('Реквізити', 'Contact the Program Committee'),
    },
    authors: [{ title: l('Загальні положення', 'General'), body: l('b', 'b') }],
    committees: l('Комітет', 'Committee'),
  };
}

export async function conference(): Promise<Conference> {
  const { conferenceSchema } = await import('../../src/content/schema');
  return conferenceSchema.parse(rawConference());
}
