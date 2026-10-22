const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const tailwindcss = require("eleventy-plugin-tailwindcss-4");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("src/js");

  eleventyConfig.addPlugin(tailwindcss, {
    input: "styles/main.css",
    output: "assets/main.css",
  });

  // Tắt DOM diffing: ép trình duyệt reload lại trang sạch hoàn toàn khi sửa code,
  // tránh việc các instance SmoothScrollbar và event listener tích tụ gây lag cuộn trang.
  eleventyConfig.setServerOptions({
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

  return {
    dir: { input: "src", output: "_site" },
  };
};

