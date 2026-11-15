// Generates /robots.txt, the file search engines read first. It allows crawling of
// everything and points to the sitemap (built by @astrojs/sitemap, see astro.config.mjs).
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) =>
	new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site)}\n`, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
