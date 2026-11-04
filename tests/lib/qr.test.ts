import { describe, expect, it } from 'vitest';
import { qrSvg } from '../../src/lib/qr';

describe('qrSvg', () => {
  it('draws an inline SVG that loads nothing from elsewhere', async () => {
    const svg = await qrSvg('https://example.com/form');
    expect(svg.trimStart()).toMatch(/^<svg/);
    expect(svg).toContain('viewBox');
    expect(svg.replace(/xmlns="[^"]*"/, '')).not.toContain('http');
  });

  it('is the same for the same text', async () => {
    expect(await qrSvg('https://example.com/form')).toBe(await qrSvg('https://example.com/form'));
  });

  it('differs for a different link', async () => {
    expect(await qrSvg('https://example.com/a')).not.toBe(await qrSvg('https://example.com/b'));
  });
});
