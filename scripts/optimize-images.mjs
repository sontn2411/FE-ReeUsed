/**
 * Tối ưu hình ảnh cho ReeUsed.
 *
 * - Đọc ảnh gốc trong src/img/ (giữ nguyên file gốc).
 * - Xuất các phiên bản WebP nhẹ hơn (hoặc PNG cho favicon) ra cùng thư mục.
 * - Chạy lại bất cứ lúc nào: npm run images
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = path.join(ROOT, "src", "_originals");
const IMG_DIR = path.join(ROOT, "src", "img");

const PRODUCTS = [
  "apple-watch",
  "dell-monitor",
  "ipad-air",
  "iphone-13",
  "keychron-k2",
  "kindle-paperwhite",
  "logitech-mouse",
  "macbook-pro",
  "marshall-speaker",
  "nintendo-switch",
  "sony-camera",
  "sony-headphone",
];

/** Mỗi job: 1 file nguồn -> 1 file đích. */
const jobs = [
  // Banner carousel trang chủ: 2 kích thước cho srcset (mobile / desktop)
  ...["banner-01", "banner-02", "banner-03", "banner-about", "banner-store"].flatMap(
    (name) => [
      { src: `${name}.png`, out: `${name}-768.webp`, width: 768 },
      { src: `${name}.png`, out: `${name}-1280.webp`, width: 1280 },
    ],
  ),

  // Banner thu mua / khám phá (trade banner)
  { src: "teach-gadgets-01.png", out: "teach-gadgets-01.webp", width: 900 },
  { src: "teach-gadgets-02.png", out: "teach-gadgets-02.webp", width: 900 },

  // Ảnh sản phẩm: hiển thị tối đa ~300px -> 600px là đủ cho màn hình retina
  ...PRODUCTS.map((name) => ({
    src: `products/${name}.jpg`,
    out: `products/${name}.webp`,
    width: 600,
    height: 600,
    fit: "cover",
    quality: 78,
  })),

  // Họa tiết trang trí lớn trong form liên hệ
  { src: "map-01.png", out: "map-01.webp", width: 800 },
  { src: "faq-01.png", out: "faq-01.webp", width: 800 },
  { src: "policy-01.png", out: "policy-01.webp", width: 800 },

  // Icon nhỏ
  { src: "icon-store.png", out: "icon-store.webp", width: 128 },
  { src: "icon-faq.png", out: "icon-faq.webp", width: 128 },
  { src: "icon-policy.png", out: "icon-policy.webp", width: 128 },

  // Logo hiển thị + favicon + apple-touch-icon
  { src: "logo.png", out: "logo.webp", width: 480, quality: 88 },
  {
    src: "logo.png",
    out: "favicon-64.png",
    width: 64,
    height: 64,
    fit: "contain",
    format: "png",
  },
  {
    src: "logo.png",
    out: "apple-touch-icon.png",
    width: 180,
    height: 180,
    fit: "contain",
    format: "png",
    background: "#ffffff",
  },
];

function formatKB(bytes) {
  return `${Math.round(bytes / 1024)} KB`;
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function run() {
  let totalIn = 0;
  let totalOut = 0;
  let built = 0;
  const missing = [];

  for (const job of jobs) {
    const input = path.join(SRC_DIR, job.src);
    const output = path.join(IMG_DIR, job.out);

    if (!(await exists(input))) {
      missing.push(job.src);
      continue;
    }

    await fs.mkdir(path.dirname(output), { recursive: true });

    const format = job.format || "webp";
    let pipeline = sharp(input);

    if (job.width || job.height) {
      pipeline = pipeline.resize({
        width: job.width,
        height: job.height,
        fit: job.fit || "inside",
        withoutEnlargement: true,
        background:
          format === "png"
            ? job.background || { r: 0, g: 0, b: 0, alpha: 0 }
            : undefined,
      });
    }

    pipeline =
      format === "png"
        ? pipeline.png({ compressionLevel: 9, palette: true })
        : pipeline.webp({ quality: job.quality || 80, effort: 5 });

    await pipeline.toFile(output);

    const inSize = (await fs.stat(input)).size;
    const outSize = (await fs.stat(output)).size;
    totalIn += inSize;
    totalOut += outSize;
    built += 1;

    console.log(
      `✓ ${job.out.padEnd(30)} ${formatKB(inSize).padStart(9)} -> ${formatKB(outSize).padStart(9)}`,
    );
  }

  await buildOgImage();

  if (missing.length) {
    console.warn(`\n⚠ Không tìm thấy ${missing.length} file nguồn trong src/_originals:`);
    missing.forEach((file) => console.warn(`  - ${file}`));
  }

  const saved = totalIn > 0 ? Math.round((1 - totalOut / totalIn) * 100) : 0;
  console.log(
    `\nĐã tạo ${built} file. Tổng dung lượng: ${formatKB(totalIn)} -> ${formatKB(totalOut)} (giảm ${saved}%).`,
  );
}

/**
 * Tạo ảnh chia sẻ mạng xã hội (Open Graph) 1200x630 từ logo.
 * Chỉ chạy khi có sẵn logo gốc.
 */
async function buildOgImage() {
  const logoPath = path.join(SRC_DIR, "logo.png");
  if (!(await exists(logoPath))) return;

  const svg = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0a433c"/>
        <stop offset="100%" stop-color="#0d5a50"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <circle cx="1080" cy="90" r="180" fill="#10b981" opacity="0.15"/>
    <circle cx="90" cy="580" r="220" fill="#34d399" opacity="0.10"/>
    <rect x="150" y="130" width="900" height="240" rx="32" fill="#ffffff"/>
    <text x="600" y="480" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
      font-size="46" font-weight="bold" fill="#ffffff">Mua bán đồ cũ • Thanh lý • Tiết kiệm</text>
    <text x="600" y="545" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
      font-size="30" fill="#a7f3d0">reeused.vn</text>
  </svg>`);

  const logo = await sharp(logoPath)
    .resize({ width: 700, withoutEnlargement: true })
    .png()
    .toBuffer();

  await sharp(svg)
    .composite([{ input: logo, top: 169, left: 250 }])
    .jpeg({ quality: 86 })
    .toFile(path.join(IMG_DIR, "og-image.jpg"));

  console.log("✓ og-image.jpg                   (1200x630, Open Graph)");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
