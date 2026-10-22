# ReeUsed

Website tĩnh cho nền tảng mua bán đồ cũ & thanh lý **ReeUsed**, xây dựng bằng
[Eleventy 3](https://www.11ty.dev/) + [Nunjucks](https://mozilla.github.io/nunjucks/) + [Tailwind CSS 4](https://tailwindcss.com/).

## Yêu cầu

- Node.js 18 trở lên
- npm

## Cài đặt & chạy

```bash
npm install
```

Chạy môi trường phát triển (tự động reload tại http://localhost:8080):

```bash
npm run serve
```

Build bản production vào thư mục `_site`:

```bash
npm run build
```

Tối ưu lại toàn bộ hình ảnh (xem mục [Hình ảnh](#hình-ảnh)):

```bash
npm run images
```

## Cấu trúc thư mục

```
src/
├── _data/                  # Toàn bộ nội dung dạng JSON
│   ├── contact.json        # ⭐ NGUỒN DUY NHẤT cho hotline / email / địa chỉ / social
│   ├── site.json           # SEO toàn site (tên, mô tả, URL, ảnh OG)
│   ├── navLinks.json       # Menu điều hướng chính
│   ├── footer.json         # Các cột link + copyright ở footer
│   ├── categories.json     # Danh mục sản phẩm
│   ├── newProducts.json    # Sản phẩm mới
│   ├── saleProducts.json   # Sản phẩm giảm giá
│   ├── testimonials.json   # Đánh giá khách hàng
│   ├── about.json          # Nội dung trang giới thiệu / liên hệ
│   ├── store.json          # Nội dung trang cửa hàng
│   └── tradeBanners.json   # Banner thu mua / khám phá
├── _includes/
│   ├── layouts/            # Layout gốc (SEO, header, footer)
│   └── components/         # Header, footer, nav, product-item, icon, form...
├── img/                    # Hình ảnh đã tối ưu (được copy sang _site)
├── _originals/             # Ảnh gốc dung lượng lớn (KHÔNG deploy, chỉ dùng để tối ưu)
├── js/                     # main.js + smooth-scrollbar
├── pages/                  # Các trang: cửa hàng, liên hệ, muốn bán, muốn mua
├── styles/main.css         # Tailwind 4 + CSS tuỳ chỉnh
├── index.njk               # Trang chủ
├── 404.njk                 # Trang báo lỗi 404 (xuất ra /404.html)
├── robots.njk              # Xuất ra /robots.txt
└── sitemap.njk             # Xuất ra /sitemap.xml
```

## Quản lý nội dung

Toàn bộ nội dung nằm trong `src/_data/*.json`, không hard-code trong template.

### Thông tin liên hệ & thương hiệu

`src/_data/contact.json` là **nguồn dữ liệu duy nhất** cho:

- Tên, logo, mô tả thương hiệu
- Hotline, email, địa chỉ, giờ làm việc
- Danh sách chi nhánh
- Mạng xã hội (Facebook, Zalo, TikTok)

Chỉ cần sửa file này, mọi nơi hiển thị thông tin (top bar, footer, trang liên hệ,
nút liên hệ nổi, trang 404) sẽ tự động cập nhật. Không sửa trực tiếp trong template.

### Thêm trang mới

Tạo file `.njk` trong `src/pages/`, khai báo front matter:

```yaml
---
title: Tên trang
layout: layouts/base.njk
permalink: /duong-dan-mong-muon/
description: Mô tả SEO cho trang (tuỳ chọn)
---
```

Trang sẽ tự xuất hiện trong `sitemap.xml`. Nếu muốn thêm vào menu, cập nhật
`src/_data/navLinks.json`.

## Hình ảnh

Ảnh gốc dung lượng lớn được đặt trong `src/_originals/` (không được deploy).
Script `scripts/optimize-images.mjs` dùng [sharp](https://sharp.pixelplumbing.com/)
để tạo phiên bản WebP nhẹ hơn vào `src/img/` cho các ảnh banner, sản phẩm, icon,
logo và tự sinh ảnh Open Graph `og-image.jpg` (1200x630).

```bash
npm run images
```

Quy trình khi thêm ảnh mới:

1. Đặt ảnh gốc vào `src/_originals/` (giữ cấu trúc thư mục nếu cần).
2. Thêm cấu hình job vào `scripts/optimize-images.mjs`.
3. Chạy `npm run images`.
4. Trỏ template/data sang file `.webp` được tạo trong `src/img/`.

Luôn khai báo `width` / `height` và `loading="lazy"` cho ảnh ngoài màn hình đầu tiên
để tránh layout shift.

## SEO

- Meta title/description, canonical, Open Graph, Twitter Card và JSON-LD: `src/_includes/layouts/base.njk`
- `sitemap.xml` tự sinh từ tất cả các trang (trừ 404)
- `robots.txt` trỏ tới sitemap, chặn `/404.html`
- Trang 404 nằm tại `/404.html` — được Netlify, Cloudflare Pages, Vercel và
  GitHub Pages nhận diện tự động

## Triển khai

Chạy `npm run build` và deploy thư mục `_site` lên static hosting
(Cloudflare Pages, Netlify, Vercel...). Build command: `npm run build`,
output directory: `_site`.
