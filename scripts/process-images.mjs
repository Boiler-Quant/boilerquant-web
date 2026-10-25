// Sorts and compresses raw images dropped into uploads/ and writes the
// web-ready copies to their homes in the project. Originals are left untouched.
//
//   node scripts/process-images.mjs
//
// Rules (edit JOBS to change them):
//   - Photos  -> src/assets/...  resized to fit 1600px, JPEG quality 85, metadata stripped.
//                Astro further optimises anything in src/assets/ when a page uses it.
//   - Logos   -> public/...      PNGs resized to fit the max size and palette-compressed;
//                SVG/JPG copied as-is. Files in public/ are served exactly as stored.
import sharp from 'sharp';
import { readdirSync, mkdirSync, copyFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const JOBS = [
	{ from: 'uploads/exec_pictures', to: 'src/assets/exec_pictures', kind: 'photo', max: 1600 },
	// Club logo JPGs are the same artwork as the PNGs with no transparency, so only PNGs are kept.
	{ from: 'uploads/bq_content', to: 'public/club_logos', kind: 'logo', max: 2048, skip: (f) => f.endsWith('.jpg') },
	{ from: 'uploads/company_logos', to: 'public/company_logos', kind: 'logo', max: 1600 },
];

const kb = (p) => `${Math.round(statSync(p).size / 1024)}K`;
let totalBefore = 0, totalAfter = 0;

for (const job of JOBS) {
	mkdirSync(job.to, { recursive: true });
	const files = readdirSync(job.from).filter((f) => !f.startsWith('.')).sort();
	console.log(`\n${job.from} -> ${job.to}`);
	for (const f of files) {
		if (job.skip?.(f)) { console.log(`  skip     ${f}`); continue; }
		const src = join(job.from, f);
		const dst = join(job.to, f);
		const ext = extname(f).toLowerCase();
		const fit = { width: job.max, height: job.max, fit: 'inside', withoutEnlargement: true };
		let how;
		if (job.kind === 'photo') {
			// rotate() applies the camera's orientation tag, then metadata is dropped.
			await sharp(src).rotate().resize(fit).jpeg({ quality: 85, mozjpeg: true }).toFile(dst);
			how = 'jpeg';
		} else if (ext === '.png') {
			await sharp(src).resize(fit).png({ palette: true, quality: 90, compressionLevel: 9 }).toFile(dst);
			how = 'png';
		} else {
			copyFileSync(src, dst);
			how = 'copy';
		}
		const meta = await sharp(dst).metadata();
		totalBefore += statSync(src).size; totalAfter += statSync(dst).size;
		console.log(`  ${how.padEnd(8)} ${f.padEnd(26)} ${kb(src).padStart(6)} -> ${kb(dst).padStart(6)}  ${meta.width}x${meta.height}`);
	}
}
console.log(`\nTotal: ${Math.round(totalBefore / 1024)}K -> ${Math.round(totalAfter / 1024)}K`);
