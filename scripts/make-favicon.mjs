// Builds the favicon files in public/ from the club logo. Run from the repo root:
//
//   node scripts/make-favicon.mjs
//
// Writes favicon.ico (16 + 32 px), favicon.png (32 px) and apple-touch-icon.png (180 px).
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
const SRC = 'public/club_logos/bq_logo_gold.png';
const GOLD = { r: 0xea, g: 0xd9, b: 0x9e, alpha: 1 }; // --color-gold

// Trim the gold margins down to the mark, then pad back to a square with a little breathing room.
const mark = sharp(SRC).trim({ threshold: 40 });
const { width, height } = await mark.toBuffer({ resolveWithObject: true }).then((r) => r.info);
const side = Math.round(Math.max(width, height) * 1.3);
const base = await sharp(await mark.toBuffer())
	.extend({ top: Math.round((side - height) / 2), bottom: Math.round((side - height) / 2), left: Math.round((side - width) / 2), right: Math.round((side - width) / 2), background: GOLD })
	.flatten({ background: GOLD })
	.png()
	.toBuffer();
console.log({ width, height, side });

const png = (n) => sharp(base).resize(n, n, { kernel: 'lanczos3' }).png().toBuffer();
writeFileSync('public/favicon.png', await png(32));
writeFileSync('public/apple-touch-icon.png', await png(180));

// ICO container with PNG-encoded 16 and 32 px entries (supported by all modern browsers).
const entries = [await png(16), await png(32)];
const sizes = [16, 32];
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(entries.length, 4);
const dir = [];
let offset = 6 + 16 * entries.length;
entries.forEach((buf, i) => {
	const d = Buffer.alloc(16);
	d.writeUInt8(sizes[i], 0); d.writeUInt8(sizes[i], 1); d.writeUInt8(0, 2); d.writeUInt8(0, 3);
	d.writeUInt16LE(1, 4); d.writeUInt16LE(32, 6); d.writeUInt32LE(buf.length, 8); d.writeUInt32LE(offset, 12);
	offset += buf.length; dir.push(d);
});
writeFileSync('public/favicon.ico', Buffer.concat([header, ...dir, ...entries]));
