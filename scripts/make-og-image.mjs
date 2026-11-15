// Builds public/og-image.png, the picture shown when a link to the site is pasted into
// iMessage, Slack, LinkedIn, etc. (the "Open Graph" image). Run from the repo root:
//
//   node scripts/make-og-image.mjs
//
// Output is 1200x630 (the size those apps expect): the club mark in gold, centred on
// the site's dark background.
import sharp from 'sharp';
const SRC = 'public/club_logos/bq_logo_gold.png'; // black mark on a gold square
const GOLD = { r: 0xea, g: 0xd9, b: 0x9e }; // --color-gold
const INK = { r: 0x11, g: 0x11, b: 0x11 }; // --color-ink
const W = 1200, H = 630, MARK_W = 560;

// Trim the gold margins down to the mark, then turn "how dark is this pixel" into
// transparency: the black mark becomes opaque, the gold background see-through.
const { data: alpha, info } = await sharp(await sharp(SRC).trim({ threshold: 40 }).toBuffer())
	.resize({ width: MARK_W })
	.greyscale()
	.negate()
	.linear(1.6, -90) // push the (not quite white) gold background all the way to transparent
	.raw()
	.toBuffer({ resolveWithObject: true });

// A flat gold rectangle that uses that transparency, i.e. the mark recoloured gold.
const mark = await sharp({ create: { width: info.width, height: info.height, channels: 3, background: GOLD } })
	.joinChannel(alpha, { raw: { width: info.width, height: info.height, channels: 1 } })
	.png()
	.toBuffer();

await sharp({ create: { width: W, height: H, channels: 3, background: INK } })
	.composite([{ input: mark, gravity: 'centre' }])
	.png({ palette: true, compressionLevel: 9 })
	.toFile('public/og-image.png');
console.log(`public/og-image.png ${W}x${H}`);
