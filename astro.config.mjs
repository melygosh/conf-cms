import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://imconf.com.ua',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
