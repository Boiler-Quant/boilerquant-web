// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// The site's public address. Astro needs it to write full URLs (https://…) into the
// sitemap and the link-preview tags. Vercel provides the project's live domain at build
// time (the custom domain once one is attached, otherwise the *.vercel.app address), so
// this follows the deployment automatically; the fallback is used for local builds.
const site = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'https://boilerquant.com';

// https://astro.build/config
export default defineConfig({
  site,

  // Writes sitemap-index.xml (the list of pages search engines should crawl) at build time.
  // Hidden pages are left out.
  integrations: [sitemap({ filter: (page) => !page.includes('/styleguide') })],

  // Fetch a linked page's HTML as soon as its link is visible, so clicks feel instant.
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },

  vite: {
    plugins: [tailwindcss()]
  }
});
