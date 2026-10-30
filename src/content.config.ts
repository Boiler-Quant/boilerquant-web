// Defines the site's "content collections": folders of Markdown files that
// Astro reads at build time and validates against a schema. If an entry is
// missing a required field (or has a typo in one), `npm run build` fails with
// a clear message instead of publishing a broken page.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const news = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(), // when the event happens, or when the item was posted
		// event = something to attend; news = an announcement; post = a longer article
		type: z.enum(['event', 'news', 'post']).default('event'),
		location: z.string().optional(), // events only
		author: z.string().optional(), // posts, e.g. "Director of Projects"
		draft: z.boolean().default(false),
	}),
});

const projects = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
	// `image` is Astro's helper for a picture stored next to the Markdown file
	// (e.g. "./images/my-project.png"); it is validated and optimised at build time.
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			status: z.enum(['current', 'completed']).default('current'),
			order: z.number().optional(), // position within its section: 1 first, 2 second, ...; unnumbered projects follow, alphabetically
			leads: z.array(z.string()).default([]),
			members: z.array(z.string()).default([]),
			tags: z.array(z.string()).default([]), // e.g. ["Market making", "Python"]
			image: image().optional(), // card banner, 16:9 works best
			draft: z.boolean().default(false),
		}),
});

export const collections = { news, projects };
