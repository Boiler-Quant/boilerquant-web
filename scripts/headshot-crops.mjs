// Square crops for exec headshots so every photo shows the head at the same size,
// close to the top of the frame. process-images.mjs applies these automatically
// when it finds a file listed here; anything not listed is just resized.
//
// To add a person: open the original photo, estimate where the top of the hair
// and the chin sit as fractions of the image height (0 = top, 1 = bottom), and
// the horizontal centre of the face as a fraction of the width. Then run:
//
//   node scripts/process-images.mjs
import sharp from 'sharp';

export const CROPS = {
	'parthH.jpg': { top: 0.06, chin: 0.64, cx: 0.49 },
	'caleb.jpg': { top: 0.09, chin: 0.7, cx: 0.46 },
	'sandi.jpg': { top: 0.18, chin: 0.64, cx: 0.44 },
	'parthG.jpg': { top: 0.18, chin: 0.61, cx: 0.49 },
	'mihika.jpg': { top: 0.19, chin: 0.65, cx: 0.49 },
	'maria.jpg': { top: 0.24, chin: 0.64, cx: 0.49 },
	'nathan.jpeg': { top: 0.07, chin: 0.67, cx: 0.52 },
};

const HEAD = 0.62; // head height (hair to chin) as a fraction of the square
const ABOVE = 0.07; // gap above the hair as a fraction of the square
const SIZE = 900; // output side in px

export async function cropHeadshot(src, dst, spec) {
	const img = sharp(src).rotate(); // apply the camera's orientation tag first
	const meta = await img.metadata();
	const swap = (meta.orientation ?? 1) >= 5; // tag says the photo is stored sideways
	const W = swap ? meta.height : meta.width;
	const H = swap ? meta.width : meta.height;
	const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

	const headPx = (spec.chin - spec.top) * H;
	const side = Math.round(clamp(headPx / HEAD, 1, Math.min(W, H)));
	const top = Math.round(clamp(spec.top * H - ABOVE * side, 0, H - side));
	const left = Math.round(clamp(spec.cx * W - side / 2, 0, W - side));

	await img
		.extract({ left, top, width: side, height: side })
		.resize(SIZE, SIZE)
		.jpeg({ quality: 85, mozjpeg: true })
		.toFile(dst);
	return { side, top, left, headFraction: headPx / side };
}
