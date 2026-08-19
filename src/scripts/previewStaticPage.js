// previewStaticPage.js
// Client-side renderer for the static-page preview (src/pages/preview.html).
// Fetches a single static_pages row by id and renders it exactly like the live
// page (src/pages/static.html) would, without a rebuild.
//
// IMPORTANT — keep in sync (no bundler here, so logic is intentionally duplicated):
//   • renderMarkdown() / sanitize() must match the `markdown` + `sanitize`
//     filters in .eleventy.js (identical to src/scripts/previewNews.js).
//   • The wrapper markup must match src/pages/static.html
//     (.content__container > .about__container > .about__section).
(function () {
  "use strict";

  var root = document.getElementById("preview-root");
  if (!root) return;

  var SUPABASE_URL = window.__SUPABASE_URL;
  var SUPABASE_ANON_KEY = window.__SUPABASE_ANON_KEY;

  var params = new URLSearchParams(window.location.search);
  var id = params.get("id");

  var banner = document.getElementById("preview-banner");

  function showMessage(msg) {
    root.innerHTML =
      '<div class="content__container"><p style="padding:2rem;text-align:center;">' +
      msg +
      "</p></div>";
  }

  /**
   * Replaces the banner's neutral placeholder with the page's real publication
   * state. The build gates static pages on `public === true`
   * (src/_data/staticPages.js), so that column alone decides whether the page is
   * live on the site — the banner must not claim "not yet public" for a page
   * that is already published. Keep in sync with src/scripts/previewNews.js.
   *
   * @param {boolean} isPublic - The row's `public` column, coerced to a boolean.
   */
  function showStatus(isPublic) {
    if (!banner) return;
    banner.classList.add(isPublic ? "preview-banner--public" : "preview-banner--draft");
    banner.textContent = isPublic
      ? "Published — this preview renders the latest saved version, which may differ from the live page until the site rebuilds."
      : "Draft — not public yet. This preview renders the latest saved version.";
  }

  if (!id) {
    showMessage("No page id provided.");
    return;
  }

  // --- Markdown render (keep in sync with .eleventy.js `markdown` filter) ---
  function renderMarkdown(content) {
    var md = window.markdownit({ html: true, linkify: true });
    var html = md.render(content || "");
    // Unwrap <img> from <p> wrappers so adjacent images can sit inline.
    html = html.replace(/<p>\s*((?:<img[^>]*>\s*)+)<\/p>/gi, "$1");
    return html;
  }

  // --- Sanitize (keep in sync with .eleventy.js `sanitize` filter) ---
  function sanitize(html) {
    return window.DOMPurify.sanitize(html, {
      ADD_TAGS: ["iframe"],
      ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "loading", "referrerpolicy", "target"],
      USE_PROFILES: { html: true },
    });
  }

  function escapeHtml(s) {
    return (s == null ? "" : String(s))
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // --- Render the page (mirrors src/pages/static.html) ---
  // The title column is the <h1>; content holds only the Markdown body.
  function renderPage(page) {
    var body = sanitize(renderMarkdown(page.content));
    return (
      '<div class="content__container">' +
        '<div class="about__container">' +
          '<div class="about__section">' +
            '<div class="about__title static-title"><h1>' + escapeHtml(page.title) + "</h1></div>" +
            '<div class="about__text static-content">' +
              body +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  // --- Fetch the single row by id, then render ---
  var fetchUrl =
    SUPABASE_URL +
    "/rest/v1/static_pages?id=eq." + encodeURIComponent(id) +
    "&select=*";

  fetch(fetchUrl, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + SUPABASE_ANON_KEY },
  })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (rows) {
      if (!rows || rows.length === 0) {
        showMessage("Preview not found — the page may have been deleted.");
        return;
      }
      showStatus(rows[0].public === true);
      root.innerHTML = renderPage(rows[0]);
    })
    .catch(function (err) {
      showMessage("Could not load preview: " + (err && err.message ? err.message : "network error"));
    });
})();
