import type { Lang } from '../content/schema';

const ukPlural = (n: number, one: string, few: string, many: string) => {
  const rule = new Intl.PluralRules('uk-UA').select(n);
  return rule === 'one' ? one : rule === 'few' ? few : many;
};

export interface UiStrings {
  nav: {
    about: string;
    dates: string;
    cost: string;
    authors: string;
    committees: string;
    archive: string;
    contacts: string;
  };
  sections: {
    about: string;
    organizers: string;
    venue: string;
    topics: string;
    aim: string;
    section: (n: number) => string;
    languages: string;
    publication: string;
    dates: string;
    cost: string;
    payment: string;
    authors: string;
    authorsNote: string;
    submission: string;
    committees: string;
    registration: string;
    archive: string;
    partners: string;
    contacts: string;
  };
  register: string;
  registerLong: string;
  submitAbstract: string;
  registrationClosed: string;
  infoLetter: string;
  editionLine: (roman: string) => string;
  finished: string;
  countdownPrefix: string;
  conferenceDates: string;
  openMap: string;
  venueDirector: string;
  proceedings: string;
  photos: string;
  presentations: string;
  menu: string;
  people: (n: number) => string;
  langSwitchLabel: string;
  langSwitchTitle: string;
  footer: string;
  letter: {
    title: string;
    editionWords: (word: string) => string;
    pages: { about: string; topics: string; participation: string; publications: string; committees: string; contacts: string };
    titles: { about: string; topics: string; participation: string; publications: string; committees: string; contacts: string };
    factDeadline: string;
    factDeadlineNote: string;
    factFee: string;
    factLanguages: string;
    groups: { participation: string; papers: string };
    format: string;
    abstracts: string;
    papers: string;
    template: string;
    registerKicker: string;
    registerCta: string;
    until: string;
    site: string;
  };
}

export const ui: Record<Lang, UiStrings> = {
  uk: {
    nav: {
      about: 'Про конференцію',
      dates: 'Важливі дати',
      cost: 'Вартість',
      authors: 'Авторам',
      committees: 'Комітети',
      archive: 'Архів',
      contacts: 'Контакти',
    },
    sections: {
      about: 'Про конференцію',
      organizers: 'Організатори',
      venue: 'Місце проведення',
      topics: 'Тематика конференції',
      aim: 'Мета конференції',
      section: (n) => `Секція ${n}`,
      languages: 'Мови конференції',
      publication: 'Публікація матеріалів',
      dates: 'Важливі дати',
      cost: 'Вартість',
      payment: 'Оплата',
      authors: 'Авторам публікацій',
      authorsNote: 'Вісник НТУ «ХПІ»',
      submission: 'До програмного комітету подаються',
      committees: 'Комітети',
      registration: 'Реєстрація',
      archive: 'Архів',
      partners: 'Партнери',
      contacts: 'Контакти',
    },
    register: 'Реєстрація та подання тез',
    registerLong: 'Зареєструватися на конференцію',
    submitAbstract: 'Подати тези через форму реєстрації',
    registrationClosed: 'Реєстрацію завершено',
    infoLetter: 'Інформаційний лист',
    editionLine: (roman) => `${roman} міжнародна науково-практична конференція`,
    finished: 'Конференція відбулася',
    countdownPrefix: 'До кінця прийому тез:',
    conferenceDates: 'Конференція',
    openMap: 'Відкрити на мапі',
    venueDirector: 'Директор',
    proceedings: 'Збірник тез',
    photos: 'Фото',
    presentations: 'Презентації',
    menu: 'Меню',
    people: (n) => `${n} ${ukPlural(n, 'особа', 'особи', 'осіб')}`,
    langSwitchLabel: 'EN',
    langSwitchTitle: 'English version',
    footer: 'Designed and developed by Strategic Management Department',
    letter: {
      title: 'Інформаційний лист',
      editionWords: (word) => `${word} міжнародна науково-практична конференція`,
      pages: {
        about: 'Про конференцію',
        topics: 'Тематика',
        participation: 'Участь',
        publications: 'Публікації',
        committees: 'Комітети',
        contacts: 'Контакти й реєстрація',
      },
      titles: {
        about: 'Шановні колеги!',
        topics: 'Секції конференції',
        participation: 'Важливі дати й умови',
        publications: 'Тези й статті',
        committees: 'Комітети конференції',
        contacts: 'Чекаємо на вас!',
      },
      factDeadline: 'Заявка й тези до',
      factDeadlineNote: 'через форму реєстрації',
      factFee: 'Оргвнесок',
      factLanguages: 'Робочі мови',
      groups: { participation: 'Участь', papers: 'Статті' },
      format: 'Формат',
      abstracts: 'Тези',
      papers: 'Статті',
      template: 'Шаблон статті',
      registerKicker: 'Заявка на участь',
      registerCta: 'Заповнити реєстраційну форму',
      until: 'до',
      site: 'imconf.com.ua',
    },
  },
  en: {
    nav: {
      about: 'About',
      dates: 'Important dates',
      cost: 'Price',
      authors: 'For authors',
      committees: 'Committees',
      archive: 'Archive',
      contacts: 'Contacts',
    },
    sections: {
      about: 'About the conference',
      organizers: 'Conference organizers',
      venue: 'Place',
      topics: 'Conference topics',
      aim: 'The aim of the conference',
      section: (n) => `Section ${n}`,
      languages: 'Conference languages',
      publication: 'Publication of materials',
      dates: 'Important dates',
      cost: 'Price',
      payment: 'Payment',
      authors: 'For authors',
      authorsNote: 'Bulletin of the NTU "KhPI"',
      submission: 'To Program Committee should be submitted',
      committees: 'Committees',
      registration: 'Registration',
      archive: 'Archive',
      partners: 'Partners',
      contacts: 'Contacts',
    },
    register: 'Register & submit abstracts',
    registerLong: 'Register for the conference',
    submitAbstract: 'Submit abstracts via the registration form',
    registrationClosed: 'Registration closed',
    infoLetter: 'Call for Papers',
    editionLine: (roman) => `${roman} International Scientific and Practical Conference`,
    finished: 'The conference has taken place',
    countdownPrefix: 'Days left to submit abstracts:',
    conferenceDates: 'Conference',
    openMap: 'Open in Google Maps',
    venueDirector: 'Camp Director',
    proceedings: 'Abstracts',
    photos: 'Photos',
    presentations: 'Presentations',
    menu: 'Menu',
    people: (n) => `${n} ${n === 1 ? 'member' : 'members'}`,
    langSwitchLabel: 'UA',
    langSwitchTitle: 'Українська версія',
    footer: 'Designed and developed by Strategic Management Department',
    letter: {
      title: 'Call for Papers',
      editionWords: (word) => `${word} International Scientific and Practical Conference`,
      pages: {
        about: 'About the conference',
        topics: 'Topics',
        participation: 'Participation',
        publications: 'Publications',
        committees: 'Committees',
        contacts: 'Contacts and registration',
      },
      titles: {
        about: 'Dear colleagues!',
        topics: 'Conference sections',
        participation: 'Key dates and terms',
        publications: 'Abstracts and papers',
        committees: 'Conference committees',
        contacts: 'We look forward to seeing you!',
      },
      factDeadline: 'Registration and abstracts by',
      factDeadlineNote: 'via the registration form',
      factFee: 'Participation',
      factLanguages: 'Languages',
      groups: { participation: 'Participation', papers: 'Papers' },
      format: 'Format',
      abstracts: 'Abstracts',
      papers: 'Papers',
      template: 'Paper template',
      registerKicker: 'Registration',
      registerCta: 'Complete the registration form',
      until: 'by',
      site: 'imconf.com.ua',
    },
  },
};

export const homeHref: Record<Lang, string> = { uk: '/', en: '/en/' };
export const otherLang = (lang: Lang): Lang => (lang === 'uk' ? 'en' : 'uk');
