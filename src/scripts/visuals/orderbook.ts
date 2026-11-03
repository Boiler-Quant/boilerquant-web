// Order book ladder: a vertical price ladder with asks above the mid and bids below.
// Each level shows its price and a size bar. Orders arrive and get cancelled, trades
// eat into the best level and flash, and when a level empties the book shifts so the
// mid price drifts like a live market.
import { type Visual, loop, rgba, randn } from './common';

export const orderbook: Visual = (canvas, { palette, reduce }) => {
	const N = 12; // levels per side
	const TICK = 0.05;
	let mid = 142.3;
	let asks = new Float32Array(N), bids = new Float32Array(N);
	let flashA = new Float32Array(N), flashB = new Float32Array(N); // trade flash intensity per level
	let nextEvent = 0;
	let prints: { side: 1 | -1; t: number }[] = [];

	const seed = () => {
		for (let i = 0; i < N; i++) {
			asks[i] = 20 + Math.random() * 60 + i * 6;
			bids[i] = 20 + Math.random() * 60 + i * 6;
		}
	};
	seed();

	const step = (t: number, dt: number) => {
		// Gentle churn on every level: adds and cancels.
		for (let i = 0; i < N; i++) {
			asks[i] = Math.max(2, asks[i] + randn() * 12 * dt * 4);
			bids[i] = Math.max(2, bids[i] + randn() * 12 * dt * 4);
			flashA[i] = Math.max(0, flashA[i] - dt * 2.5);
			flashB[i] = Math.max(0, flashB[i] - dt * 2.5);
		}
		// Discrete events: a trade hits the best bid or lifts the best ask.
		if (t >= nextEvent) {
			nextEvent = t + 0.12 + Math.random() * 0.45;
			const buy = Math.random() < 0.5;
			const qty = 5 + Math.random() * 30;
			if (buy) { asks[0] -= qty; flashA[0] = 1; } else { bids[0] -= qty; flashB[0] = 1; }
			prints.push({ side: buy ? 1 : -1, t });
			if (prints.length > 24) prints.shift();
			// Level cleared: the book shifts by one tick.
			if (asks[0] <= 2) { asks.copyWithin(0, 1); asks[N - 1] = 20 + Math.random() * 60 + N * 6; flashA.copyWithin(0, 1); flashA[N - 1] = 0; bids.copyWithin(1, 0); bids[0] = 6 + Math.random() * 20; flashB.copyWithin(1, 0); flashB[0] = 0; mid += TICK; }
			if (bids[0] <= 2) { bids.copyWithin(0, 1); bids[N - 1] = 20 + Math.random() * 60 + N * 6; flashB.copyWithin(0, 1); flashB[N - 1] = 0; asks.copyWithin(1, 0); asks[0] = 6 + Math.random() * 20; flashA.copyWithin(1, 0); flashA[0] = 0; mid -= TICK; }
		}
	};

	return loop(canvas, (ctx, w, h, t, dt) => {
		if (!reduce) step(t, dt);
		ctx.clearRect(0, 0, w, h);

		const rows = 2 * N + 1;
		const top = h * 0.08, bottom = h * 0.92;
		const rowH = (bottom - top) / rows;
		const fontPx = Math.max(10, Math.min(13, rowH * 0.55));
		ctx.font = `${fontPx}px ${palette.mono}`;
		ctx.textBaseline = 'middle';
		const priceX = w * 0.12;
		const barX = w * 0.42, barMax = w * 0.52;
		const maxSize = 140;
		const barH = Math.max(3, rowH * 0.5);

		const drawSide = (sizes: Float32Array, flash: Float32Array, dir: 1 | -1, color: string) => {
			for (let i = 0; i < N; i++) {
				const y = top + rowH * (N + 0.5 + dir * (i + 1)); // asks go up (dir -1), bids down (+1)
				const price = mid - dir * TICK * (i + 1); // asks (dir -1) sit above the mid, bids (dir +1) below
				const near = 1 - i / N;
				ctx.fillStyle = rgba(palette.ash, 0.45 + 0.45 * near);
				ctx.textAlign = 'right';
				ctx.fillText(price.toFixed(2), priceX + w * 0.2, y);
				const len = Math.min(1, sizes[i] / maxSize) * barMax;
				ctx.fillStyle = rgba(color, 0.18 + 0.32 * near);
				ctx.fillRect(barX, y - barH / 2, len, barH);
				if (flash[i] > 0) { ctx.fillStyle = rgba(palette.goldTint, 0.7 * flash[i]); ctx.fillRect(barX, y - barH / 2, len, barH); }
				ctx.fillStyle = rgba(palette.ash, 0.3 + 0.4 * near);
				ctx.textAlign = 'left';
				ctx.fillText(String(Math.round(sizes[i])), barX + len + 6, y);
			}
		};
		drawSide(asks, flashA, -1, palette.loss);
		drawSide(bids, flashB, 1, palette.gain);

		// Mid row: price, spread rule, and the recent trade prints as dots.
		const ym = top + rowH * (N + 0.5);
		ctx.strokeStyle = rgba(palette.gold, 0.35);
		ctx.lineWidth = 1;
		ctx.beginPath(); ctx.moveTo(w * 0.06, ym); ctx.lineTo(w * 0.94, ym); ctx.stroke();
		ctx.fillStyle = palette.gold;
		ctx.textAlign = 'right';
		ctx.font = `500 ${fontPx + 1}px ${palette.mono}`;
		ctx.fillText(mid.toFixed(2), priceX + w * 0.2, ym);
		ctx.font = `${fontPx}px ${palette.mono}`;
		ctx.fillStyle = rgba(palette.gold, 0.6);
		ctx.textAlign = 'left';
		ctx.fillText(`spread ${TICK.toFixed(2)}`, barX, ym);
		prints.forEach((p, i) => {
			const age = t - p.t;
			const a = Math.max(0, 1 - age / 3);
			ctx.fillStyle = rgba(p.side > 0 ? palette.gain : palette.loss, a);
			ctx.beginPath(); ctx.arc(w * 0.92 - (prints.length - 1 - i) * 7, ym, 2, 0, Math.PI * 2); ctx.fill();
		});
	}, { reduce, fps: 30 });
};
