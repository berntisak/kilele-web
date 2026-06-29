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

  function showMessage(msg) {
    root.innerHTML =
      '<div class="content__container"><p style="padding:2rem;text-align:center;">' +
      msg +
      "</p></div>";
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
      root.innerHTML = renderPage(rows[0]);
    })
    .catch(function (err) {
      showMessage("Could not load preview: " + (err && err.message ? err.message : "network error"));
    });
})();
