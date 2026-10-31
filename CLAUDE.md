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
```

## Where things live

- `src/content/conferences/<year>.yaml` — everything about one conference, every text as `{ uk, en }`. The conference with the largest `year` is the current one. Texts are Markdown (raw HTML such as `<sup>` passes through).
- Organizers (in the conference YAML) need `href`; `logo` is optional and shown as a 40% watermark cropped by the card edge, so round marks work best. Round marks for MOE, UPMA, AzMIU and AzPMA are hand-made SVGs in `public/images/organizers/` (sign on a brand-colour disc); full logos stay in `site.yaml` partners.
- `src/content/archive/<year>.yaml` — photos/presentations of past years; a year with neither is not shown.
- `src/content/site.yaml` — data that does not change per year: contacts, KhPI map, partners.
- `src/content/schema.ts` — zod schemas (strict). A missing translation, unknown field, a date not written as `YYYY-MM-DD`, or conference dates outside its `year` fail the build and name the field. `assertConferenceFiles` (called from `ConferencePage.astro`) fails the build when a file name does not match its `year`.
- `src/i18n/ui.ts` — interface strings (nav, section titles, buttons). Content never goes here.
- `src/lib/` — pure functions (no Astro/DOM imports) used both at build time and in the browser.
- `src/components/ConferencePage.astro` — loads collections and composes the page; `src/pages/index.astro` (uk, `/`) and `src/pages/en/index.astro` (en, `/en/`) only pick the language.

## Things that are not obvious

- **Adding a new year:** copy `src/content/conferences/2026.yaml` to `<year>.yaml`, change `year`, `edition`, `dates`, `deadlines`, `links`; edit the rest as organizers ask. The logo year updates by itself.
- **UA and EN differ on purpose** in `cost` (USD vs EUR, bank details vs "contact the Program Committee") and in `site.contacts`. Do not "sync" them without asking the owner.
- **Dates are build-time *and* client-side.** `Dates.astro` renders states with the build date and the contract attributes `data-deadline`, `data-countdown` (+`data-lang`), `data-finished-after`, `data-hidden-after` (registration buttons/section); `src/scripts/date-states.ts` recomputes them on the visitor's date. Keep both sides in sync. All date math is in `Europe/Kyiv`; the deadline day itself counts as "today", not past.
- **Logo:** `public/images/logo-base.png` is the original artwork without the year; `Logo.astro` draws the year as SVG text over it. The PNG is 326×161, so keep the rendered logo ≤ 160 px wide.
- **Legacy URLs:** `public/index_eng.html` (meta refresh) and an inline script in `Base.astro` (`/?lang=en`) send old links to `/en/`.
- **Deploy:** see `docs/deploy-render.md`. The Astro site is in `master`; until the domain moves to the new Render Static Site, imconf.com.ua is still served by the old Node web service's last successful deploy (its new `master` deploys fail by design).
