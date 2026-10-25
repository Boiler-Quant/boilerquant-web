// Trims transparent padding from logo PNGs in public/company_logos so each
// logo fills its tile. Only files with an alpha channel are touched; logos
// with solid backgrounds are left alone (trimming them would leave a cropped
// colored block). Run with: node scripts/trim-logos.mjs
import sharp from 'sharp';
import { readdirSync } from 'node:fs';

const dir = 'public/company_logos';
for (const file of readdirSync(dir).sort()) {
  if (!/\.png$/i.test(file)) continue;
  const path = `${dir}/${file}`;
  const meta = await sharp(path).metadata();
  if (!meta.hasAlpha) { console.log(`skip  ${file} (no transparency)`); continue; }
  const { data, info } = await sharp(path).trim({ threshold: 20 }).png().toBuffer({ resolveWithObject: true });
  if (info.width === meta.width && info.height === meta.height) { console.log(`ok    ${file}`); continue; }
  await sharp(data).toFile(path);
  console.log(`trim  ${file} ${meta.width}x${meta.height} -> ${info.width}x${info.height}`);
}
