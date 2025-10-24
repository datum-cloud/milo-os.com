/**
 * Sitemap generation script
 */

import { type APIRoute } from 'astro';

function staticEntries() {
  const entries =
    `<url><loc>https://www.milo-os.com/about/</loc></url>` +
    `<url><loc>https://www.milo-os.com/roadmap/</loc></url>` +
    `<url><loc>https://www.milo-os.com/changelog/</loc></url>` +
    `<url><loc>https://www.milo-os.com/docs/</loc></url>` +
    `<url><loc>https://www.milo-os.com/legal/privacy/</loc></url>` +
    `<url><loc>https://www.milo-os.com/legal/term/</loc></url>`;

  return entries;
}

export const GET: APIRoute = async () => {
  let entries = '';

  try {
    entries = staticEntries();

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
      ${entries}
      </urlset>`;

    return new Response(sitemapXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
