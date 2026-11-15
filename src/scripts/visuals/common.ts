// Shared plumbing for canvas visuals: colors from the design tokens, and a render
// loop that handles device pixel ratio, resizing, reduced motion and cleanup.

export interface Palette {
	gold: string;
	goldTint: string;
	ash: string;
	gain: string;
	loss: string;
	mono: string; // font-family string for canvas text
}

export interface VisualOptions {
	palette: Palette;
	reduce: boolean; // prefers-reduced-motion: render a single static frame
}

/** A visual mounts onto a canvas and returns a cleanup function. */
export type Visual = (canvas: HTMLCanvasElement, opts: VisualOptions) => () => void;

export type Render = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number) => void;

/** Parse "#rrggbb" / "#rgb" into [r, g, b]. */
const rgb = (hex: string): [number, number, number] => {
	let h = hex.trim().replace('#', '');
	if (h.length === 3) h = h.split('').map((c) => c + c).join('');
	const n = parseInt(h, 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const rgba = (hex: string, a: number) => {
	const [r, g, b] = rgb(hex);
	return `rgba(${r},${g},${b},${a})`;
};

/** Standard normal sample (Box–Muller). */
export const randn = () => {
	let u = 0, v = 0;
	while (u === 0) u = Math.random();
	while (v === 0) v = Math.random();
	return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

export const easeInOut = (u: number) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
export const easeOut = (u: number) => 1 - Math.pow(1 - u, 2.2);

/**
 * Run `render` every frame (or once if reduced motion). Handles HiDPI scaling and
 * resizing. The loop pauses while the canvas is scrolled off screen, so an invisible
 * animation doesn't keep the browser busy and slow down the rest of the page.
 * Returns a cleanup that stops the loop and removes listeners.
 */
export function loop(canvas: HTMLCanvasElement, render: Render, opts: { reduce: boolean; fps?: number }): () => void {
	const ctx = canvas.getContext('2d')!;
	let w = 0, h = 0;
	const resize = () => {
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		w = canvas.clientWidth; h = canvas.clientHeight;
		canvas.width = w * dpr; canvas.height = h * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	};
	resize();

	let alive = true;
	const ro = new ResizeObserver(() => { resize(); if (opts.reduce) render(ctx, w, h, 0, 0); });
	ro.observe(canvas);

	let io: IntersectionObserver | undefined;
	if (opts.reduce) {
		render(ctx, w, h, 0, 0);
	} else {
		const start = performance.now();
		let last = start;
		let visible = true; // is any part of the canvas inside the viewport?
		let running = false; // is a frame currently scheduled?
		const minDt = opts.fps ? 1000 / opts.fps : 0;
		const tick = (now: number) => {
			if (!alive || !visible) { running = false; return; }
			requestAnimationFrame(tick);
			if (now - last < minDt) return;
			const dt = Math.min(0.1, (now - last) / 1000); // cap dt after tab switches or a pause
			last = now;
			render(ctx, w, h, (now - start) / 1000, dt);
		};
		const run = () => { if (!running) { running = true; requestAnimationFrame(tick); } };
		// Stop drawing when the canvas leaves the screen; pick up again when it returns.
		io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) run(); });
		io.observe(canvas);
		run();
	}
	return () => { alive = false; ro.disconnect(); io?.disconnect(); };
}
