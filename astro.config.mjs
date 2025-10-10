// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import starlight from '@astrojs/starlight';

import { loadEnv } from 'vite';
import node from '@astrojs/node';

import alpinejs from '@astrojs/alpinejs';

import mdx from '@astrojs/mdx';

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
  integrations: [
    starlight({
      title: 'Milo',
      disable404Route: true,
      credits: false,
      editLink: {
        baseUrl: 'https://github.com/datum-cloud/datum.net/edit/main/',
      },
      logo: {
        light: '/public/images/milo-hi.png',
        dark: '/public/images/milo-hi.png',
        replacesTitle: true,
      },
    }),
    alpinejs(),
    mdx(),
  ],

  vite: {
    plugins: [tailwindcss()],
    css: {
      devSourcemap: true,
    },
  },

  experimental: {},
  prefetch: true,
});
