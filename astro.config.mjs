// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import starlight from '@astrojs/starlight';
import robotsTxt from 'astro-robots-txt';

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
  integrations: [
    robotsTxt({
      sitemap: true,
      sitemapBaseFileName: 'sitemap',
      policy: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/admin', '/api'],
          crawlDelay: 10,
        },
      ],
    }),
    alpinejs(),
    starlight({
      title: 'Datum',
      disable404Route: true,
      credits: false,
      editLink: {
        baseUrl: 'https://github.com/datum-cloud/datum.net/edit/main/',
      },
      logo: {
        light: '/public/images/milo-logo.png',
        dark: '/public/images/milo-logo-dark.png',
        replacesTitle: true,
      },
      customCss: ['./src/v1/styles/starlight.css'], // https://github.com/withastro/starlight/blob/main/packages/starlight/style/props.css
      description:
        env.STARLIGHT_DESCRIPTION || 'Documentation for Datum - Your Data Management Solution',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: env.GITHUB_PROJECT_URL || 'http://github.com/datum-cloud/datum.net',
        },
      ],
      components: {
        PageFrame: '@components/starlight/PageFrame.astro',
        PageSidebar: '@components/starlight/PageSidebar.astro',
        TwoColumnContent: '@components/starlight/TwoColumnContent.astro',
        SiteTitle: '@components/starlight/SiteTitle.astro',
        Header: '@components/starlight/Header.astro',
        Footer: '@components/starlight/Footer.astro',
        MobileMenuToggle: '@components/starlight/MobileMenuToggle.astro',
        Sidebar: '@components/starlight/Sidebar.astro',
        Search: '@components/starlight/Search.astro',
      },
      head: [
        {
          tag: 'script',
          attrs: { src: '/scripts/markerio.js', defer: true },
        },
        {
          tag: 'script',
          attrs: {
            src: 'https://cdn.usefathom.com/script.js',
            defer: true,
            'data-site': 'PXKRQKIZ',
          },
        },
        {
          tag: 'script',
          content: `document.documentElement.setAttribute('data-smooth-scroll', 'false');`,
        },
      ],
      expressiveCode: {
        themes: ['github-light', 'github-dark'],
        styleOverrides: {
          borderRadius: '0.5rem',
        },
      },

      sidebar: [
        {
          label: 'Overview',
          link: '/docs/',
        },
        {
          label: 'Getting Started',
          autogenerate: { directory: 'docs/get-started' },
        },
        {
          label: 'Tasks',
          autogenerate: { directory: 'docs/tasks' },
        },
        {
          label: 'Tutorials',
          autogenerate: { directory: 'docs/tutorials' },
        },
        {
          label: 'Datum Cloud API',
          autogenerate: { directory: 'docs/api' },
        },
        {
          label: 'Contribution Guidelines',
          link: 'docs/contribution-guidelines/',
        },
        {
          label: 'Datum Cloud Glossary',
          link: 'docs/glossary/',
        },
        {
          label: 'Guides and Demos',
          link: 'docs/guides/',
        },
        {
          label: 'Developer Guide',
          link: 'docs/developer-guide/',
        },
        {
          label: 'Galactic VPC',
          autogenerate: { directory: 'docs/galactic-vpc' },
        },
      ],
    }),
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
