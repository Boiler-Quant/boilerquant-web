// Per-direction tone map. Each page section asks for a tone and the CSS in
// demo.css turns it into concrete colors.
export type Tone = 'dark' | 'light' | 'tint' | 'white';
export type Dir = 'a' | 'b' | 'c';

export interface Direction {
	name: string;
	tagline: string;
	nav: Tone;
	footer: Tone;
	home: { fadeTo: Tone; stats: Tone; cards: Tone; cta: Tone };
	about: { header: Tone; body: Tone; band: Tone };
	blog: { header: Tone; list: Tone };
}

export const directions: Record<Dir, Direction> = {
	a: {
		name: 'Terminal',
		tagline: 'Dark everywhere. Gold is the only warm element.',
		nav: 'dark',
		footer: 'dark',
		home: { fadeTo: 'dark', stats: 'dark', cards: 'dark', cta: 'dark' },
		about: { header: 'dark', body: 'dark', band: 'dark' },
		blog: { header: 'dark', list: 'dark' },
	},
	b: {
		name: 'Editorial',
		tagline: 'Mostly light. Dark only for the hero and footer.',
		nav: 'white',
		footer: 'dark',
		home: { fadeTo: 'tint', stats: 'tint', cards: 'white', cta: 'dark' },
		about: { header: 'white', body: 'white', band: 'tint' },
		blog: { header: 'white', list: 'tint' },
	},
	c: {
		name: 'Split',
		tagline: 'Dark home and blog. Light informational pages.',
		nav: 'dark',
		footer: 'dark',
		home: { fadeTo: 'dark', stats: 'dark', cards: 'dark', cta: 'dark' },
		about: { header: 'white', body: 'white', band: 'light' },
		blog: { header: 'dark', list: 'dark' },
	},
};
