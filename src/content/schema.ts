import { z } from 'astro/zod';

export type Lang = 'uk' | 'en';
export const LANGS: Lang[] = ['uk', 'en'];

/** A value that must be present in both languages. */
export const localized = <T extends z.ZodType>(t: T) => z.object({ uk: t, en: t }).strict();

// YAML parses an unquoted `2026-01-25` into a Date at UTC midnight; a quoted one stays a string.
// Anything else ("January 25", "2027/01/25", 20270125, 2026-02-30) is rejected rather than guessed.
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DATE_HINT = 'Use a YYYY-MM-DD date, e.g. 2027-01-25';

const isoDate = z.union([z.date(), z.string()]).transform((value, ctx) => {
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00Z`) : value;
  const valid =
    !Number.isNaN(date.getTime()) &&
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    (typeof value !== 'string' || (ISO_DATE.test(value) && date.toISOString().slice(0, 10) === value));
  if (!valid) {
    ctx.addIssue({ code: 'custom', message: DATE_HINT });
    return z.NEVER;
  }
  return date;
});
const url = z.url();

export const conferenceSchema = z
  .object({
    year: z.number().int(),
    edition: z.number().int().positive(),
    title: localized(z.string()),
    dates: z.object({ start: isoDate, end: isoDate }).strict(),
    venue: z
      .object({ place: localized(z.string()), description: localized(z.string()), mapEmbedUrl: url, mapLink: url })
      .strict(),
    links: z.object({ registration: localized(url), infoLetter: localized(url) }).strict(),
    // Shown as cards linking to the organizer's site; logo is a path under public/ (optional until a file exists).
    organizers: z
      .array(
        z.object({ name: localized(z.string()), href: url, logo: z.string().startsWith('/').optional() }).strict(),
      )
      .min(1),
    aim: localized(z.string()),
    sections: z.array(
      z
        .object({
          name: localized(z.string()),
          items: localized(z.array(z.string())).optional(),
          text: localized(z.string()).optional(),
        })
        .strict(),
    ),
    languages: localized(z.string()),
    publication: z
      .object({ summary: localized(z.string()), rules: localized(z.string()), formatting: localized(z.string()) })
      .strict(),
    deadlines: z.array(
      z
        .object({
          date: isoDate,
          title: localized(z.string()),
          note: localized(z.string()).optional(),
          countdown: z.boolean().default(false),
          /** Registration (and the form's buttons) closes after this deadline. */
          registration: z.boolean().default(false),
        })
        .strict(),
    ),
    cost: z
      .object({
        headers: localized(z.array(z.string()).length(3)),
        rows: z.array(
          z
            .object({ label: localized(z.string()), ukraine: localized(z.string()), abroad: localized(z.string()) })
            .strict(),
        ),
        notes: localized(z.string()),
        // UA and EN legitimately differ here (bank details vs. "contact the committee").
        payment: localized(z.string()),
      })
      .strict(),
    authors: z.array(z.object({ title: localized(z.string()), body: localized(z.string()) }).strict()),
    committees: localized(z.string()),
  })
  .strict()
  .superRefine((c, ctx) => {
    if (c.dates.start.getUTCFullYear() !== c.year) {
      ctx.addIssue({ code: 'custom', path: ['dates', 'start'], message: `Conference start is not in year ${c.year}` });
    }
    if (c.dates.end < c.dates.start) {
      ctx.addIssue({ code: 'custom', path: ['dates', 'end'], message: 'Conference ends before it starts' });
    }
    c.deadlines.forEach((d, i) => {
      if (d.registration && c.deadlines.findIndex((x) => x.registration) !== i) {
        ctx.addIssue({ code: 'custom', path: ['deadlines', i, 'registration'], message: 'Only one deadline can close registration' });
      }
    });
  });

export const archiveSchema = z
  .object({
    year: z.number().int(),
    /** The book of abstracts in the KhPI repository. */
    proceedings: url.optional(),
    photos: url.optional(),
    presentations: z
      .array(z.object({ author: z.string(), title: z.string(), href: url }).strict())
      .default([]),
  })
  .strict();

export const siteSchema = z
  .object({
    contacts: localized(z.string()),
    khpiMapEmbedUrl: url,
    partners: z.array(z.object({ name: z.string(), href: url, image: z.string() }).strict()),
  })
  .strict();

export type Conference = z.infer<typeof conferenceSchema>;
export type ArchiveYear = z.infer<typeof archiveSchema>;
export type Site = z.infer<typeof siteSchema>;
