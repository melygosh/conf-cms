import type { Conference } from '../../src/content/schema';

const l = (uk: string, en: string) => ({ uk, en });

/** Raw YAML-like input (dates as strings), valid against conferenceSchema. */
export function rawConference(): Record<string, unknown> {
  return {
    year: 2026,
    edition: 16,
    title: l('Інтегроване стратегічне управління', 'Integrated Strategic Management'),
    dates: { start: '2026-02-17', end: '2026-02-19' },
    invitation: l('Запрошуємо', 'We invite you'),
    venue: {
      place: l('Славсько', 'Slavsko'),
      description: l('Карпати', 'Carpathians'),
      name: l('Табір «Політехнік-2»', 'Camp "Polytechnic-2"'),
      address: l('смт Славсько, вул. І. Франка, 49', 'Slavsko, 49 I. Franka St.'),
      url: l('https://lpnu.ua/politekhnik-2', 'https://lpnu.ua/en/polytechnic-2-recreational-camp'),
      director: l('Білодід В.П.', 'V. Bilodid'),
      format: l('комбінований формат', 'hybrid format'),
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=x',
      mapLink: 'https://maps.app.goo.gl/xyA32VJdHeu1uJ4a6',
    },
    links: {
      registration: l('https://example.com/uk', 'https://example.com/en'),
    },
    organizers: [{ name: l('МОН України', 'Ministry of Education'), href: 'https://mon.gov.ua' }],
    aim: l('Мета', 'Aim'),
    sections: [{ name: l('Секція 1', 'Section 1'), items: { uk: ['a'], en: ['a'] } }],
    languages: l('Українська', 'Ukrainian'),
    publication: {
      summary: l('s', 's'),
      rules: l('r', 'r'),
      formatting: l('f', 'f'),
      articles: {
        journalUrl: 'http://pm.khpi.edu.ua/',
        templateUrl: l('https://example.com/template-uk', 'https://example.com/template-en'),
        badges: { uk: ['DOI'], en: ['DOI'] },
        review: l('Рецензування', 'Review'),
        requirements: l('Вимоги', 'Requirements'),
      },
    },
    submission: {
      uk: [{ title: 'Форма', text: 'Заявка й тези' }],
      en: [{ title: 'Form', text: 'Application and abstract' }],
    },
    deadlines: [
      { date: '2026-01-20', title: l('Заявка', 'Registration'), registration: true },
      { date: '2026-01-25', title: l('Тези', 'Abstracts'), countdown: true },
      { date: '2026-02-16', title: l('Статті', 'Papers'), group: 'papers' },
    ],
    cost: {
      uk: { items: [{ label: 'Оргвнесок', amount: '300 грн', note: 'Входить' }], payment: 'Реквізити' },
      en: { items: [{ label: 'Publication', amount: '5 EUR', unit: 'per page' }], payment: 'Contact the Program Committee' },
    },
    authors: [{ title: l('Загальні положення', 'General'), body: l('b', 'b') }],
    committees: l('Комітет', 'Committee'),
  };
}

export async function conference(): Promise<Conference> {
  const { conferenceSchema } = await import('../../src/content/schema');
  return conferenceSchema.parse(rawConference());
}
