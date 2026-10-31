import type { Lang } from '../content/schema';

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
    committees: string;
    registration: string;
    archive: string;
    partners: string;
    contacts: string;
  };
  register: string;
  registerLong: string;
  infoLetter: string;
  editionLine: (roman: string) => string;
  finished: string;
  countdownPrefix: string;
  conferenceDates: string;
  openMap: string;
  photos: string;
  presentations: string;
  menu: string;
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
      authors: 'Авторам публікацій (Вісник НТУ «ХПІ»)',
      committees: 'Комітети',
      registration: 'Реєстрація',
      archive: 'Архів',
      partners: 'Партнери',
      contacts: 'Контакти',
    },
    register: 'Реєстрація',
    registerLong: 'Зареєструватися на конференцію',
    infoLetter: 'Інформаційний лист',
    editionLine: (roman) => `${roman} міжнародна науково-практична конференція`,
    finished: 'Конференція відбулася',
    countdownPrefix: 'До кінця прийому тез:',
    conferenceDates: 'Конференція',
    openMap: 'Відкрити на мапі',
    photos: 'Фото',
    presentations: 'Презентації',
    menu: 'Меню',
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
      authors: 'For authors (Bulletin of the NTU "KhPI")',
      committees: 'Committees',
      registration: 'Registration',
      archive: 'Archive',
      partners: 'Partners',
      contacts: 'Contacts',
    },
    register: 'Registration',
    registerLong: 'Register for the conference',
    infoLetter: 'Call for Papers',
    editionLine: (roman) => `${roman} International Scientific and Practical Conference`,
    finished: 'The conference has taken place',
    countdownPrefix: 'Days left to submit abstracts:',
    conferenceDates: 'Conference',
    openMap: 'Open in Google Maps',
    photos: 'Photos',
    presentations: 'Presentations',
    menu: 'Menu',
    langSwitchLabel: 'UA',
    langSwitchTitle: 'Українська версія',
    footer: 'Designed and developed by Strategic Management Department',
  },
};

export const homeHref: Record<Lang, string> = { uk: '/', en: '/en/' };
export const otherLang = (lang: Lang): Lang => (lang === 'uk' ? 'en' : 'uk');
