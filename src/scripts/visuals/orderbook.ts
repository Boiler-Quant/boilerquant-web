// Order book ladder: a vertical price ladder with asks above the mid and bids below.
//
// The process (all random, nothing recorded):
//   - Each side is a list of levels counted outward from its touch (best price).
//     Level j has a target size that is thin at the touch and grows over a few ticks,
//     the "hump" shape of real books. Sizes drift toward their target with noise that
//     scales with the target, so thin levels wobble a little and deep ones a lot.
//   - Levels near the touch are sometimes cancelled outright and sit empty until a
//     new order refills them, so the book is sparse close to the touch and solid
//     further out. The touch itself only leaves by being traded through.
//   - Trades arrive at random and eat into the best level on one side. If that level
//     is emptied, the next non-empty level becomes the touch and the spread widens.
//   - When the spread is wider than a tick, new orders occasionally land inside it,
//     narrowing it again. Spread and mid price therefore wander instead of being fixed.
//     Trades lean slightly against the drift so the price stays near where it began.
//   - The ladder is drawn around the mid, which eases toward its new value when the
//     book shifts, so the picture stays centred while the price drifts.
import { type Visual, loop, rgba, randn } from './common';

export const orderbook: Visual = (canvas, { palette, reduce }) => {
	const TICK = 0.05;
	const N = 12; // levels kept per side (rows drawn each side of the mid)
	const TARGET_MAX = 90; // size a level settles toward far from the touch
	const TARGET_SCALE = 4; // ticks over which the target grows from thin to full
	const REVERT = 0.4; // how fast sizes drift toward their target (per second)
	const NOISE_FRAC = 0.3; // random churn as a fraction of the level's target (per sqrt second)
	const CANCEL = 0.6; // cancel rate (per second) one tick from the touch, halving every ~tick outward
	const REFILL = 0.5; // rate (per second) at which an empty level gets a new order
	const TRADE_GAP = [0.7, 1.8]; // seconds between trades (min, max)
	const TRADE_QTY = [3, 12]; // shares per trade (min, max)
	const INSIDE_RATE = 0.5; // orders inside the spread per second, per side, per extra tick of spread
	const MAX_SPREAD = 6; // ticks; beyond this an inside order is forced so it never runs away
	const ANCHOR = 142.325; // price the drift is gently pulled back toward
	const ANCHOR_PULL = 0.2; // buy probability shifts by this much per $1 away from the anchor

	const target = (j: number) => TARGET_MAX * (1 - Math.exp(-(j + 0.5) / TARGET_SCALE));
	const seedLevel = (j: number) => target(j) * (0.6 + Math.random() * 0.8);
	const cancelRate = (j: number) => (j === 0 ? 0 : CANCEL * Math.exp(-0.8 * j));

	let bestBid = 142.3, bestAsk = 142.35; // prices of the touch on each side
	let asks = Float32Array.from({ length: N + 2 }, (_, j) => seedLevel(j));
	let bids = Float32Array.from({ length: N + 2 }, (_, j) => seedLevel(j));
	let flashA = new Float32Array(N + 2), flashB = new Float32Array(N + 2);
	let nextTrade = 0.5;
	let prints: { side: 1 | -1; t: number }[] = [];
	let shownMid = (bestBid + bestAsk) / 2; // eased mid for drawing

	const spreadTicks = () => Math.round((bestAsk - bestBid) / TICK);

	// Drop the touch level: the next level out becomes the touch and the spread widens.
	const popTouch = (side: 'ask' | 'bid') => {
		const s = side === 'ask' ? asks : bids, f = side === 'ask' ? flashA : flashB;
		s.copyWithin(0, 1); s[N + 1] = seedLevel(N + 1);
		f.copyWithin(0, 1); f[N + 1] = 0;
		if (side === 'ask') bestAsk += TICK; else bestBid -= TICK;
	};
	// A new order inside the spread: it becomes the touch and the spread narrows.
	const insideOrder = (side: 'ask' | 'bid') => {
		const s = side === 'ask' ? asks : bids, f = side === 'ask' ? flashA : flashB;
		s.copyWithin(1, 0); s[0] = 3 + Math.random() * 8;
		f.copyWithin(1, 0); f[0] = 0;
		if (side === 'ask') bestAsk -= TICK; else bestBid += TICK;
	};

	// Size churn for one side: empty levels wait for a refill, live levels may be
	// cancelled (likelier near the touch) or otherwise wobble toward their target.
	const churn = (sizes: Float32Array, flash: Float32Array, dt: number, sq: number) => {
		for (let j = 0; j < N + 2; j++) {
			flash[j] = Math.max(0, flash[j] - dt * 1.9);
			if (sizes[j] < 0.5) { if (Math.random() < REFILL * dt) sizes[j] = seedLevel(j) * 0.5; continue; }
			if (Math.random() < cancelRate(j) * dt) { sizes[j] = 0; continue; }
			const tg = target(j);
			sizes[j] = Math.max(0, sizes[j] + (tg - sizes[j]) * REVERT * dt + randn() * Math.max(1.5, NOISE_FRAC * tg) * sq);
		}
	};

	const step = (t: number, dt: number) => {
		const sq = Math.sqrt(dt);
		churn(asks, flashA, dt, sq);
		churn(bids, flashB, dt, sq);
		// Trades hit the touch. Buys get likelier below the anchor price and sells above
		// it, which keeps the drift from wandering off.
		if (t >= nextTrade) {
			nextTrade = t + TRADE_GAP[0] + Math.random() * (TRADE_GAP[1] - TRADE_GAP[0]);
			const mid = (bestBid + bestAsk) / 2;
			const pBuy = Math.min(0.75, Math.max(0.25, 0.5 - ANCHOR_PULL * (mid - ANCHOR)));
			const buy = Math.random() < pBuy;
			const qty = TRADE_QTY[0] + Math.random() * (TRADE_QTY[1] - TRADE_QTY[0]);
			if (buy) { asks[0] = Math.max(0, asks[0] - qty); flashA[0] = 1; } else { bids[0] = Math.max(0, bids[0] - qty); flashB[0] = 1; }
			prints.push({ side: buy ? 1 : -1, t });
			if (prints.length > 24) prints.shift();
		}
		// An empty touch level is gone: the next non-empty level takes over and the spread widens.
		while (asks[0] < 0.5) popTouch('ask');
		while (bids[0] < 0.5) popTouch('bid');
		// Orders inside the spread narrow it; the wider it is, the sooner one arrives.
		const extra = spreadTicks() - 1;
		if (extra > 0) {
			const p = Math.min(1, INSIDE_RATE * extra * dt);
			if (Math.random() < p || extra >= MAX_SPREAD) insideOrder('ask');
			else if (Math.random() < p) insideOrder('bid');
		}
		// Ease the drawn mid toward the real one so shifts glide instead of jumping.
		const mid = (bestBid + bestAsk) / 2;
		shownMid += (mid - shownMid) * Math.min(1, 5 * dt);
	};

	return loop(canvas, (ctx, w, h, t, dt) => {
		if (!reduce) step(t, dt);
		ctx.clearRect(0, 0, w, h);

		const rows = 2 * N + 1;
		const rowH = (h * 0.84) / rows;
		const ym = h / 2;
		const fontPx = Math.max(10, Math.min(13, rowH * 0.55));
		ctx.font = `${fontPx}px ${palette.mono}`;
		ctx.textBaseline = 'middle';
		const priceRight = w * 0.32;
		const barX = w * 0.42, barMax = w * 0.52;
		const barH = Math.max(3, rowH * 0.5);
		const yFor = (price: number) => ym - ((price - shownMid) / TICK) * rowH;

		const drawSide = (sizes: Float32Array, flash: Float32Array, touch: number, dir: 1 | -1, color: string) => {
			for (let j = 0; j < N + 2; j++) {
				const price = touch + dir * j * TICK; // asks go up from their touch, bids down
				const y = yFor(price);
				if (Math.abs(y - ym) > rowH * (N + 0.5)) continue;
				const near = Math.max(0, 1 - Math.abs(price - shownMid) / (TICK * (N + 1)));
				const size = sizes[j];
				const empty = size < 0.5;
				ctx.fillStyle = rgba(palette.ash, (empty ? 0.2 : 0.45) + 0.4 * near);
				ctx.textAlign = 'right';
				ctx.fillText(price.toFixed(2), priceRight, y);
				if (empty) continue;
				const len = Math.min(1, size / TARGET_MAX) * barMax;
				ctx.fillStyle = rgba(color, 0.18 + 0.32 * near);
				ctx.fillRect(barX, y - barH / 2, len, barH);
				if (flash[j] > 0) { ctx.fillStyle = rgba(palette.goldTint, 0.7 * flash[j]); ctx.fillRect(barX, y - barH / 2, len, barH); }
				ctx.fillStyle = rgba(palette.ash, 0.3 + 0.4 * near);
				ctx.textAlign = 'left';
				ctx.fillText(String(Math.round(size)), barX + len + 6, y);
			}
		};
		drawSide(asks, flashA, bestAsk, 1, palette.loss);
		drawSide(bids, flashB, bestBid, -1, palette.gain);
		// Empty ticks inside the spread get a dim price label so the gap reads as a gap.
		ctx.textAlign = 'right';
		ctx.fillStyle = rgba(palette.ash, 0.2);
		for (let p = bestBid + TICK; p < bestAsk - TICK / 2; p += TICK) ctx.fillText(p.toFixed(2), priceRight, yFor(p));

		// Mid line with the mid price, the spread, and the recent trade prints as dots.
		const mid = (bestBid + bestAsk) / 2;
		const yMid = yFor(mid);
		ctx.strokeStyle = rgba(palette.gold, 0.35);
		ctx.lineWidth = 1;
		ctx.beginPath(); ctx.moveTo(w * 0.06, yMid); ctx.lineTo(w * 0.94, yMid); ctx.stroke();
		ctx.fillStyle = palette.gold;
		ctx.textAlign = 'right';
		ctx.font = `500 ${fontPx + 1}px ${palette.mono}`;
		ctx.fillText(mid.toFixed(3), priceRight, yMid);
		ctx.font = `${fontPx}px ${palette.mono}`;
		ctx.fillStyle = rgba(palette.gold, 0.6);
		ctx.textAlign = 'left';
		ctx.fillText(`spread ${(bestAsk - bestBid).toFixed(2)}`, barX, yMid);
		prints.forEach((p, i) => {
			const a = Math.max(0, 1 - (t - p.t) / 4);
			ctx.fillStyle = rgba(p.side > 0 ? palette.gain : palette.loss, a);
			ctx.beginPath(); ctx.arc(w * 0.92 - (prints.length - 1 - i) * 7, yMid, 2, 0, Math.PI * 2); ctx.fill();
		});
	}, { reduce, fps: 30 });
};
