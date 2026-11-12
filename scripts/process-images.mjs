// Sorts and compresses raw images dropped into uploads/ and writes the
// web-ready copies to their homes in the project. Originals are left untouched.
//
//   node scripts/process-images.mjs
//
// Rules (edit JOBS to change them):
//   - Photos  -> src/assets/... or src/content/...  resized to fit the max size, saved as
//                JPEG quality 85, metadata stripped (PNG/HEIC/etc. become .jpg).
//                Astro further optimises these when a page uses them.
//   - Logos   -> public/...      PNGs resized to fit the max size and palette-compressed;
//                SVG/JPG copied as-is. Files in public/ are served exactly as stored.
//   - A job with `nested: true` keeps one level of subfolders, so
//     uploads/news/f25_trek/pic.png -> src/content/news/images/f25_trek/pic.jpg.
import sharp from 'sharp';
import { readdirSync, mkdirSync, copyFileSync, statSync, existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { CROPS, cropHeadshot } from './headshot-crops.mjs';

const JOBS = [
	{ from: 'uploads/exec_pictures', to: 'src/assets/exec_pictures', kind: 'photo', max: 1600 },
	// News photos: one subfolder per post, named after the post's .md file.
	// Reference them from the post as ./images/<post>/<file>.jpg
	{ from: 'uploads/news', to: 'src/content/news/images', kind: 'photo', max: 1600, nested: true },
	// Club logo JPGs are the same artwork as the PNGs with no transparency, so only PNGs are kept.
	{ from: 'uploads/bq_content', to: 'public/club_logos', kind: 'logo', max: 2048, skip: (f) => f.endsWith('.jpg') },
	{ from: 'uploads/company_logos', to: 'public/company_logos', kind: 'logo', max: 1600 },
];

const kb = (p) => `${Math.round(statSync(p).size / 1024)}K`;
let totalBefore = 0, totalAfter = 0;

// Lists the image files in a folder, ignoring dotfiles such as .DS_Store.
const listFiles = (dir) => readdirSync(dir).filter((f) => !f.startsWith('.') && statSync(join(dir, f)).isFile()).sort();
const listDirs = (dir) => readdirSync(dir).filter((f) => !f.startsWith('.') && statSync(join(dir, f)).isDirectory()).sort();

async function processFile(job, src, toDir) {
	const f = basename(src);
	const ext = extname(f).toLowerCase();
	const fit = { width: job.max, height: job.max, fit: 'inside', withoutEnlargement: true };
	let dst = join(toDir, f);
	let how;
	if (job.kind === 'photo' && CROPS[f]) {
		await cropHeadshot(src, dst, CROPS[f]);
		how = 'crop';
	} else if (job.kind === 'photo') {
		// Photos always come out as JPEG, so a .png or .heic upload becomes .jpg.
		dst = join(toDir, f.slice(0, -ext.length) + '.jpg');
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
	console.log(`  ${how.padEnd(8)} ${basename(dst).padEnd(26)} ${kb(src).padStart(7)} -> ${kb(dst).padStart(6)}  ${meta.width}x${meta.height}`);
}

async function processFolder(job, fromDir, toDir) {
	mkdirSync(toDir, { recursive: true });
	console.log(`\n${fromDir} -> ${toDir}`);
	for (const f of listFiles(fromDir)) {
		if (job.skip?.(f)) { console.log(`  skip     ${f}`); continue; }
		await processFile(job, join(fromDir, f), toDir);
	}
}

for (const job of JOBS) {
	if (!existsSync(job.from)) continue; // nothing dropped in this folder
	if (job.nested) {
		for (const sub of listDirs(job.from)) await processFolder(job, join(job.from, sub), join(job.to, sub));
	} else {
		await processFolder(job, job.from, job.to);
	}
}
console.log(`\nTotal: ${Math.round(totalBefore / 1024)}K -> ${Math.round(totalAfter / 1024)}K`);
