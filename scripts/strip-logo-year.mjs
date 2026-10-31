// Removes the red year from the conference logo PNG, leaving the artwork intact.
// The year is drawn on top as SVG text by src/components/Logo.astro.
// Usage: npm run logo -- <in.png> <out.png>
import sharp from 'sharp';

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error('Usage: npm run logo -- <in.png> <out.png>');
  process.exit(1);
}

// Where the year sits in the 326×161 logo.
const YEAR_BOX = { x0: 162, x1: 208, y0: 79, y1: 100 };

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let erased = 0;
for (let y = YEAR_BOX.y0; y <= YEAR_BOX.y1; y++) {
  for (let x = YEAR_BOX.x0; x <= YEAR_BOX.x1; x++) {
    const i = (y * info.width + x) * 4;
    const [r, g, b, a] = data.subarray(i, i + 4);
    if (a > 0 && r > g + 30 && r > b + 30) {
      data[i + 3] = 0;
      erased++;
    }
  }
}
await sharp(data, { raw: info }).png().toFile(output);
console.log(`${output}: ${info.width}×${info.height}, erased ${erased} px`);
