import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import { checkLetterFreshness } from './src/lib/letter-freshness.ts';

// The hero links the committed info letter PDF: never deploy one that is missing or older than what the build renders.
// `npm run letter` builds with LETTER_BUILD=1 because it is the step that makes the PDF fresh.
const letterGuard = {
  name: 'info-letter-freshness',
  hooks: {
    'astro:build:done': ({ dir }) => {
      if (process.env.LETTER_BUILD === '1') return;
      const result = checkLetterFreshness(fileURLToPath(dir));
      if (!result.ok) throw new Error(result.message);
    },
  },
};

export default defineConfig({
  site: 'https://imconf.com.ua',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [letterGuard],
});
