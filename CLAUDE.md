# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static bilingual (UA/EN) site for the annual conference «Інтегроване стратегічне управління, управління портфелями, програмами, проєктами» (NTU "KhPI"), served at imconf.com.ua as a Render Static Site. Built with Astro; no server code, no client-side content fetching. Design decisions and their reasons: `docs/superpowers/specs/2026-10-31-site-redesign-design.md`.

## Commands

```bash
npm run dev          # dev server
npm run build        # static build into dist/
npm run preview      # serve dist/
npm run check        # astro check (types)
npm test             # unit tests (schema, dates, data files, client date script)
npm run test:build   # astro build + assertions on dist/*.html
npx vitest run tests/lib/dates.test.ts   # a single test file
npm run logo -- <in.png> <out.png>       # strip the red year from a logo PNG
npm run letter       # print the info letter to public/letters/*.pdf (Playwright; falls back to installed Chrome)
```

## Where things live

- `src/content/conferences/<year>.yaml` — everything about one conference, every text as `{ uk, en }`. The conference with the largest `year` is the current one. Texts are Markdown (raw HTML such as `<sup>` passes through).
- Organizers (in the conference YAML) need `href`; `logo` is optional and shown as a 40% watermark cropped by the card edge, so round marks work best. Round marks for MOE, UPMA, AzMIU and AzPMA are hand-made SVGs in `public/images/organizers/` (sign on a brand-colour disc); full logos stay in `site.yaml` partners.
- `src/content/archive/<year>.yaml` — past years: `proceedings` (the book of abstracts in the KhPI repository, `repository.kpi.kharkov.ua/handle/KhPI-Press/…`; the volumes for 2024 onward are there), `photos`, `presentations`; a year with none of them is not shown. When the current conference's year has `proceedings`, the hero also shows a «Збірник тез» button.
- `src/content/site.yaml` — data that does not change per year: contacts, KhPI map, partners.
- `src/content/schema.ts` — zod schemas (strict). A missing translation, unknown field, a date not written as `YYYY-MM-DD`, or conference dates outside its `year` fail the build and name the field. `assertConferenceFiles` (called from `ConferencePage.astro`) fails the build when a file name does not match its `year`.
- `src/i18n/ui.ts` — interface strings (nav, section titles, buttons). Content never goes here.
- `src/lib/` — pure functions (no Astro/DOM imports) used both at build time and in the browser.
- `src/letter/` — the info letter (call for papers): seven A4 pages at `/letter/` and `/en/letter/` (noindex, not linked), built from the same data as the site. `scripts/build-letter.mjs` prints them to `public/letters/info-letter-<year>-<lang>.pdf` and writes `info-letter-<year>.hash`; the PDFs are committed. Design: `docs/superpowers/specs/2026-11-04-info-letter-design.md`.
- `src/components/ConferencePage.astro` — loads collections and composes the page; `src/pages/index.astro` (uk, `/`) and `src/pages/en/index.astro` (en, `/en/`) only pick the language.

## Things that are not obvious

- **Adding a new year:** copy `src/content/conferences/2026.yaml` to `<year>.yaml`, change `year`, `edition`, `dates`, `deadlines`, `links`; edit the rest as organizers ask. The logo year updates by itself. Do not add `links.infoLetter`: the hero links the generated letter. Finish with `npm run letter` and commit the PDFs.
- **The organizers' calls for papers are the source of truth.** Each year they send two (UA and EN); each one is the source for its language: dates, topics, committees verbatim (no shortened names), prices, contacts. When a new one arrives: show the owner a diff against the YAML and a separate list of contradictions, never "fix" the call for papers silently. The one deliberate deviation is submission: the registration form takes the application, the abstract (doc/docx) and the fee receipt; papers and the publication receipt go to publish.conf@gmail.com.
- **UA and EN differ on purpose** because their calls for papers do: `cost.uk`/`cost.en` are separate price lists (UA 2026: hryvnias; EN 2026: free for foreign participants, publication terms from the site), a deadline can exist in one language only (`only: uk`), and `site.contacts` differ. Do not "sync" them without asking the owner.
- **The info letter must be regenerated after any change it shows.** `astro build` (and so Render) fails with "run npm run letter" when the current year has no `links.infoLetter` and its PDFs are missing or older than what the build renders (an integration in `astro.config.mjs` hashes `dist/letter/` and `dist/en/letter/` with every file they load: styles, fonts, photo, logos; so any visible change counts, including a replaced logo). `astro dev` does not check. `npm run letter` itself fails, writing nothing, when the content of any `[data-fit]` box (page body, cover strip, back sign) is taller or wider than the box: tighten that page's layout, never shorten the text.
- **Dates are build-time *and* client-side.** `Dates.astro` renders states with the build date and the contract attributes `data-deadline`, `data-countdown` (+`data-lang`), `data-finished-after`, `data-hidden-after` (registration buttons/section), `data-closed-after` (`RegisterButton.astro`: the deadline marked `registration: true` turns every form button grey and inert, labelled «Реєстрацію завершено»); `src/scripts/date-states.ts` recomputes them on the visitor's date. Keep both sides in sync. All date math is in `Europe/Kyiv`; the deadline day itself counts as "today", not past.
- **Logo:** `public/images/logo-base.png` is the original artwork without the year; `Logo.astro` draws the year as SVG text over it. The PNG is 326×161, so keep the rendered logo ≤ 160 px wide.
- **Legacy URLs:** `public/index_eng.html` (meta refresh) and an inline script in `Base.astro` (`/?lang=en`) send old links to `/en/`.
- **Deploy:** see `docs/deploy-render.md`. The Astro site is in `master`; until the domain moves to the new Render Static Site, imconf.com.ua is still served by the old Node web service's last successful deploy (its new `master` deploys fail by design).
