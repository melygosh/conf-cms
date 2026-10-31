import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('build output', () => {
  it('produces the Ukrainian home page', () => {
    const html = readFileSync('dist/index.html', 'utf8');
    expect(html).toContain('<html lang="uk"');
  });
});
