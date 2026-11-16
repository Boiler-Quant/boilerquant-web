// Monte Carlo fan: simulated paths spread from one origin into a cone; overlapping
// low-alpha strokes make the dense middle glow. Each path starts at its own moment
// and grows at its own speed, so the fan's front edge is ragged and you can see the
// individual lines being drawn (rather than one straight edge sweeping across, which
// looks like a picture being uncovered). One path is then chosen as the
// realised future, the scene slides so its end becomes the new origin, and a new
// fan grows from there, forever.
import { type Visual, loop, rgba, randn, easeInOut, easeOut } from './common';

export const montecarlo: Visual = (canvas, { palette, reduce }) => {
	const M = 45, S = 150; // M = number of paths in the fan, S = segments per path
	const DUR = { grow: 3.4, hold: 0.5, select: 0.9, shift: 1.1 };
	type Phase = keyof typeof DUR;
	let phase: Phase = 'grow', phaseT = 0;
	let paths: Float32Array[] = [];
	// Per-path timing within the grow phase, as fractions of it (0 = phase start, 1 = end):
	// path m starts drawing at growStart[m] and reaches the right edge at growEnd[m].
	let growStart = new Float32Array(M), growEnd = new Float32Array(M);
	let history: { x: number; y: number }[] = [];
	let chosen = 0;
	let w0 = 0, h0 = 0;

	const regen = (h: number) => {
		const sigma = (0.15 * h) / Math.sqrt(S);
		paths = Array.from({ length: M }, () => {
			const p = new Float32Array(S + 1);
			for (let i = 1; i <= S; i++) p[i] = p[i - 1] + randn() * sigma;
			return p;
		});
		for (let m = 0; m < M; m++) {
			growStart[m] = Math.random() * 0.4; // start somewhere in the first 40% of the phase
			growEnd[m] = growStart[m] + 0.45 + Math.random() * (0.55 - growStart[m]); // take at least 45% of it; all done by the end
		}
	};

	return loop(canvas, (ctx, w, h, _t, dt) => {
		const ox = w * 0.3, oy = h * 0.4;
		const dx = (w * 0.72) / S; // the origin sits at 30% of the width, so the paths end just past the right edge
		if (paths.length === 0 || w !== w0 || h !== h0) {
			regen(h);
			// Seed a realised path running in from the left edge to the origin, so the
			// fan never looks like it starts from nothing.
			const sigma = (0.15 * h) / Math.sqrt(S);
			history = [];
			for (let x = ox, y = oy; x > -20; x -= dx) { history.unshift({ x, y }); y += randn() * sigma; }
			phase = 'grow'; phaseT = 0; w0 = w; h0 = h;
		}
		phaseT += dt;

		// growU: how far through the grow phase we are (1 = every path fully drawn).
		let growU = 1, others = 1, chosenAlpha = 0, offX = 0, offY = 0;
		const u = Math.min(1, phaseT / DUR[phase]);
		switch (phase) {
			case 'grow': growU = u; break;
			case 'hold': break;
			case 'select': others = 1 - 0.7 * easeInOut(u); chosenAlpha = easeInOut(u); break;
			case 'shift': {
				const e = easeInOut(u);
				const endY = paths[chosen][S];
				offX = -S * dx * e; offY = -endY * e;
				others = 0.3 * (1 - e); chosenAlpha = 1;
				break;
			}
		}
		if (reduce) growU = 1;
		if (!reduce && phaseT >= DUR[phase]) {
			phaseT = 0;
			if (phase === 'grow') phase = 'hold';
			else if (phase === 'hold') {
				// Pick a path whose endpoint is among the 40% closest to centre, so the fan stays on screen.
				const order = [...paths.keys()].sort((a, b) => Math.abs(paths[a][S]) - Math.abs(paths[b][S]));
				chosen = order[Math.floor(Math.random() * Math.floor(M * 0.4))];
				phase = 'select';
			} else if (phase === 'select') phase = 'shift';
			else {
				// Bake the shift: the chosen path becomes history, ending at the origin.
				const p = paths[chosen];
				const endY = p[S];
				history = history.map((q) => ({ x: q.x - S * dx, y: q.y - endY }));
				for (let i = 0; i <= S; i++) history.push({ x: ox - (S - i) * dx, y: oy + p[i] - endY });
				history = history.filter((q) => q.x > -20);
				regen(h);
				phase = 'grow';
				offX = offY = 0; growU = 0; others = 1; chosenAlpha = 0;
			}
		}

		// --- draw ---
		ctx.clearRect(0, 0, w, h);
		ctx.save();
		ctx.translate(offX, offY);
		// Realised history
		if (history.length) {
			ctx.strokeStyle = rgba(palette.gold, 0.6);
			ctx.lineWidth = 1.3;
			ctx.beginPath();
			history.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
			ctx.lineTo(ox, oy);
			ctx.stroke();
		}
		// Fan: additive blending makes overlaps glow
		if (growU > 0 && others > 0) {
			ctx.globalCompositeOperation = 'lighter';
			ctx.strokeStyle = rgba(palette.gold, 0.16 * others); // faint per line; overlaps add up to the glow
			ctx.lineWidth = 1.5;
			for (let m = 0; m < M; m++) {
				// This path's own progress: 0 before its start, 1 once it has reached the edge.
				const um = Math.min(1, Math.max(0, (growU - growStart[m]) / (growEnd[m] - growStart[m])));
				if (um <= 0) continue;
				const steps = easeOut(um) * S; // how many segments of it to draw (may be fractional)
				const n = Math.floor(steps), f = steps - n;
				const p = paths[m];
				ctx.beginPath();
				ctx.moveTo(ox, oy);
				for (let i = 1; i <= n; i++) ctx.lineTo(ox + i * dx, oy + p[i]);
				if (n < S) ctx.lineTo(ox + (n + f) * dx, oy + p[n] + (p[n + 1] - p[n]) * f);
				ctx.stroke();
			}
			ctx.globalCompositeOperation = 'source-over';
		}
		// Chosen path
		if (chosenAlpha > 0) {
			const p = paths[chosen];
			ctx.strokeStyle = rgba(palette.goldTint, chosenAlpha);
			ctx.lineWidth = 1.6;
			ctx.beginPath();
			ctx.moveTo(ox, oy);
			for (let i = 1; i <= S; i++) ctx.lineTo(ox + i * dx, oy + p[i]);
			ctx.stroke();
		}
		// Origin marker
		ctx.fillStyle = palette.goldTint;
		ctx.beginPath(); ctx.arc(ox, oy, 2.5, 0, Math.PI * 2); ctx.fill();
		ctx.restore();
	}, { reduce });
};
