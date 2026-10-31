import { describe, expect, it } from 'vitest';
import { conferenceSchema } from '../../src/content/schema';
import { rawConference } from '../fixtures/conference';

const paths = (input: unknown) => {
  const r = conferenceSchema.safeParse(input);
  return r.success ? [] : r.error.issues.map((i) => i.path);
};

describe('conferenceSchema', () => {
  it('accepts a complete conference', () => {
    expect(conferenceSchema.safeParse(rawConference()).success).toBe(true);
  });

  it('rejects a missing English translation and names the field', () => {
    const raw = rawConference() as { title: Record<string, string> };
    delete raw.title.en;
    expect(paths(raw)).toContainEqual(['title', 'en']);
  });

  it('rejects a human-written date and names the field', () => {
    const raw = rawConference() as { deadlines: { date: string }[] };
    raw.deadlines[0].date = '25 січня';
    expect(paths(raw)).toContainEqual(['deadlines', 0, 'date']);
  });

  it('rejects unknown top-level fields', () => {
    expect(conferenceSchema.safeParse({ ...rawConference(), extra: 1 }).success).toBe(false);
  });
});
