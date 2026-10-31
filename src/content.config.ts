import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { parse as parseYaml } from 'yaml';
import { archiveSchema, conferenceSchema, siteSchema } from './content/schema';

const conferences = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/conferences' }),
  schema: conferenceSchema,
});

const archive = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/archive' }),
  schema: archiveSchema,
});

// site.yaml is a single object; expose it as one entry with id "site".
const site = defineCollection({
  loader: file('./src/content/site.yaml', { parser: (text) => ({ site: parseYaml(text) }) }),
  schema: siteSchema,
});

export const collections = { conferences, archive, site };
