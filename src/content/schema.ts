import { z } from 'astro/zod';

export type Lang = 'uk' | 'en';
export const LANGS: Lang[] = ['uk', 'en'];

/** A value that must be present in both languages. */
export const localized = <T extends z.ZodType>(t: T) => z.object({ uk: t, en: t }).strict();

// YAML `2026-01-25` arrives as a Date; a human-written "25 січня" fails here.
const isoDate = z.coerce.date();
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
    organizers: localized(z.string()),
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
  .strict();

export const archiveSchema = z
  .object({
    year: z.number().int(),
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
