// utils/imageShortcode.cjs
const Image = require("@11ty/eleventy-img");
const path = require("path");

module.exports = async function imageShortcode(src, alt = "", sizes = "(min-width: 1024px) 33vw, 100vw") {
  if (!src) return "";

  // If src is a Supabase/public URL already (absolute), eleventy-img can still process it.
  // eleventy-img will fetch remote images when passed an absolute URL.
  const widths = [400, 800, 1200];
  const formats = ["avif", "webp", "jpeg"];

  let metadata;
  try {
    metadata = await Image(src, {
      widths,
      formats,
      outputDir: "./_site/img/",
      urlPath: "/img/",
      // care: if your build runs on Vercel and fetches many remote images it may be slower.
    });
  } catch (err) {
    console.warn("eleventy-img failed for", src, err);
    // fallback: return a plain img tag
    return `<img src="${src}" alt="${alt}" loading="lazy" decoding="async">`;
  }

  const imageAttributes = {
    alt: alt || "",
    sizes,
    loading: "lazy",
    decoding: "async",
  };

  // Image.generateHTML works across formats and widths to produce <picture> markup
  return Image.generateHTML(metadata, imageAttributes);
};
