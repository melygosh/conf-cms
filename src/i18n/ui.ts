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
  proceedings: string;
  photos: string;
  presentations: string;
  menu: string;
  people: (n: number) => string;
  langSwitchLabel: string;
  langSwitchTitle: string;
  footer: string;
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
    proceedings: 'Збірник тез',
    photos: 'Фото',
    presentations: 'Презентації',
    menu: 'Меню',
    people: (n) => `${n} ${ukPlural(n, 'особа', 'особи', 'осіб')}`,
    langSwitchLabel: 'EN',
    langSwitchTitle: 'English version',
    footer: 'Designed and developed by Strategic Management Department',
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
    proceedings: 'Book of abstracts',
    photos: 'Photos',
    presentations: 'Presentations',
    menu: 'Menu',
    people: (n) => `${n} ${n === 1 ? 'member' : 'members'}`,
    langSwitchLabel: 'UA',
    langSwitchTitle: 'Українська версія',
    footer: 'Designed and developed by Strategic Management Department',
  },
};

export const homeHref: Record<Lang, string> = { uk: '/', en: '/en/' };
export const otherLang = (lang: Lang): Lang => (lang === 'uk' ? 'en' : 'uk');
