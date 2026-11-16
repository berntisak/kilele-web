require('dotenv').config()

const fs = require("fs");
const path = require("path");
const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const markdownIt = require("markdown-it");
const { DateTime } = require("luxon");
const { bundle, browserslistToTargets } = require("lightningcss");
const browserslist = require("browserslist");

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
    // Gives every h2 an id made from its text ("Visa (eTA)" becomes "visa-eta"),
    // so the contents list, and anyone sharing a link, can jump straight to it.
    eleventyConfig.addFilter("sectionIds", (html) => {
        const slugify = eleventyConfig.getFilter("slugify");
        return (html || "").replace(/<h2>(.*?)<\/h2>/g, (match, text) => {
            const id = slugify(text.replace(/<[^>]+>/g, ""));
            return `<h2 id="${id}">${text}</h2>`;
        });
    });
    // Lists a page's sections (each h2 and its id) for the contents list.
    eleventyConfig.addFilter("sections", (html) => {
        const found = (html || "").matchAll(/<h2 id="(.*?)">(.*?)<\/h2>/g);
        return [...found].map(([match, id, text]) => ({ id, text: text.replace(/<[^>]+>/g, "") }));
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

    /**
     * Inlines an SVG from src/ into the template.
     *
     * The red-pipes marks (#137, #138) colour themselves from three custom
     * properties and paint a knockout halo behind the type, so they have to be
     * part of the document to see the page's tokens — an <img src> renders them
     * in their own isolated document and the halo comes out cream on every
     * ground. Passthrough-copied files stay on disk for anything that wants the
     * plain asset; this only adds a way to inline the same file.
     */
    eleventyConfig.addShortcode("svg", (relPath) => {
        const full = path.join(__dirname, "src", relPath);
        if (!fs.existsSync(full)) {
            throw new Error(`svg shortcode: no such file src/${relPath}`);
        }
        return fs.readFileSync(full, "utf8");
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
    
    /**
     * CSS goes through Eleventy as a template format, so each file can be
     * handled on its own (docs/css-rules.md, rule 28):
     *
     * - src/css/site.css is bundled by LightningCSS: its @imports are pulled
     *   into one minified file, the named screen cutoffs (@custom-media)
     *   become real numbers, and nesting is flattened for older browsers.
     * - Files in src/css/kit/ and src/css/pages/ are written nowhere. They
     *   only reach the browser inside site.css.
     * - Everything else is copied as it is: the old stylesheets, until their
     *   pages are rebuilt on the kit, and the stored prototype in
     *   src/css/prototype/ (shown at /prototype/).
     */
    eleventyConfig.addTemplateFormats("css");
    eleventyConfig.addExtension("css", {
        outputFileExtension: "css",
        compileOptions: { cache: false },
        compile: function (content, inputPath) {
            const relPath = path.relative(path.join(__dirname, "src/css"), path.resolve(inputPath));

            if (relPath === "site.css") {
                return () => {
                    const { code } = bundle({
                        filename: path.resolve(inputPath),
                        minify: true,
                        targets: browserslistToTargets(browserslist()),
                        drafts: { customMedia: true },
                    });
                    return code.toString();
                };
            }

            if (relPath.startsWith("kit" + path.sep) || relPath.startsWith("pages" + path.sep)) return;

            return () => content;
        },
    });
    eleventyConfig.addWatchTarget("src/css/");

    

    return {
        dir: {
            input: "src",
            includes: "_includes",
            output: "_site",
        },
        templateFormats: ['md', 'njk', 'html', 'css'],
        markdownTemplateEngine: 'njk',
        htmlTemplateEngine: 'njk',
        dataTemplateEngine: 'njk',
    };
}