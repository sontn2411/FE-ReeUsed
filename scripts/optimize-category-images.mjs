/**
 * Tối ưu ảnh danh mục (src/_originals/categories -> src/img/categories).
 * Ảnh gốc 850x850 nền trong suốt -> bản 256x256 webp (đủ cho hiển thị 64px @4x).
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = path.join(ROOT, "src", "_originals", "categories");
const OUT_DIR = path.join(ROOT, "src", "img", "categories");

const files = (await fs.readdir(SRC_DIR)).filter((f) => f.endsWith(".webp"));
let before = 0;
let after = 0;

await fs.mkdir(OUT_DIR, { recursive: true });

for (const file of files) {
  const input = path.join(SRC_DIR, file);
  const output = path.join(OUT_DIR, file);

  const inSize = (await fs.stat(input)).size;
  before += inSize;

  await sharp(input)
    .resize({ width: 256, height: 256, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(output);

  const outSize = (await fs.stat(output)).size;
  after += outSize;

  console.log(
    `✓ ${file.padEnd(28)} ${Math.round(inSize / 1024)} KB -> ${Math.round(outSize / 1024)} KB`,
  );
}

console.log(
  `\nTổng: ${Math.round(before / 1024)} KB -> ${Math.round(after / 1024)} KB (giảm ${Math.round((1 - after / before) * 100)}%)`,
);
