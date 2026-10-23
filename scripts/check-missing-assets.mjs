/**
 * Kiểm tra tất cả tài nguyên /img/... được tham chiếu trong _site có tồn tại thật không.
 * Chạy: node scripts/check-missing-assets.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = path.join(ROOT, "_site");

async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (/\.(html|css|js|xml|txt)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

const refs = new Map();

for (const file of await walk(SITE)) {
  const content = await fs.readFile(file, "utf8");
  const matches = content.matchAll(/["'(](\/img\/[^"')\s?]+)/g);
  for (const m of matches) {
    const ref = m[1];
    if (!refs.has(ref)) refs.set(ref, new Set());
    refs.get(ref).add(path.relative(SITE, file));
  }
}

const missing = [];
for (const [ref, files] of refs) {
  try {
    await fs.access(path.join(SITE, ref));
  } catch {
    missing.push({ ref, usedIn: [...files].slice(0, 3) });
  }
}

console.log(`Tổng tài nguyên /img/ được tham chiếu: ${refs.size}`);
if (missing.length === 0) {
  console.log("✓ Không có tài nguyên thiếu.");
} else {
  console.log(`✗ Thiếu ${missing.length} tài nguyên:`);
  missing.forEach((m) => console.log(`  - ${m.ref}  (dùng trong: ${m.usedIn.join(", ")})`));
  process.exitCode = 1;
}
