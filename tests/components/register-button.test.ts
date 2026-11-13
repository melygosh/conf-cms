import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import RegisterButton from '../../src/components/RegisterButton.astro';
import { conferenceSchema, type Conference } from '../../src/content/schema';
import { rawConference } from '../fixtures/conference';

const PAPER = 'https://example.com/paper-uk';

function conference(paperForm?: Record<string, string>): Conference {
  const raw = rawConference() as { links: Record<string, unknown> };
  if (paperForm) raw.links.paperForm = paperForm;
  return conferenceSchema.parse(raw);
}

async function render(props: Record<string, unknown>): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(RegisterButton, { props: { lang: 'uk', label: 'Реєстрація', ...props } });
}

describe('RegisterButton', () => {
  it('is one link to the registration form when the language has no paper form', async () => {
    const html = await render({ conference: conference({ en: 'https://example.com/paper-en' }) });
    expect(html).not.toContain('<details');
    expect(html).toContain('href="https://example.com/uk"');
    expect(html).not.toContain('paper-en');
  });

  it('opens a menu with the abstracts and the paper form when the language has one', async () => {
    const html = await render({ conference: conference({ uk: PAPER }), menuLabel: 'Зареєструватися' });
    expect(html).toContain('<details');
    expect(html).toMatch(/<summary[^>]*>.*Зареєструватися/s);
    const links = [...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1]);
    expect(links).toEqual(['https://example.com/uk', PAPER]);
    expect(html).toContain('Тези доповіді');
    expect(html).toContain('Стаття до Вісника');
  });

  it('keeps the close-after-registration contract on the menu button', async () => {
    const html = await render({ conference: conference({ uk: PAPER }) });
    expect(html).toMatch(/<summary[^>]*data-closed-after="2026-01-20"/);
    expect(html).toMatch(/<details[^>]*data-hidden-after="2026-02-19"/);
  });

  it('links one chosen form directly, without a menu', async () => {
    const c = conference({ uk: PAPER });
    const abstracts = await render({ conference: c, form: 'registration' });
    expect(abstracts).not.toContain('<details');
    expect(abstracts).toContain('href="https://example.com/uk"');
    const paper = await render({ conference: c, form: 'paper' });
    expect(paper).not.toContain('<details');
    expect(paper).toContain(`href="${PAPER}"`);
  });

  it('renders nothing for the paper form when the language has none', async () => {
    const html = await render({ conference: conference(), form: 'paper' });
    expect(html.trim()).not.toMatch(/<a |<details/);
  });
});
