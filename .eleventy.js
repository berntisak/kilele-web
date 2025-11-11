require('dotenv').config()
const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const markdownIt = require("markdown-it");
const { DateTime } = require("luxon");

const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

module.exports = function(eleventyConfig) {
    const md = markdownIt({ html: true, linkify: true });
    eleventyConfig.addFilter("markdown", (content) => md.render(content || ""));
    eleventyConfig.addFilter("postDate", (dateObj) => {
        return DateTime.fromISO(dateObj).toLocaleString(DateTime.DATE_MED);
    });

    eleventyConfig.addPlugin(eleventyImageTransformPlugin);
    eleventyConfig.addPassthroughCopy("src/assets/");
    eleventyConfig.addPassthroughCopy("src/scripts/");
    
    eleventyConfig.addPassthroughCopy("src/css/");
    eleventyConfig.addWatchTarget("src/css/");

    // Create DOMPurify instance
    const window = (new JSDOM("")).window;
    const DOMPurify = createDOMPurify(window);

    // broadened lists so CSS, images, and meta tags survive
    const ALLOWED_TAGS = false; // allow all standard HTML5 tags
    const ALLOWED_ATTR = false; // allow all safe attributes

    
    eleventyConfig.addTransform("sanitizeHtml", (content, outputPath) => {
    if (outputPath && outputPath.endsWith(".html")) {
        try {
        return DOMPurify.sanitize(content, {
            ALLOW_UNKNOWN_PROTOCOLS: true,
            USE_PROFILES: { html: true },
            ALLOWED_TAGS,
            ALLOWED_ATTR,
        });
        } catch (err) {
        console.error("Sanitization error:", err);
        return content;
        }
    }
    return content;
    });
    

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