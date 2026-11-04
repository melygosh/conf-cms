# Інформаційний лист з даних сайту: план реалізації

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** З тих самих YAML, що й сайт, генерувати двомовний (UA, EN) інформаційний лист у дизайні «C» (A4 портрет, 7 сторінок) і віддавати його з сайту як PDF.

**Architecture:** Схема даних розширюється тим, чого бракує листу (місце проведення, звернення, групи дедлайнів, вартість окремо для кожної мови, вимоги до статей, кроки подачі). Лист — це дві Astro-сторінки (`/letter/`, `/en/letter/`) з print-CSS, зібрані з компонентів у `src/letter/`. Скрипт `npm run letter` збирає сайт, друкує ці сторінки через Playwright у `public/letters/*.pdf`, перевіряє переповнення сторінок і записує хеш вхідних даних. `astro build` падає, якщо PDF поточного року немає або він застарів.

**Tech Stack:** Astro 7, TypeScript, zod (`astro/zod`), `marked`, Vitest, `qrcode` (новий, dependency), `playwright` (новий, devDependency).

**Spec:** `docs/superpowers/specs/2026-11-04-info-letter-design.md`. Візуальний орієнтир: `.superpowers/brainstorm/31713-1793797706/content/letter-c-full-v5.html` (локально, не в git; сусідні файли в тій самій теці — його ресурси).

## Global Constraints

- Окрема гілка `feat/info-letter` від актуального `master` (у `master` паралельно з'являються коміти, перед стартом зробити `git pull`).
- Джерело істини для кожної мови — її call for papers: UA `~/Downloads/Call for papers ukr 2026.pdf` (`pdftotext -layout`), EN — англійський call for papers 2026 (Task 2). Тексти переносяться дослівно. Жодних вигаданих скорочень або абревіатур; у комітетах назви установ повні, як в оригіналі (ЛНАУ, ХНУМГ, НУК, НАУ «ХАІ» лишаються, бо так в оригіналі).
- Єдиний свідомий відступ від оригіналу: заявка, файл тез (doc/docx) і квитанція про оргвнесок прикріплюються до реєстраційної форми; стаття до Вісника і чек про оплату публікації надсилаються на `publish.conf@gmail.com`.
- Ціни кожна мова бере зі свого листа; UA та EN не синхронізуються між собою.
- Контент не йде в `src/i18n/ui.ts`; там лише інтерфейсні рядки (кікери, підписи).
- `src/lib/` — чисті функції без Astro/DOM-імпортів. Виняток — `src/lib/letter-freshness.ts` (Node `fs`/`crypto`), він працює лише під час build і в скрипті.
- Палітра і шрифти — змінні з `src/styles/global.css` (`--color-primary #1d3c8f`, `--color-primary-deep #10243a`, `--color-primary-soft #e9eef8`, `--color-accent #c0302b`, Manrope, Source Serif 4). У листі заголовки Manrope 800, serif лише у вступному зверненні; червоний — дати конференції і дедлайни групи «участь».
- Розмір сторінки A4 (210×297 мм), `@page { size: A4; margin: 0 }`, фото тільки на обкладинках (1 і 7) під білою вуаллю.
- Футер кожної внутрішньої сторінки: ліворуч `ui[lang].editionLine(toRoman(edition))` + ` · ${year}`, праворуч `imconf.com.ua · N / 7`.
- 2026 — тестовий рік: `links.infoLetter` з `2026.yaml` прибирається, згенеровані PDF 2026 комітяться й публікуються.
- Шляхи PDF: `public/letters/info-letter-<year>-uk.pdf`, `public/letters/info-letter-<year>-en.pdf`; хеш: `public/letters/info-letter-<year>.hash`.

## Review Focus

- EN-тексти довші за UA (комітети з повними іменами, вартість): сторінка переповнюється → `npm run letter` падає з мовою й номером сторінки, а не обрізає текст → тест `findOverflow` (Task 3) + запуск на реальних EN-даних (Task 7).
- Власник змінив дату в YAML і запушив без `npm run letter` → `astro build` падає з підказкою запустити команду; у `astro dev` лише попередження → тести `checkLetterFreshness` (Task 7).
- Markdown з сирим HTML (`<br>`, `<sup>`) у реквізитах і вимогах рендериться в листі як розмітка, а не як текст `&lt;br&gt;` → build-тест (Task 6).
- Рік, у якому немає дедлайнів групи «статті», або один дедлайн: шкала показує лише наявні групи без порожніх підписів → тест `groupDeadlines` (Task 3).
- Комітет у Markdown без підзаголовків ролей (члени одразу під `###`) не губить людей → тест `parseCommittees` (Task 3).

---

### Task 1: Схема даних, UA-дані 2026 за call for papers, сайт на новій схемі

Зміна схеми ламає build, тому схема, дані 2026 і компоненти сайту, що їх читають, змінюються разом.

**Files:**
- Modify: `src/content/schema.ts`, `src/content/conferences/2026.yaml`, `src/content/site.yaml`
- Modify: `src/lib/conference.ts` (+ `letterHref`)
- Modify: `src/components/Hero.astro`, `src/components/sections/Cost.astro`, `src/components/sections/About.astro`, `src/components/sections/Authors.astro`, `src/components/sections/Dates.astro`
- Test: `tests/fixtures/conference.ts`, `tests/content/schema.test.ts`, `tests/content/data.test.ts`, `tests/lib/conference.test.ts`, `tests/build/sections.test.ts`

**Interfaces:**
- Produces (schema, `Conference` type):
  - `invitation: localized(string)` — звернення «Запрошуємо…» дослівно з call for papers (Markdown).
  - `venue` додатково: `name: localized(string)`, `address: localized(string)`, `url: url`, `director: localized(string).optional()`, `format: localized(string)`.
  - `deadlines[].group: z.enum(['participation', 'papers']).default('participation')`; поле `note` прибирається (кожна подія — окремий рядок, як в оригіналі).
  - `cost: z.object({ uk: costLang, en: costLang }).strict()`, де `costLang = z.object({ items: z.array(z.object({ label: z.string(), amount: z.string(), unit: z.string().optional(), note: z.string().optional() }).strict()).min(1), payment: z.string() }).strict()`. Перший `items[0]` — оргвнесок (його показує обкладинка листа).
  - `publication.articles: z.object({ journalUrl: url, templateUrl: localized(url), badges: localized(z.array(z.string()).min(1)), review: localized(z.string()), requirements: localized(z.string()) }).strict()`.
  - `submission: localized(z.array(z.object({ title: z.string(), text: z.string() }).strict()).min(1))` — кроки «До програмного комітету подаються»; замінює однойменний блок в `authors`.
  - `links.infoLetter: localized(url).optional()`.
- Produces (lib): `letterHref(c: Conference, lang: Lang): string` у `src/lib/conference.ts` — `c.links.infoLetter?.[lang] ?? \`/letters/info-letter-${c.year}-${lang}.pdf\``.

- [ ] **Step 1: Оновити фікстуру й написати падаючі тести схеми**

`tests/fixtures/conference.ts`: додати нові поля в `rawConference()` (мінімальні значення), `cost` у новій формі, прибрати `links.infoLetter` і `deadlines[].note`. У `tests/content/schema.test.ts` додати:

```ts
it('accepts a conference without an info letter link', () => {
  const raw = rawConference() as { links: Record<string, unknown> };
  delete raw.links.infoLetter;
  expect(conferenceSchema.safeParse(raw).success).toBe(true);
});
it('rejects an unknown deadline group and names the field', () => {
  const raw = rawConference() as { deadlines: { group?: string }[] };
  raw.deadlines[0].group = 'other';
  expect(paths(raw)).toContainEqual(['deadlines', 0, 'group']);
});
it('requires prices for each language separately', () => {
  const raw = rawConference() as { cost: Record<string, unknown> };
  delete raw.cost.en;
  expect(paths(raw)).toContainEqual(['cost', 'en']);
});
it('rejects a language with no price items', () => {
  const raw = rawConference() as { cost: { uk: { items: unknown[] } } };
  raw.cost.uk.items = [];
  expect(paths(raw)).toContainEqual(['cost', 'uk', 'items']);
});
```

У `tests/lib/conference.test.ts`:

```ts
it('links the generated letter when the year has no info letter link', async () => {
  const c = await conference();
  expect(letterHref({ ...c, links: { registration: c.links.registration } }, 'en')).toBe('/letters/info-letter-2026-en.pdf');
});
it('keeps an explicit info letter link', async () => {
  const c = await conference();
  expect(letterHref({ ...c, links: { ...c.links, infoLetter: { uk: 'https://x/uk.pdf', en: 'https://x/en.pdf' } } }, 'uk')).toBe('https://x/uk.pdf');
});
```

- [ ] **Step 2: Запустити, переконатися, що падають**

Run: `npx vitest run tests/content/schema.test.ts tests/lib/conference.test.ts`
Expected: FAIL (нових полів у схемі немає, `letterHref` не визначено).

- [ ] **Step 3: Розширити схему й додати `letterHref`**

Форма полів — як у блоці Interfaces. Решта схеми без змін; `.strict()` скрізь, як зараз.

- [ ] **Step 4: Перенести UA-дані 2026 з call for papers у `2026.yaml`**

Дослівно з `pdftotext -layout`. Конкретні значення:
- `invitation.uk`: «Запрошуємо Вас прийняти участь у роботі XVI-ї Міжнародної науково-практичної конференції «Інтегроване стратегічне управління, управління портфелями, програмами, проєктами», яка відбудеться 17-19 лютого 2026 року в смт Славсько Львівської області у комбінованому форматі.»
- `venue.name.uk`: «Навчально-оздоровчий табір Національного університету «Львівська політехніка» «Політехнік-2»»; `venue.address.uk`: «Львівська область, смт Славсько, вул. І. Франка, буд. 49»; `venue.url`: `https://lpnu.ua/politekhnik-2` (те саме посилання замінити й у `venue.description`); `venue.director.uk`: «Білодід Володимир Петрович»; `venue.format.uk`: «комбінований формат».
- `sections[0].items.uk`: шість пунктів оригіналу (без «Система збалансованих показників»); `sections[2].text.uk`: «Виступ експертів-практиків з управління.»
- `languages.uk`: «Англійська, українська.» (робочі мови). У `publication.rules.uk` мова тез — «англійська»; файл тез — doc/docx, прикріплюється до форми.
- `publication.formatting.uk`: додати пункт про рисунки з оригіналу (≤ 12×9 см, bmp/tif/jpg, підпис 12 pt, рисунки Word згруповані).
- `deadlines` (у порядку оригіналу): `2026-01-25` «Подача заявки учасниками» (`registration: true`), `2026-01-25` «Оплата організаційного внеску», `2026-01-25` «Прийом тез доповідей» (`countdown: true`) — група `participation`; `2026-01-25` «Закінчення прийому статей», `2026-02-16` «Рецензування та оповіщення авторів про прийом статті до публікації» — група `papers`.
- `cost.uk.items`: оргвнесок `300 грн` з `note` «До організаційного внеску входять витрати на оренду приміщення, обслуговування обладнання, канцтовари, інформаційне обслуговування, видання збірника тез, програми конференції, списку учасників тощо. Витрати на харчування, проживання та проїзд учасники конференції несуть самостійно.»; публікація статті у Віснику НТУ «ХПІ» `150 грн`, `unit` «за сторінку», `note` «Здійснюється окремо після прийняття статті програмним комітетом із розрахунку за одну сторінку відповідно до шаблону.» Колонки «для інших країн» і примітки про друковані примірники в UA немає. `cost.uk.payment`: реквізити з оригіналу (банк «АТ КБ "ПРИВАТБАНК"») і попередження «Увага!».
- `publication.articles`: `journalUrl` `http://pm.khpi.edu.ua/`; `templateUrl.uk` — посилання «УКРАЇНСЬКИЙ» з оригіналу (кандидат `https://docs.google.com/document/d/1e0Tu9xXuOFtup2iuru7FOt_fjaCLywAY/edit`; перевірити в PDF, що саме на ньому висить текст «УКРАЇНСЬКИЙ»); `badges.uk`: «категорія Б», «спеціальності 122, 126», «DOI», «подвійне анонімне рецензування»; `review.uk` і `requirements.uk` — абзаци «Публікації статей конференції» та «Вимоги до оформлення статей» з оригіналу.
- `submission.uk`: 1) «Заявка, тези й квитанція» — «Заповнюється реєстраційна форма; до неї прикріплюються файл тез доповіді (doc/docx) і квитанція про сплату організаційного внеску.» 2) «Стаття до Вісника» — «Електронний варіант статті надсилається на publish.conf@gmail.com.» 3) «Оплата публікації» — «Після прийняття статті програмним комітетом; копія чека надсилається на publish.conf@gmail.com.» Блок «До програмного комітету подаються» з `authors` прибрати.
- Прибрати `links.infoLetter`.
- EN-половину нових полів тимчасово заповнити наявними EN-текстами сайту, переформованими під нову схему (EN `cost.en` — з поточних EN-значень). Звірка з EN-оригіналом — Task 2.
- `site.yaml` `contacts.uk`: у «Програмний комітет» додати «Лобач Олена Володимирівна», як в оригіналі.

- [ ] **Step 5: Перевести компоненти сайту на нову схему**

`Hero.astro`: `href={letterHref(c, lang)}`. `Cost.astro`: картки з `c.cost[lang].items` (label, amount + unit, note як Markdown), реквізити з `c.cost[lang].payment`; заголовків «Україна / інші країни» більше немає. `About.astro`: під описом місця — назва, адреса (з посиланням `venue.url`), директор (якщо є), формат. `Authors.astro`: після блоків `authors` — нумерований список `submission[lang]` під заголовком, що був у прибраному блоці (рядок у `ui.ts`). `Dates.astro`: показ `note` прибрати; додаткових змін не треба.

- [ ] **Step 6: Оновити build-тести під нову схему**

У `tests/build/sections.test.ts` додати:

```ts
it.each(pages)('%s shows every price item of its own language', (lang, html) => {
  const section = html.slice(html.indexOf('id="cost"'), html.indexOf('id="authors"'));
  for (const item of c.cost[lang].items) expect(section).toContain(item.amount);
});
it.each(pages)('%s shows the venue address and its link', (lang, html) => {
  expect(html).toContain(c.venue.address[lang]);
  expect(html).toContain(`href="${attr(c.venue.url)}"`);
});
it.each(pages)('%s hero links the info letter', (lang, html) => {
  expect(html).toContain(`href="${attr(letterHref(c, lang))}"`);
});
```

- [ ] **Step 7: Запустити всі тести й build**

Run: `npm test && npm run check && npm run test:build`
Expected: усе зелене (захисту свіжості PDF ще немає; кнопка веде на ще не існуючий PDF — його створить Task 7).

- [ ] **Step 8: Commit**

```bash
git add src tests
git commit -m "feat: data for the info letter; 2026 follows its call for papers"
```

---

### Task 2: EN-дані 2026 за англійським call for papers

**Files:**
- Modify: `src/content/conferences/2026.yaml`, `src/content/site.yaml` (лише EN-значення)

**Interfaces:**
- Consumes: схема з Task 1.

- [ ] **Step 1: Отримати англійський call for papers 2026**

Попросити власника переслати PDF або дозволити завантажити його з `https://drive.google.com/file/d/1ElIhfmjbDcbgkylnpDjZhMhthZdkqVOa/view` (посилання було в `links.infoLetter.en`). Без файлу задачу не виконувати.

- [ ] **Step 2: Перенести EN-тексти дослівно**

Усі EN-поля, зокрема `invitation`, `venue.*`, `sections`, `languages`, `publication.*`, `deadlines[].title.en`, `cost.en` (суми й валюта з EN-листа), `submission.en` (з урахуванням маршруту подачі з Global Constraints), `committees.en` (порядок, регалії і установи — як в EN-листі; зокрема перевірити «NUS», зайве «Azerbaijan University…» біля Kononenko, порядок членів), `site.contacts.en`. Те, чого в EN-листі немає, з EN-даних прибрати; суперечності, яких не можна розв'язати за листом, записати й показати власнику.

- [ ] **Step 3: Перевірити**

Run: `npm test && npm run test:build`
Expected: зелене.

- [ ] **Step 4: Commit**

```bash
git add src/content
git commit -m "fix: English 2026 data follows the English call for papers"
```

---

### Task 3: Чисті функції листа

**Files:**
- Create: `src/lib/letter.ts`
- Test: `tests/lib/letter.test.ts`

**Interfaces:**
- Produces:
  - `ordinalWord(n: number, lang: Lang): string` — порядковий числівник жіночого роду для UA («шістнадцята»), EN «sixteenth»; 1–49, інакше `throw`. Велика літера — на боці виклику.
  - `groupDeadlines(c: Conference): { group: 'participation' | 'papers'; items: Conference['deadlines'] }[]` — групи в порядку першої появи, порожніх немає.
  - `parseCommittees(markdown: string): { title: string; groups: { role: string; members: string[] }[] }[]` — `###` комітет, `####` роль, кожен непорожній абзац — член (Markdown рядок як є); члени до першої `####` ідуть у групу з `role: ''`.
  - `findOverflow(pages: { scrollHeight: number; clientHeight: number }[]): number[]` — номери сторінок (з 1), де `scrollHeight > clientHeight + 1`.

- [ ] **Step 1: Написати падаючі тести**

```ts
describe('ordinalWord', () => {
  it.each([[16, 'шістнадцята', 'sixteenth'], [17, 'сімнадцята', 'seventeenth'], [20, 'двадцята', 'twentieth'],
    [21, 'двадцять перша', 'twenty-first'], [23, 'двадцять третя', 'twenty-third'], [30, 'тридцята', 'thirtieth'],
    [42, 'сорок друга', 'forty-second']])('%i', (n, uk, en) => {
    expect(ordinalWord(n, 'uk')).toBe(uk);
    expect(ordinalWord(n, 'en')).toBe(en);
  });
  it.each([0, 50])('refuses %i', (n) => expect(() => ordinalWord(n, 'uk')).toThrow());
});
describe('groupDeadlines', () => {
  it('keeps the order and drops empty groups', async () => {
    const c = await conference();
    c.deadlines = c.deadlines.map((d) => ({ ...d, group: 'participation' as const }));
    expect(groupDeadlines(c).map((g) => g.group)).toEqual(['participation']);
  });
});
describe('parseCommittees', () => {
  it('splits committees, roles and members', () => {
    const r = parseCommittees('### A\n\n#### Chair\n\n**X**, prof.\n\n#### Members\n\n**Y**, doc.\n\n**Z**, doc.\n\n### B\n\n**W**, PhD');
    expect(r).toEqual([
      { title: 'A', groups: [{ role: 'Chair', members: ['**X**, prof.'] }, { role: 'Members', members: ['**Y**, doc.', '**Z**, doc.'] }] },
      { title: 'B', groups: [{ role: '', members: ['**W**, PhD'] }] },
    ]);
  });
});
describe('findOverflow', () => {
  it('names the pages whose content is taller than the page', () => {
    expect(findOverflow([{ scrollHeight: 900, clientHeight: 1000 }, { scrollHeight: 1040, clientHeight: 1000 }, { scrollHeight: 1001, clientHeight: 1000 }])).toEqual([2]);
  });
});
```

Плюс тест, що `parseCommittees` на справжньому `committees.uk` і `.en` з `2026.yaml` дає 2 комітети, а кількість членів дорівнює кількості рядків, що починаються з `**`.

- [ ] **Step 2: Запустити — FAIL** (`npx vitest run tests/lib/letter.test.ts`, модуля немає)
- [ ] **Step 3: Реалізувати `src/lib/letter.ts`**
- [ ] **Step 4: Запустити — PASS**
- [ ] **Step 5: Commit** — `git commit -m "feat: helpers for the info letter"`

---

### Task 4: QR-код

**Files:**
- Modify: `package.json` (dependency `qrcode`, devDependency `@types/qrcode`)
- Create: `src/lib/qr.ts`
- Test: `tests/lib/qr.test.ts`

**Interfaces:**
- Produces: `qrSvg(text: string): Promise<string>` — `<svg …>` рядок (`QRCode.toString(text, { type: 'svg', margin: 0, errorCorrectionLevel: 'M' })`), без зовнішніх запитів.

- [ ] **Step 1: Падаючий тест** — `qrSvg('https://example.com/form')` повертає рядок, що починається з `<svg`, містить `viewBox` і не містить `http` поза атрибутом `xmlns`; два виклики з однаковим текстом дають однаковий результат.
- [ ] **Step 2: FAIL** — `npx vitest run tests/lib/qr.test.ts`
- [ ] **Step 3: `npm i qrcode && npm i -D @types/qrcode`, реалізувати `qrSvg`**
- [ ] **Step 4: PASS**
- [ ] **Step 5: Commit** — `git add package.json package-lock.json src/lib/qr.ts tests/lib/qr.test.ts && git commit -m "feat: QR codes as inline SVG"`

---

### Task 5: Каркас листа, обкладинка і задня обкладинка

**Files:**
- Create: `src/letter/LetterLayout.astro`, `src/letter/LetterPage.astro`, `src/letter/Page.astro`, `src/letter/letter.css`, `src/letter/Cover.astro`, `src/letter/Back.astro`
- Create: `src/pages/letter.astro`, `src/pages/en/letter.astro`
- Modify: `src/i18n/ui.ts` (група `letter`)
- Test: `tests/build/letter.test.ts`, `tests/build/expected.ts`

**Interfaces:**
- Consumes: `ordinalWord`, `qrSvg`, `toRoman`, `pickCurrent`, `formatRange`, `Logo.astro`.
- Produces:
  - `LetterPage.astro` props `{ lang: Lang }`: завантажує колекції (`assertConferenceFiles`, `pickCurrent`, `site`), рендерить 7 сторінок по черзі.
  - `Page.astro` props `{ lang: Lang; conference: Conference; n: number; kicker: string; title: string }` + slot: розмітка `<section class="page"><div class="page__body">…</div><footer class="page__foot">…</footer></section>`. `.page__body` має фіксовану висоту до футера й `overflow: hidden` — Task 7 міряє саме його.
  - Обкладинки (`Cover`, `Back`) — теж `<section class="page">` з `.page__body`, без футера.
  - `ui[lang].letter`: `title` («Інформаційний лист» / «Call for Papers»), `editionWords(word: string): string` («Шістнадцята міжнародна науково-практична конференція»), кікери 7 сторінок, `factDeadline`, `factFee`, `factLanguages`, `registerTitle`, `registerForm` тощо — усе, що лист пише від себе.
  - `tests/build/expected.ts`: `letters: [Lang, string][]` з `dist/letter/index.html` і `dist/en/letter/index.html`.

- [ ] **Step 1: Падаючі build-тести** (`tests/build/letter.test.ts`)

```ts
it.each(letters)('%s letter is a standalone, unindexed A4 document', (lang, html) => {
  expect(html).toContain(`<html lang="${lang}"`);
  expect(html).toContain('name="robots" content="noindex"');
  expect(html.match(/class="page[ "]/g)).toHaveLength(7);
});
it.each(letters)('%s cover carries the edition, title, dates and the registration QR', (lang, html) => {
  expect(html).toContain(toRoman(c.edition));
  expect(html).toContain(ui[lang].letter.editionWords(cap(ordinalWord(c.edition, lang))));
  expect(html).toContain(c.title[lang]);
  expect(html).toContain(c.cost[lang].items[0].amount);
  expect(html).toContain(`href="${attr(c.links.registration[lang])}"`);
  expect(html).toMatch(/<svg[^>]*viewBox/);
});
it.each(letters)('%s back cover has both committees\' contacts', (lang, html) => {
  for (const line of ['imconf@gmail.com', 'publish.conf@gmail.com']) if (site.contacts[lang].includes(line)) expect(html).toContain(line);
});
```

(`cap` — локальний хелпер тесту: перша літера велика.)

- [ ] **Step 2: FAIL** — `npm run test:build` (сторінок немає)
- [ ] **Step 3: Реалізувати каркас, `letter.css`, обкладинки**

Обкладинка й задня обкладинка за мокапом v5: фото `src/assets/photos/carpathians.jpg` через `getImage` (jpg, ширина ~1600) як `background-image`, біла вуаль (ліва й верхня зони майже білі, фото проявляється в нижній третині); на обкладинці — `Logo.astro` з роком, «Інформаційний лист», контурне римське число, `editionWords`, назва, дати червоним, рік, `venue.address`/`venue.format`, смуга з трьома фактами (дедлайн групи participation з `registration: true`, `cost[lang].items[0].amount`, `languages`) і QR `links.registration[lang]`. Задня — картка реєстрації з QR і дедлайном, `site.contacts[lang]` розбитий на картки по `###`, логотип і `imconf.com.ua` на білій плашці. Шрифти імпортуються в `letter.css` з `@fontsource`, як у `global.css`.

- [ ] **Step 4: PASS** — `npm run test:build`
- [ ] **Step 5: Подивитися очима** — `npm run dev`, відкрити `/letter/` і `/en/letter/` у браузері, порівняти обкладинки з мокапом v5.
- [ ] **Step 6: Commit** — `git commit -m "feat: info letter pages with front and back covers"`

---

### Task 6: Внутрішні сторінки 2–6

**Files:**
- Create: `src/letter/About.astro`, `src/letter/Topics.astro`, `src/letter/Participation.astro`, `src/letter/Publications.astro`, `src/letter/Committees.astro`
- Modify: `src/letter/LetterPage.astro`, `src/letter/letter.css`, `src/i18n/ui.ts`
- Test: `tests/build/letter.test.ts`

**Interfaces:**
- Consumes: `Page.astro`, `groupDeadlines`, `parseCommittees`, `md`/`mdInline`, `formatDate`.

Вміст сторінок — за специфікацією («Зміст по сторінках») і мокапом v5. Два рішення, яких мокап не показує: схема аркуша на с. 5 — без чисел (поля, розміри рисунка лише в тексті правил, щоб схема не розійшлася з даними); нижню частину с. 3 займає картка з `publication.summary`, а якщо місце лишається — нехай лишається білим, не розтягувати.

- [ ] **Step 1: Падаючі build-тести**

```ts
it.each(letters)('%s keeps every block of the call for papers', (lang, html) => {
  for (const o of c.organizers) expect(html).toContain(o.name[lang]);
  for (const s of c.sections) expect(html).toContain(s.name[lang]);
  for (const d of c.deadlines) expect(html).toContain(d.title[lang]);
  for (const step of c.submission[lang]) expect(html).toContain(step.title);
  for (const item of c.cost[lang].items) expect(html).toContain(item.label);
  for (const b of c.publication.articles.badges[lang]) expect(html).toContain(b);
  expect(html).toContain(c.venue.name[lang]);
  expect(html).toContain(`href="${attr(c.publication.articles.templateUrl[lang])}"`);
  expect(html).toContain(`href="${attr(c.publication.articles.journalUrl)}"`);
});
it.each(letters)('%s lists every committee member verbatim', (lang, html) => {
  for (const name of c.committees[lang].match(/^\*\*[^*]+\*\*/gm)!) expect(html).toContain(name.slice(2, -2));
});
it.each(letters)('%s renders raw HTML from Markdown as markup', (_, html) => {
  expect(html).not.toContain('&lt;br');
  expect(html).not.toContain('&lt;sup');
});
```

- [ ] **Step 2: FAIL** — `npm run test:build`
- [ ] **Step 3: Реалізувати сторінки 2–6**
- [ ] **Step 4: PASS** — `npm run test:build`
- [ ] **Step 5: Подивитися очима** — `/letter/` і `/en/letter/` поруч із мокапом v5; текст ніде не обрізаний (Task 7 це автоматизує).
- [ ] **Step 6: Commit** — `git commit -m "feat: info letter inner pages"`

---

### Task 7: Генерація PDF і захист від застарілого листа

**Files:**
- Create: `src/lib/letter-freshness.ts`, `scripts/build-letter.mjs`
- Modify: `package.json` (`"letter": "node scripts/build-letter.mjs"`, devDependency `playwright`), `src/components/ConferencePage.astro`, `.gitignore` (не ігнорувати `public/letters/`)
- Create (результат): `public/letters/info-letter-2026-uk.pdf`, `-en.pdf`, `info-letter-2026.hash`
- Test: `tests/lib/letter-freshness.test.ts`

**Interfaces:**
- Produces:
  - `letterInputs(year: number, root?: string): string[]` — відсортовані шляхи: `src/content/conferences/<year>.yaml`, `src/content/site.yaml`, `src/i18n/ui.ts`, усі файли `src/letter/**`, `src/lib/letter.ts`, `src/lib/qr.ts`.
  - `letterHash(files: string[]): string` — sha256 по шляху + вмісту кожного файлу.
  - `checkLetterFreshness(c: Conference, opts: { root?: string; dev: boolean }): { ok: true } | { ok: false; message: string }` — `ok: true`, якщо в `c.links.infoLetter` є посилання; інакше перевіряє наявність обох PDF і збіг `.hash`. Повідомлення називає файл і закінчується «run npm run letter».
  - `ConferencePage.astro`: якщо `process.env.LETTER_BUILD !== '1'` і результат `ok: false` → у dev `console.warn`, у build `throw new Error(message)`.

- [ ] **Step 1: Падаючі тести** (у тимчасовій теці з копіями файлів)

```ts
it('is fresh right after the letter was generated', () => { /* write PDFs + hash of letterInputs → ok */ });
it('is stale after the conference YAML changes', () => { /* edit the yaml copy → ok: false, message mentions "npm run letter" */ });
it('reports a missing PDF by name', () => { /* delete -en.pdf → message contains "info-letter-2026-en.pdf" */ });
it('does not check a year that links its own info letter', () => { /* links.infoLetter set → ok */ });
```

- [ ] **Step 2: FAIL** — `npx vitest run tests/lib/letter-freshness.test.ts`
- [ ] **Step 3: Реалізувати `letter-freshness.ts` і перевірку в `ConferencePage.astro`**
- [ ] **Step 4: PASS**
- [ ] **Step 5: Реалізувати `scripts/build-letter.mjs`**

Послідовність: `LETTER_BUILD=1 astro build` → `astro preview` на вільному порту → Playwright Chromium відкриває `/letter/` і `/en/letter/`, чекає `document.fonts.ready`, збирає `scrollHeight`/`clientHeight` усіх `.page__body`, через `findOverflow` → якщо є переповнення, завершує з кодом 1 і повідомленням `en: page 6 overflows` (без PDF) → `page.pdf({ preferCSSPageSize: true, printBackground: true })` у `public/letters/info-letter-<year>-<lang>.pdf` → записує `letterHash(letterInputs(year))` у `.hash` → зупиняє preview. Рік — `pickCurrent` з YAML (як у `tests/build/expected.ts`). Якщо Chromium не встановлено, повідомлення радить `npx playwright install chromium`.

- [ ] **Step 6: Згенерувати лист 2026**

Run: `npm i -D playwright && npm run letter`
Expected: два PDF по 7 сторінок (`pdfinfo` → `Pages: 7`, `Page size: 595.x x 841.x pts (A4)`), без повідомлень про переповнення. Якщо EN переповнюється — щільніша верстка тієї сторінки, а не скорочення тексту.

- [ ] **Step 7: Перевірити, що захист працює**

Run: `npm run test:build` → зелене. Тимчасово змінити дату в `2026.yaml`, `npm run build` → падає з «run npm run letter»; повернути зміну.

- [ ] **Step 8: Перевірити PDF очима**

`pdftoppm -r 60 -png` обидва PDF; порівняти з мокапом v5; посилання клікабельні (`pdfinfo -url` показує форму, Вісник, шаблон, `mailto:`).

- [ ] **Step 9: Commit**

```bash
git add src scripts package.json package-lock.json .gitignore public/letters tests
git commit -m "feat: npm run letter prints the info letter to PDF; build refuses a stale one"
```

---

### Task 8: Документація

**Files:**
- Modify: `CLAUDE.md`, `README.md` (якщо там є перелік команд)

- [ ] **Step 1: Оновити `CLAUDE.md`**

Команда `npm run letter` (і `npx playwright install chromium` при першому запуску); процес «call for papers UA/EN → diff і список суперечностей → YAML → `npm run letter` → коміт PDF»; правило джерела істини й відступу щодо подачі матеріалів; що `astro build` падає на застарілому листі; де лежать компоненти листа (`src/letter/`); новий пункт у «Adding a new year» (не додавати `links.infoLetter`, згенерувати лист). Виправити рядок про `cost` («UA and EN differ on purpose»): тепер це окремі списки цін з листа кожної мови.

- [ ] **Step 2: Повна перевірка**

Run: `npm test && npm run check && npm run test:build`
Expected: зелене.

- [ ] **Step 3: Commit** — `git commit -am "docs: how to generate the info letter"`
