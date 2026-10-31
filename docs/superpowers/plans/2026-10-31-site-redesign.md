# Редизайн imconf.com.ua: план реалізації

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Замінити двомовний HTML-сайт конференції на статичний Astro-сайт, де весь контент року лежить в одному YAML-файлі (UA та EN поруч), валідується під час build і рендериться в `/` та `/en/` у дизайні «академічний» (варіант B).

**Architecture:** Astro content collections читають YAML (`src/content/`), zod-схема валідує його під час build. Чисті функції дат і вибору поточного року лежать у `src/lib/` і використовуються і на build, і в маленькому клієнтському скрипті, який перераховує «N днів» і стан «минуло» на дату відвідувача. Компоненти секцій у `src/components/` отримують `lang` і дані поточної конференції.

**Tech Stack:** Astro (поточна стабільна, на момент написання 7.x), TypeScript, zod (з `astro/zod`), `marked` для Markdown-полів, `@fontsource` для шрифтів, Vitest (+ `happy-dom` для DOM-тесту), `sharp` для скрипта логотипа.

**Spec:** `docs/superpowers/specs/2026-10-31-site-redesign-design.md`

## Global Constraints

- Гілка `redesign/astro`. У `master` нічого не зливається до перенесення домену (див. Task 7).
- Жодного серверного коду, бекенду, `fetch` контенту в браузері. Без Bootstrap і jQuery.
- Мови: `uk` (URL `/`, `<html lang="uk">`) та `en` (URL `/en/`, `<html lang="en">`). Перемикач мови в шапці веде на ту саму секцію іншої мови.
- Кожне текстове поле контенту має значення для обох мов; build падає, якщо одного бракує.
- Палітра: основний синій `#1d3c8f`, червоний акцент `#c0302b` (лише дати самої конференції та кнопка реєстрації), сірий для другорядного тексту. Бірюзового `#008080` немає.
- Заголовки serif (Source Serif 4), текст sans (Manrope), обидва з кирилицею.
- Логотип: `public/images/logo-base.png` (оригінал без року) + SVG `<text>` року: `x=165.5 y=96.5`, `font-size=22`, `textLength=40`, `lengthAdjust="spacingAndGlyphs"`, `font-family="'Arial Narrow', 'Roboto Condensed', Arial, sans-serif"`, `font-stretch="condensed"`, `font-style="italic"`, `fill="#fdf1f1"`, `stroke="#c0302b"`, `stroke-width=1.2`, viewBox `0 0 326 161`. У шапці ширина логотипа ≤ 160 px.
- Мапа місця проведення (iframe): `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d99897.5166815242!2d23.46006058048362!3d48.856157216603066!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47398b454daeba4b%3A0x8ce8ecf3a65b8b10!2z0J3QsNCy0YfQsNC70YzQvdC-LdC-0LfQtNC-0YDQvtCy0YfQuNC5INGC0LDQsdGW0YAg0KPQvdGW0LLQtdGA0YHQuNGC0LXRgtGDIMKr0J_QvtC70ZbRgtC10YXQvdGW0LotMsK7!5e0!3m2!1sen!2sua!4v1574459297253!5m2!1sen!2sua`
- Мапа ХПІ (iframe у «Контактах»): `https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d10258.636093345713!2d36.2498081!3d49.9990019!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x4847f00cec333b6!2z0J3QsNGG0LjQvtC90LDQu9GM0L3Ri9C5INGC0LXRhdC90LjRh9C10YHQutC40Lkg0YPQvdC40LLQtdGA0YHQuNGC0LXRgiAi0KXQsNGA0YzQutC-0LLRgdC60LjQuSDQv9C-0LvQuNGC0LXRhdC90LjRh9C10YHQutC40Lkg0LjQvdGB0YLQuNGC0YPRgiI!5e0!3m2!1sru!2sua!4v1509992454938`
- Дати рахуються в часовому поясі `Europe/Kyiv`. День дедлайну ще не «минув».
- Render Static Site: build `npm ci && npm run build`, publish directory `dist`.
- Старі адреси `/index_eng.html` та `/?lang=en` ведуть на `/en/`.

## Review Focus

- Сайт задеплоєно в листопаді, відвідувач відкриває його в січні: «N днів» і стан «минуло» мають рахуватися на дату відвідувача, а не дату build → тест `applyDateStates` з `now`, відмінним від build (Task 6).
- Відвідувач у Києві о 00:30 у день дедлайну (у UTC ще попередній день): дедлайн показується як «сьогодні», 0 днів, не «минуло» → тест `kyivToday` / `deadlineState` (Task 2).
- Українські форми множини: 1 день, 2 дні, 5 днів, 11 днів, 21 день, 22 дні, 25 днів → тест `pluralDays` (Task 2).
- У YAML пропущено EN-переклад або дата написана як «25 січня» замість `2026-01-25`: build падає з повідомленням, що називає поле → тест схеми (Task 2).
- Конференція вже відбулася (стан сайту з лютого по листопад): жодних від'ємних чисел, рядок «до кінця прийому тез» схований, видно «Конференція відбулася» → тести `countdownTarget` (Task 2) і `applyDateStates` (Task 6).

---

### Task 1: Гілка, каркас Astro, прибирання старого коду

**Files:**
- Delete: `app/`, `config/`, `db/`, `test/`, `Procfile`, `server.js`, `public/index.html`, `public/index_.html`, `public/index_eng.html`, `public/manage.html`, `public/document_is_not_ready.html`, `public/javascripts/`, `public/stylesheets/`, `public/assets/js/`, `public/assets/css/`, `public/images/compound.png`, `public/images/glyphicons-halflings*.png`
- Keep: `public/favicon.ico`, `public/images/logo_2026.png` (джерело для Task 3), `public/assets/images/partner/partner-{1,2,3,4,5,6,9}.*`, `public/assets/images/microsoft-office-power-point-3.png`, `public/assets/images/My_pictures_3_ico.ico`. Решту `public/assets/images/**` видалити (не використовуються новою версією; перевірити `grep` по `src/` наприкінці Task 5).
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.node-version`, `src/pages/index.astro` (тимчасова заглушка), `tests/build/smoke.test.ts`
- Modify: `.gitignore` (додати `.superpowers/`, `dist/`, `.astro/`)

**Interfaces:**
- Produces: npm-скрипти `dev`, `build`, `preview`, `check` (`astro check`), `test` (`vitest run --exclude tests/build/**`), `test:build` (`astro build && vitest run tests/build`). `vitest.config.ts` використовує `getViteConfig` з `astro/config`. `astro.config.mjs`: `site: 'https://imconf.com.ua'`, `trailingSlash: 'ignore'`, `build.format: 'directory'`.

- [ ] **Step 1:** `git switch -c redesign/astro` від `master`. Незакомічені `docs/superpowers/specs/…` і `docs/superpowers/plans/…` переходять у гілку разом із робочим деревом і комітяться в Step 7. `stash@{0}` не чіпати, він потрібен у Task 3.
- [ ] **Step 2:** Видалити файли зі списку Delete. Ініціалізувати Astro вручну (не через шаблон з прикладами): `npm i astro`, `npm i -D typescript @astrojs/check vitest happy-dom yaml sharp`. Видалити залежність `express`. `.node-version` = мінімальна версія Node з `engines` встановленого `astro` (подивитися в `node_modules/astro/package.json`).
- [ ] **Step 3: Write the failing test** `tests/build/smoke.test.ts`: `dist/index.html` існує і містить `<html lang="uk"`.
- [ ] **Step 4:** `npm run test:build` → FAIL (немає `dist/index.html` або немає `lang`).
- [ ] **Step 5:** Заглушка `src/pages/index.astro` з `<html lang="uk">` і `<title>imconf</title>`.
- [ ] **Step 6:** `npm run test:build` → PASS; `npm run check` → 0 errors.
- [ ] **Step 7: Commit** `chore: replace CompoundJS app with Astro scaffold` (разом зі spec і планом у `docs/superpowers/`)

---

### Task 2: Схема контенту і логіка дат

**Files:**
- Create: `src/content/schema.ts`, `src/content.config.ts`, `src/lib/dates.ts`, `src/lib/conference.ts`, `src/lib/markdown.ts`
- Test: `tests/lib/dates.test.ts`, `tests/lib/conference.test.ts`, `tests/content/schema.test.ts`

**Interfaces:**
- Produces (`src/content/schema.ts`, без імпортів з `astro:content`, щоб тестувався в Vitest):

```ts
import { z } from 'astro/zod';
export type Lang = 'uk' | 'en';
export const LANGS: Lang[] = ['uk', 'en'];
export const localized = <T extends z.ZodTypeAny>(t: T) => z.object({ uk: t, en: t }).strict();
const isoDate = z.coerce.date(); // YAML `2026-01-25` → Date (UTC midnight); "25 січня" → помилка

export const conferenceSchema = z.object({
  year: z.number().int(),
  edition: z.number().int().positive(),            // 16 → «XVI»
  title: localized(z.string()),
  dates: z.object({ start: isoDate, end: isoDate }),
  venue: z.object({ description: localized(z.string()), mapEmbedUrl: z.string().url(), mapLink: z.string().url() }),
  links: z.object({ registration: localized(z.string().url()), infoLetter: localized(z.string().url()) }),
  organizers: localized(z.string()),                // Markdown
  aim: localized(z.string()),
  sections: z.array(z.object({ name: localized(z.string()), items: localized(z.array(z.string())).optional(), text: localized(z.string()).optional() })),
  languages: localized(z.string()),
  publication: z.object({ summary: localized(z.string()), rules: localized(z.string()), formatting: localized(z.string()) }), // Markdown
  deadlines: z.array(z.object({ date: isoDate, title: localized(z.string()), note: localized(z.string()).optional(), countdown: z.boolean().default(false) })),
  cost: z.object({
    headers: localized(z.array(z.string()).length(3)),
    rows: z.array(z.object({ label: localized(z.string()), ukraine: localized(z.string()), abroad: localized(z.string()) })),
    notes: localized(z.string()),                   // Markdown
    payment: localized(z.string()),                 // Markdown; UA і EN законно різні
  }),
  authors: z.array(z.object({ title: localized(z.string()), body: localized(z.string()) })), // body: Markdown
  committees: localized(z.string()),               // Markdown
}).strict();

export const archiveSchema = z.object({
  year: z.number().int(),
  photos: z.string().url().optional(),
  presentations: z.array(z.object({ author: z.string(), title: z.string(), href: z.string().url() })).default([]),
}).strict();

export const siteSchema = z.object({
  contacts: localized(z.string()),                 // Markdown
  khpiMapEmbedUrl: z.string().url(),
  partners: z.array(z.object({ name: z.string(), href: z.string().url(), image: z.string() })),
}).strict();

export type Conference = z.infer<typeof conferenceSchema>;
export type ArchiveYear = z.infer<typeof archiveSchema>;
export type Site = z.infer<typeof siteSchema>;
```

- Produces (`src/content.config.ts`): колекції `conferences` (glob `*.yaml` у `src/content/conferences`), `archive` (glob `*.yaml` у `src/content/archive`), `site` (file loader `src/content/site.yaml`, один запис з id `site`). API loaders перевірити в документації встановленої версії Astro.
- Produces (`src/lib/dates.ts`, без залежностей від Astro/DOM, імпортується і в клієнтський скрипт):
  - `toIso(d: Date): string` → `'YYYY-MM-DD'` за UTC-компонентами
  - `kyivToday(now: Date): string` → календарна дата в `Europe/Kyiv`, `'YYYY-MM-DD'`
  - `daysUntil(iso: string, now: Date): number` → різниця календарних днів між `kyivToday(now)` і `iso` (від'ємна, якщо минуло)
  - `deadlineState(iso: string, now: Date): 'upcoming' | 'today' | 'past'`
  - `pluralDays(n: number, lang: Lang): string` → `'5 днів'`, `'1 day'`
  - `formatDate(iso: string, lang: Lang): string` → `'25 січня 2026'` / `'25 January 2026'`
  - `formatRange(startIso: string, endIso: string, lang: Lang): string` → `'17–19 лютого 2026'` / `'17–19 February 2026'`; різні місяці → `'30 січня – 1 лютого 2026'`
- Produces (`src/lib/conference.ts`):
  - `pickCurrent(list: Conference[]): Conference` → найбільший `year`; порожній список → `throw`
  - `toRoman(n: number): string`
  - `countdownTarget(conf: Conference, now: Date): { iso: string; title: Conference['deadlines'][number]['title'] } | null` → перший дедлайн з `countdown: true`, стан якого не `past`
  - `isFinished(conf: Conference, now: Date): boolean` → `deadlineState(toIso(conf.dates.end), now) === 'past'`
- Produces (`src/lib/markdown.ts`): `md(src: string): string` (блоковий, `marked` з GFM, сирий HTML у тексті дозволено — напр. `<sup>1</sup>`), `mdInline(src: string): string`.

- [ ] **Step 1: Write the failing tests**
  - `dates.test.ts`:
    - `kyivToday(new Date('2026-01-24T22:30:00Z'))` → `'2026-01-25'`
    - `deadlineState('2026-01-25', new Date('2026-01-24T22:30:00Z'))` → `'today'`; `daysUntil(...)` → `0`
    - `deadlineState('2026-01-25', new Date('2026-01-25T22:30:00Z'))` → `'past'`
    - `daysUntil('2026-02-17', new Date('2025-11-15T10:00:00Z'))` → `94`
    - `pluralDays` для `uk`: 1→`'1 день'`, 2→`'2 дні'`, 5→`'5 днів'`, 11→`'11 днів'`, 21→`'21 день'`, 22→`'22 дні'`, 25→`'25 днів'`; `en`: 1→`'1 day'`, 2→`'2 days'`
    - `formatRange('2026-02-17','2026-02-19','uk')` → `'17–19 лютого 2026'`; `'en'` → `'17–19 February 2026'`; `formatRange('2027-01-30','2027-02-01','uk')` → `'30 січня – 1 лютого 2027'`
  - `conference.test.ts`: `pickCurrent` з роками 2026 і 2027 → 2027; порожній → throws; `toRoman(16)` → `'XVI'`, `toRoman(17)` → `'XVII'`; `countdownTarget` при `now` після всіх дедлайнів → `null`; до дедлайну тез → дедлайн 2026-01-25; `isFinished(conf2026, new Date('2026-02-20T10:00:00Z'))` → `true`, `'2026-02-19T10:00:00Z'` → `false`. Фікстура — мінімальний валідний об'єкт `Conference`, побудований у тесті.
  - `schema.test.ts`: валідна фікстура → `success`; без `title.en` → помилка, `path` містить `['title','en']`; `deadlines[0].date: '25 січня'` → помилка з `path` `['deadlines',0,'date']`; зайве поле на верхньому рівні → помилка (strict).
- [ ] **Step 2:** `npm test` → FAIL (модулів немає).
- [ ] **Step 3:** Реалізувати `schema.ts`, `content.config.ts`, `dates.ts` (`Intl.DateTimeFormat` з `timeZone: 'Europe/Kyiv'`, `Intl.PluralRules`), `conference.ts`, `markdown.ts`.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5: Commit** `feat: content schema and date logic`

---

### Task 3: Перенесення контенту 2026, архіву і логотипа

**Files:**
- Create: `src/content/conferences/2026.yaml`, `src/content/archive/2018.yaml`, `src/content/site.yaml`, `scripts/strip-logo-year.mjs`, `public/images/logo-base.png`
- Delete: `public/images/logo_2026.png` (після генерації `logo-base.png`)
- Test: `tests/content/data.test.ts`

**Interfaces:**
- Consumes: `conferenceSchema`, `archiveSchema`, `siteSchema` (Task 2).
- Produces: `npm run logo` → `node scripts/strip-logo-year.mjs <in.png> <out.png>`.

Джерела контенту: задеплоєні `public/index.html` і `public/index_eng.html` з коміту `d3f7617` (`git show d3f7617:public/index.html`) — це правда. Чернетка в `git show 'stash@{0}^3:public/data/ua.json'` і `...en.json` уже має витягнуті тексти; брати її за основу, звіряючи з HTML. HTML у текстах переводити в Markdown (списки, жирний, посилання); `<sup>` лишати як є.

Правила перенесення зі spec:
- Дати й дедлайни беруться з UA-версії (у EN застарілі): заявки, тези й оплата оргвнеску до `2026-01-25` (`countdown: true` для тез), статті й оплата публікації до `2026-02-16`; конференція `2026-02-17`…`2026-02-19`.
- `cost`: UA — `5 USD per page`, друкований примірник `12 USD`, `payment` — реквізити ФОП Роговий А.І. як у UA-версії; EN — `5 EUR per page`, `12 EUR`, `payment` — текст «contact the Program Committee» з EN-версії (без закоментованого IBAN).
- `links.registration`: UA `https://docs.google.com/forms/d/e/1FAIpQLScH4NPI31ig5qQ7ENp5DNdq-89fkvnv0CWZfmoMKaqpb7DwSA/viewform?usp=header`, EN `https://docs.google.com/forms/d/e/1FAIpQLScEfkk2mFtDALmhYqns17EhPYjNVtGsQJrJtH649Xot4c57jg/viewform?usp=header`.
- `links.infoLetter`: UA `https://drive.google.com/file/d/1YRxQU5y64J0Z_zOHJFTVxMsxUHKY3h4o/view?usp=sharing`, EN `https://drive.google.com/file/d/1ElIhfmjbDcbgkylnpDjZhMhthZdkqVOa/view?usp=sharing`.
- `venue.mapEmbedUrl` — URL мапи місця проведення з Global Constraints; `venue.mapLink` — `https://maps.app.goo.gl/xyA32VJdHeu1uJ4a6`.
- `site.khpiMapEmbedUrl` — URL мапи ХПІ з Global Constraints.
- `site.partners` (порядок як на сайті): upma.kiev.ua → `partner-1.png`; `https://www.lnau.lviv.ua` → `partner-2.png` (у старому HTML бракувало `https://`); kname.edu.ua → `partner-3.png`; unwe.bg → `partner-5.png`; wsb.pl/opole → `partner-9.jpg`; ipma.az → `partner-6.png`; azmiu.edu.az → `partner-4.png`. URL — як у старому HTML.
- `archive/2018.yaml`: `photos: https://photos.app.goo.gl/V2orFOwz0o38lC543`, 4 презентації (Кононенко І.В., Бушуєв С.Д., Зачко О.Б., Никифоров А.) з назвами й посиланнями з `public/index.html` (`d3f7617`, секція `#photos`), назви мовою оригіналу.
- Закоментовані в HTML блоки не переносити.

- [ ] **Step 1: Write the failing test** `data.test.ts`: кожен `src/content/conferences/*.yaml`, `src/content/archive/*.yaml`, `src/content/site.yaml` парситься `yaml` і проходить відповідну схему; для 2026: `edition === 16`, `toIso(dates.start) === '2026-02-17'`, `cost.rows` у `uk` містить `'5 USD'`, в `en` — `'5 EUR'`, `links.registration.uk !== links.registration.en`, `site.partners.length === 7`, усі `site.partners[].image` існують у `public/`.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** `scripts/strip-logo-year.mjs`: через `sharp` (`raw()`, RGBA) обнулити піксель (alpha 0), якщо `r > g + 30 && r > b + 30` і `162 ≤ x ≤ 208`, `79 ≤ y ≤ 100`; вихід — PNG того ж розміру 326×161. Запустити `npm run logo -- public/images/logo_2026.png public/images/logo-base.png`; переглянути результат (рік зник, червона кулька лижника біля `x≈246,y≈17` лишилась).
- [ ] **Step 4:** Написати три YAML-файли за правилами вище.
- [ ] **Step 5:** `npm test` → PASS; `npm run build` → без помилок схеми.
- [ ] **Step 6: Commit** `feat: migrate 2026 content, 2018 archive and logo to data files`

---

### Task 4: Layout, шапка з логотипом, сторінки `/` і `/en/`

**Files:**
- Create: `src/layouts/Base.astro`, `src/styles/global.css`, `src/i18n/ui.ts`, `src/components/Logo.astro`, `src/components/Header.astro`, `src/components/Hero.astro`, `src/components/Footer.astro`, `src/components/ConferencePage.astro`, `src/pages/en/index.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/build/pages.test.ts`

**Interfaces:**
- Consumes: `pickCurrent`, `toRoman`, `formatRange`, `toIso` (Task 2); колекції `conferences`, `site` (Task 2/3).
- Produces:
  - `src/i18n/ui.ts`: `ui: Record<Lang, UiStrings>`; `UiStrings` містить підписи меню й заголовки всіх секцій (`about`, `venue`, `topics`, `publication`, `dates`, `cost`, `authors`, `committees`, `registration`, `archive`, `partners`, `contacts`), кнопки (`register`, `infoLetter`), `editionLine(roman: string): string` (`'XVI міжнародна науково-практична конференція'` / `'XVI International Scientific and Practical Conference'`), `finished` (`'Конференція відбулася'` / `'The conference has taken place'`), `countdownPrefix` (`'До кінця прийому тез:'` / `'Days left to submit abstracts:'`), `langSwitchLabel` (`'EN'` / `'UA'`), `photos`, `presentations`.
  - `ConferencePage.astro` props `{ lang: Lang }`: завантажує дані, рендерить `Header`, `Hero`, слот під секції (Task 5), `Footer`.
  - `Logo.astro` props `{ year: number; width?: number }` → інлайн SVG за параметрами з Global Constraints, `<image href="/images/logo-base.png">`, `role="img"`, `aria-label="Integrated Management {year}"`.
  - Якорі секцій (id): `about`, `topics`, `publication`, `dates`, `cost`, `authors`, `committees`, `registration`, `archive`, `partners`, `contacts`.
  - CSS-змінні в `global.css`: `--color-primary: #1d3c8f`, `--color-accent: #c0302b`, `--color-muted`, `--color-bg`, `--color-border`, `--font-serif`, `--font-sans`.

- [ ] **Step 1: Write the failing test** `pages.test.ts` (по зібраному `dist/`): `dist/index.html` має `lang="uk"`, `<text` з `2026`, `XVI міжнародна науково-практична конференція`, `17–19 лютого 2026`, посилання на UA-форму реєстрації, посилання `href="/en/"`; `dist/en/index.html` має `lang="en"`, `17–19 February 2026`, посилання на EN-форму, `href="/"`; жодна сторінка не містить `undefined`, `[object Object]`, `bootstrap`, `jquery`.
- [ ] **Step 2:** `npm run test:build` → FAIL.
- [ ] **Step 3:** Реалізувати компоненти. Шапка біла: логотип ліворуч (≤ 160 px), меню й перемикач мови праворуч; на ширині < 768 px меню ховається за кнопкою (кнопка з `aria-expanded`, кілька рядків JS у `<script>` компонента). Hero без фото: рядок видання (`--color-primary`, uppercase), назва (serif), `formatRange` + місце, кнопка «Реєстрація» (`--color-accent`) і посилання «Інформаційний лист (PDF)». Шрифти: `@fontsource/source-serif-4` і `@fontsource/manrope` з кириличним підмножинами (`npm i`). `<title>` і `<meta name="description">` з назви конференції; Open Graph з тими ж значеннями; `favicon.ico`.
- [ ] **Step 4:** `npm run test:build` → PASS; `npm run check` → 0 errors.
- [ ] **Step 5: Commit** `feat: base layout, header with year logo, uk/en pages`

---

### Task 5: Секції сторінки

**Files:**
- Create: `src/components/sections/{About,Topics,Publication,Dates,Cost,Authors,Committees,Registration,Archive,Partners,Contacts}.astro`
- Modify: `src/components/ConferencePage.astro`
- Test: `tests/build/sections.test.ts`

**Interfaces:**
- Consumes: `Conference`, `ArchiveYear`, `Site`, `md`, `mdInline`, `formatDate`, `deadlineState`, `countdownTarget`, `isFinished`, `pluralDays`, `toIso` (Task 2), `ui` (Task 4).
- Produces: розмітка-контракт для клієнтського скрипта (Task 6), яку рендерить `Dates.astro`:
  - кожен рядок дедлайну: `<tr data-deadline="YYYY-MM-DD" data-state="upcoming|today|past">`
  - рядок відліку: `<p data-countdown="YYYY-MM-DD" data-lang="uk|en">` з текстом `{countdownPrefix} {pluralDays(n)}`, атрибут `hidden`, якщо `countdownTarget` = `null`
  - позначка завершення: `<p data-finished-after="YYYY-MM-DD">` (дата кінця конференції) з `ui.finished`, `hidden`, якщо конференція ще не завершилась

Порядок секцій і зміст — за розділом «Структура сторінки» spec. Деталі: «Про конференцію» — дві колонки (організатори; місце з описом і iframe `venue.mapEmbedUrl` з `loading="lazy"` і `title`, під ним посилання `venue.mapLink`). «Важливі дати» — таблиця (назва, примітка, `formatDate`), рядки конференції червоним акцентом, минулі — приглушені. «Вартість» — таблиця з горизонтальним скролом на вузьких екранах. «Авторам» — `<details>`/`<summary>` на кожен пункт. «Архів» — по роках (новіші вище); рік без `photos` і без `presentations` не показується; уся секція й пункт меню ховаються, якщо архів порожній. «Партнери» — сітка логотипів з `target="_blank" rel="noopener"`. «Контакти» — Markdown + iframe `site.khpiMapEmbedUrl`. Лічильників днів і соцмереж у футері немає.

- [ ] **Step 1: Write the failing test** `sections.test.ts`: у `dist/index.html` є всі 11 id з Task 4; є обидва iframe (src містить `!2d23.46006058048362` і `!2d36.2498081`); є `data-deadline="2026-01-25"` і `data-deadline="2026-02-16"`; є `data-countdown`; є `<details`; є `5 USD`; у `dist/en/index.html` є `5 EUR` і `contact the Program Committee`; обидві сторінки мають 7 посилань-партнерів і посилання `https://photos.app.goo.gl/V2orFOwz0o38lC543`; жодна не містить `href=""`.
- [ ] **Step 2:** `npm run test:build` → FAIL.
- [ ] **Step 3:** Реалізувати секції.
- [ ] **Step 4:** `npm run test:build` → PASS. `grep -r` по `src/` імен файлів з `public/assets/images/` і видалити невикористані.
- [ ] **Step 5:** Візуальна перевірка: `npm run preview`, відкрити `/` і `/en/` у браузері на ширині 1280 px і 375 px; немає горизонтального скролу сторінки, меню згортається, логотип чіткий. Порівняти з мокапом B (`.superpowers/brainstorm/88347-1793434111/content/direction-real-logo.html`).
- [ ] **Step 6: Commit** `feat: page sections`

---

### Task 6: Дати на стороні відвідувача і редиректи зі старих адрес

**Files:**
- Create: `src/scripts/date-states.ts`, `public/index_eng.html`
- Modify: `src/components/sections/Dates.astro` (підключити скрипт), `src/layouts/Base.astro` (inline-редирект для `?lang=en` лише на сторінці `uk`)
- Test: `tests/scripts/date-states.test.ts`, доповнити `tests/build/pages.test.ts`

**Interfaces:**
- Consumes: `deadlineState`, `daysUntil`, `pluralDays` (Task 2); DOM-контракт з Task 5.
- Produces: `applyDateStates(root: ParentNode, now: Date): void` — оновлює `data-state` у `[data-deadline]`; для `[data-countdown]` перераховує текст і ставить `hidden`, якщо дедлайн `past`; для `[data-finished-after]` знімає `hidden`, якщо дата `past`. Модуль при завантаженні викликає `applyDateStates(document, new Date())`.

- [ ] **Step 1: Write the failing tests**
  - `date-states.test.ts` (`// @vitest-environment happy-dom`): фрагмент розмітки з контракту Task 5, зібраний «на build» 2025-11-15. `now = 2026-01-20T10:00:00Z` → countdown `'До кінця прийому тез: 5 днів'` (текст префікса з `ui.uk`), рядок `2026-01-25` має `data-state="upcoming"`. `now = 2026-01-24T22:30:00Z` → `data-state="today"`, `0 днів`. `now = 2026-02-20T10:00:00Z` → countdown `hidden`, `[data-finished-after]` без `hidden`, усі рядки `past`, у тексті немає `-`.
  - У `pages.test.ts`: `dist/index_eng.html` існує, містить `<meta http-equiv="refresh" content="0; url=/en/">` і `<link rel="canonical" href="https://imconf.com.ua/en/">`; `dist/index.html` містить inline-скрипт, що робить `location.replace('/en/')` при `lang=en` у query.
- [ ] **Step 2:** `npm test && npm run test:build` → FAIL.
- [ ] **Step 3:** Реалізувати `date-states.ts`, `public/index_eng.html`, inline-скрипт у `Base.astro` (`is:inline`, тільки для `lang === 'uk'`).
- [ ] **Step 4:** `npm test && npm run test:build` → PASS.
- [ ] **Step 5: Commit** `feat: client-side date states and legacy URL redirects`

---

### Task 7: Документація і runbook переїзду на Render

**Files:**
- Create: `docs/deploy-render.md`
- Create/Modify: `CLAUDE.md`, `README.md`

**Interfaces:**
- Consumes: усе вище.

- [ ] **Step 1:** `CLAUDE.md` — заново під нову архітектуру (не з `stash@{0}`): команди (`npm run dev|build|preview|check|test|test:build|logo`), де лежить контент, як додати новий рік (скопіювати `src/content/conferences/2026.yaml` у `2027.yaml`, змінити `year`, `edition`, дати, посилання; архівний файл року — лише якщо є фото/презентації), що UA/EN цін і реквізитів різняться навмисно, DOM-контракт дат. `README.md` — 5–10 рядків для людини: як запустити і як додати рік.
- [ ] **Step 2:** `docs/deploy-render.md` — покроковий runbook для власника:
  1. Render → New → Static Site, репозиторій `melygosh/conf-cms`, гілка `redesign/astro`, build `npm ci && npm run build`, publish `dist`, env `NODE_VERSION` = значення з `.node-version`.
  2. Перевірити сайт на його `*.onrender.com`: `/`, `/en/`, `/index_eng.html`, `/?lang=en`, мобільна ширина.
  3. Перевірити в старому web service (`national-technical-university-kharkiv`), чи ввімкнено автодеплой з `master`; не зливати гілку, доки не виконано кроки 4–6.
  4. Старий сервіс → Settings → Custom Domains: видалити `imconf.com.ua` і `www.imconf.com.ua`.
  5. Новий сервіс → Custom Domains: додати обидва. Звірити записи, які показує Render, з DNS у srv53: apex A (зараз `216.24.57.1`), `www` CNAME (зараз `national-technical-university-kharkiv.onrender.com`) → змінити на хост нового сервісу. Дочекатися «Certificate issued».
  6. Перевірити `https://imconf.com.ua/` і `https://www.imconf.com.ua/`.
  7. Злити `redesign/astro` у `master`, перемкнути гілку Static Site на `master`, видалити старий web service.
  - Робити поза сезоном правок; очікуваний простій — кілька хвилин між кроками 4 і 5.
- [ ] **Step 3:** Фінальна перевірка: `npm ci && npm test && npm run test:build && npm run check` → усе PASS / 0 errors.
- [ ] **Step 4: Commit** `docs: CLAUDE.md, README and Render migration runbook`
