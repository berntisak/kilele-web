require('dotenv').config()

const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const markdownIt = require("markdown-it");
const { DateTime } = require("luxon");

const imageShortcode = require("./utils/imageShortcode.js");
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

module.exports = function(eleventyConfig) {
    const md = markdownIt({ html: true, linkify: true });
    eleventyConfig.addFilter("markdown", (content) => md.render(content || ""));
    eleventyConfig.addFilter("postDate", (dateObj) => {
        return DateTime.fromISO(dateObj).toLocaleString(DateTime.DATE_MED);
    });

    // Image shorthand functions
    eleventyConfig.addNunjucksAsyncFilter("image", imageShortcode);
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
            ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "loading", "referrerpolicy"],
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