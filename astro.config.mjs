// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  // Fetch a linked page's HTML as soon as its link is visible, so clicks feel instant.
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },

  vite: {
    plugins: [tailwindcss()]
  }
});