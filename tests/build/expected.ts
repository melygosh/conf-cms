// Expectations for the built pages, derived from the content files the same way the site is,
// so the build tests keep passing when a new year's YAML is added.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { archiveSchema, conferenceSchema, siteSchema, type Lang } from '../../src/content/schema';
import { pickCurrent, registrationClose } from '../../src/lib/conference';
import { toIso } from '../../src/lib/dates';

const load = (path: string) => parse(readFileSync(path, 'utf8'));
const yamlIn = (dir: string) => readdirSync(dir).filter((f) => f.endsWith('.yaml')).map((f) => join(dir, f));

export const conference = pickCurrent(yamlIn('src/content/conferences').map((p) => conferenceSchema.parse(load(p))));
export const site = siteSchema.parse(load('src/content/site.yaml'));
export const archive = yamlIn('src/content/archive').map((p) => archiveSchema.parse(load(p)));

export const endIso = toIso(conference.dates.end);
export const deadlineIsos = conference.deadlines.map((d) => toIso(d.date));
export const registrationIso = registrationClose(conference);
export const countdownIso = toIso(conference.deadlines.find((d) => d.countdown)!.date);

export const pages: [Lang, string][] = [
  ['uk', readFileSync('dist/index.html', 'utf8')],
  ['en', readFileSync('dist/en/index.html', 'utf8')],
];

/** How Astro writes a string into an HTML attribute. */
export const attr = (value: string) => value.replaceAll('&', '&amp;');
