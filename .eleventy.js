require('dotenv').config()

const fs = require("fs");
const path = require("path");
const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const markdownIt = require("markdown-it");
const { DateTime } = require("luxon");

/**
 * Picks the first candidate path that actually exists inside node_modules.
 *
 * Eleventy silently skips a passthrough copy whose source file is missing, so a
 * dependency that relocates its browser bundle ships a 404 instead of a build
 * error. That is exactly what happened when markdown-it v15 moved its UMD build
 * from `dist/markdown-it.min.js` to `dist/browser/markdown-it.umd.min.js`:
 * /scripts/markdown-it.min.js 404'd in production and the client-side preview
 * page died with "window.markdownit is not a function". Throwing here turns the
 * next such bump into a loud build failure.
 *
 * @param {string[]} candidates - Project-relative paths, most-preferred first.
 * @returns {string} The first candidate that exists on disk.
 */
function resolveVendorScript(candidates) {
    const found = candidates.find((p) => fs.existsSync(path.join(__dirname, p)));
    if (!found) {
        throw new Error(
            "Vendored browser bundle not found — did a dependency move its dist files? Tried: " +
            candidates.join(", ")
        );
    }
    return found;
}

//const imageShortcode = require("./utils/imageShortcode.js");
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

module.exports = function(eleventyConfig) {
    const md = markdownIt({ html: true, linkify: true });
    eleventyConfig.addFilter("markdown", (content) => {
        let html = md.render(content || "");
        // Unwrap <img> tags from <p> wrappers so adjacent images can sit inline
        html = html.replace(/<p>\s*((?:<img[^>]*>\s*)+)<\/p>/gi, '$1');
        return html;
    });
    eleventyConfig.addFilter("postDate", (dateObj) => {
        return DateTime.fromISO(dateObj).toLocaleString(DateTime.DATE_MED);
    });

    // Image shorthand functions
    //eleventyConfig.addNunjucksAsyncFilter("image", imageShortcode);
    //eleventyConfig.addLiquidShortcode("image", imageShortcode); // optional if you use Liquid
    //eleventyConfig.addJavaScriptFunction("image", imageShortcode); // optional for JS templates

    // Sanitize HTML 
    const windowForSanitize = new JSDOM("").window;
    const DOMPurify = createDOMPurify(windowForSanitize);

    // add filter
    eleventyConfig.addFilter("sanitize", function(html) {
    if (!html) return html;
    try {
        return DOMPurify.sanitize(html, {
            ADD_TAGS: ["iframe"],
            ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "loading", "referrerpolicy", "target"],
            USE_PROFILES: { html: true }
        });
    } catch (e) {
        console.error("sanitize filter error", e);
        return html;
    }
    });

    eleventyConfig.addPlugin(eleventyImageTransformPlugin);
    eleventyConfig.addPassthroughCopy("src/assets/");
    eleventyConfig.addPassthroughCopy("src/scripts/");
    eleventyConfig.addPassthroughCopy({ "node_modules/swup/dist/Swup.umd.js": "scripts/swup.umd.js" });
    // Browser builds for the client-side news preview page (src/news/preview.html).
    // These render draft markdown exactly like the build-time `markdown`/`sanitize`
    // filters above, so editors see a faithful preview without a full rebuild.
    eleventyConfig.addPassthroughCopy({
        [resolveVendorScript([
            "node_modules/markdown-it/dist/browser/markdown-it.umd.min.js", // v15+
            "node_modules/markdown-it/dist/markdown-it.min.js",             // v14 and earlier
        ])]: "scripts/markdown-it.min.js",
    });
    eleventyConfig.addPassthroughCopy({
        [resolveVendorScript(["node_modules/dompurify/dist/purify.min.js"])]: "scripts/purify.min.js",
    });
    
    eleventyConfig.addPassthroughCopy("src/css/");
    eleventyConfig.addWatchTarget("src/css/");

    

    return {
        dir: {
            input: "src",
            includes: "_includes",
            output: "_site",
        },
        templateFormats: ['md', 'njk', 'html'],
        markdownTemplateEngine: 'njk',
        htmlTemplateEngine: 'njk',
        dataTemplateEngine: 'njk',
    };
}