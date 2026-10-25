// Defines the site's "content collections": folders of Markdown files that
// Astro reads at build time and validates against a schema. If a post is
// missing a required field (or has a typo in one), `npm run build` fails with
// a clear message instead of publishing a broken page.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Every .md file in src/content/blog/ is one post. The filename becomes the URL slug.
	loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(), // "2026-10-24" in the file becomes a real Date
		author: z.string().optional(),
		draft: z.boolean().default(false), // true = hidden from the site
	}),
});

const news = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(), // when the event happens, or when the news was posted
		type: z.enum(['event', 'news']).default('event'),
		location: z.string().optional(), // events only
		draft: z.boolean().default(false),
	}),
});

export const collections = { blog, news };
