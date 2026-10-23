const tailwindcss = require("eleventy-plugin-tailwindcss-4");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("src/js");
  // CSS riêng theo page (vd: styles/faq.css -> css/faq.css), chỉ copy file được khai báo
  eleventyConfig.addPassthroughCopy({ "src/styles/faq.css": "css/faq.css" });

  eleventyConfig.addPlugin(tailwindcss, {
    input: "styles/main.css",
    output: "assets/main.css",
  });

  // Tắt DOM diffing: ép trình duyệt reload lại trang sạch hoàn toàn khi sửa code,
  // tránh việc các instance SmoothScrollbar và event listener tích tụ gây lag cuộn trang.
  eleventyConfig.setServerOptions({
    domDiff: false,
    domdiff: false,
  });

  const { DateTime } = require("luxon");

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, {
      zone: "utc",
    }).toFormat("yy-MM-dd");
  });

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, {
      zone: "utc",
    }).toFormat("dd-MM-yy");
  });

  // ISO 8601 date for sitemap <lastmod>
  eleventyConfig.addFilter("isoDate", (dateObj) => {
    return new Date(dateObj).toISOString();
  });

  return {
    dir: { input: "src", output: "_site" },
  };
};

