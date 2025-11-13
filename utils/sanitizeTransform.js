
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

module.exports = function(content, outputPath) {
  if (!outputPath || !outputPath.endsWith(".html")) return content;

  // If you want to *only* sanitize pages under /news/ or other collections, add a guard:
  // if (!outputPath.includes("/news/") && !outputPath.includes("/2026/lineup/")) return content;

  try {
    const window = (new JSDOM("")).window;
    const DOMPurify = createDOMPurify(window);

    // Use DOMPurify's html profile (safe defaults). This will remove scripts and event handlers
    // but keep normal tags like <img>, <a>, <p>, etc. So CSS <link> and inline <style> remain untouched
    // because we only sanitize the rendered content block (not the whole template).
    return DOMPurify.sanitize(content, {
      USE_PROFILES: { html: true }
      // If you want to tune allowed tags/attributes, add ALLOWED_TAGS/ALLOWED_ATTR here.
    });
  } catch (err) {
    console.error("sanitizeTransform error:", err);
    return content;
  }
};