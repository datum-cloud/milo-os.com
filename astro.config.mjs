// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

import { loadEnv } from 'vite';
import node from '@astrojs/node';

import alpinejs from '@astrojs/alpinejs';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

const siteUrl = 'https://www.milo-os.com';
const port = parseInt(process.env.PORT || env.PORT || '4321');

export default defineConfig({
  site: siteUrl || `http://localhost:${port}`,
  trailingSlash: 'always',
  output: 'static',
  adapter: node({
    mode: 'standalone',
  }),
  image: {
    layout: 'constrained',
  },
  integrations: [alpinejs(), mdx()],

  vite: {
    // @ts-expect-error - Tailwind Vite plugin type mismatch with Vite's expected plugin types
    plugins: [tailwindcss()],
    css: {
      devSourcemap: true,
    },
  },

  experimental: {},
  prefetch: true,
});
