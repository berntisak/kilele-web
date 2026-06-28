// previewNews.js
// Client-side renderer for the news preview page (src/news/preview.html).
// Fetches a single news_posts row by id and renders it exactly like the live
// site would, in one of three views: full | card | hero.
//
// IMPORTANT — keep in sync (no bundler here, so logic is intentionally duplicated):
//   • renderMarkdown() / sanitize() must match the `markdown` + `sanitize`
//     filters in .eleventy.js.
//   • resolvePhoto() must match the image_path mapping in src/_data/news.js.
//   • The per-view HTML must match the class structure of src/news/[slug].html
//     (full), src/news/news.html (card), and src/index.html (hero).
(function () {
  "use strict";

  var root = document.getElementById("preview-root");
  if (!root) return;

  var SUPABASE_URL = window.__SUPABASE_URL;
  var SUPABASE_ANON_KEY = window.__SUPABASE_ANON_KEY;

  var params = new URLSearchParams(window.location.search);
  var id = params.get("id");
  var view = params.get("view") || "full";

  function showMessage(msg) {
    root.innerHTML =
      '<div class="content__container"><p style="padding:2rem;text-align:center;">' +
      msg +
      "</p></div>";
  }

  if (!id) {
    showMessage("No post id provided.");
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

  // --- image_path -> public URL (keep in sync with src/_data/news.js) ---
  function resolvePhoto(imagePath) {
    if (!imagePath) return null;
    var baseUrl = SUPABASE_URL + "/storage/v1/object/public/news/";
    return /^https?:\/\//.test(imagePath.trim())
      ? imagePath.trim()
      : baseUrl + encodeURIComponent(imagePath);
  }

  // Matches the Luxon DATE_MED format used by the `postDate` filter.
  function formatDate(iso) {
    if (!iso) return "";
    try {
      return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(iso));
    } catch (e) {
      return iso;
    }
  }

  function escapeHtml(s) {
    return (s == null ? "" : String(s))
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function tagsArray(post) {
    return (post.news_post_tags || []).map(function (r) { return r.tags; }).filter(Boolean);
  }

  // --- View renderers (mirror the live templates) ---

  function renderFull(post) {
    var photo = resolvePhoto(post.image_path);
    var tagHtml = tagsArray(post)
      .map(function (t) { return '<a href="#" class="tag" data-no-swup>' + escapeHtml(t.name) + "</a>"; })
      .join("");
    var body = sanitize(renderMarkdown(post.content));
    return (
      '<article class="content__container">' +
        '<div class="news__section news__section-content active">' +
          '<div class="news__section-header">' +
            "<h3>" + escapeHtml(formatDate(post.publish_date)) + "</h3>" +
            "<div>" + tagHtml + "</div>" +
          "</div>" +
          '<div class="news__section-title">' + escapeHtml(post.title) + "</div>" +
          '<div class="news-post-image">' +
            (photo ? '<img src="' + photo + '" alt="' + escapeHtml(post.title) + '" />' : "") +
          "</div>" +
          '<div class="news__section-text">' + body + "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function renderCard(post) {
    var photo = resolvePhoto(post.image_path);
    var tagHtml = tagsArray(post)
      .slice(0, 2)
      .map(function (t) { return '<span class="small-tag">' + escapeHtml(t.name) + "</span>"; })
      .join("");
    return (
      '<div class="content__container">' +
        '<div class="news-grid">' +
          '<a href="#" class="news-card-link" data-no-swup>' +
            '<div class="news-card">' +
              (photo
                ? '<div class="news-card-image"><img src="' + photo + '" alt="' + escapeHtml(post.title) + '" width="400" height="400" /></div>'
                : "") +
              '<div class="news-card-content">' +
                '<div class="news-card-date-tag">' +
                  escapeHtml(formatDate(post.publish_date)) +
                  '<div class="tags">' + tagHtml + "</div>" +
                "</div>" +
                '<div class="news-card-title">' + escapeHtml(post.title) + "</div>" +
                '<div class="news-card-text">' + escapeHtml(post.excerpt) + "</div>" +
              "</div>" +
            "</div>" +
          "</a>" +
        "</div>" +
      "</div>"
    );
  }

  function renderHero(post) {
    var photo = resolvePhoto(post.image_path);
    if (post.hero_video) {
      return (
        '<div class="hero__wrapper"><div class="content__container">' +
          '<div class="hero__video-section"><a href="#" data-no-swup>' +
            '<div class="hero__section-video">' +
              '<iframe src="' + escapeHtml(post.video_url) + '" title="Hero video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>' +
            "</div>" +
          "</a></div>" +
        "</div></div>"
      );
    }
    var heroText = sanitize(renderMarkdown(post.hero_text));
    return (
      '<div class="hero__wrapper"><div class="content__container">' +
        '<div class="hero__carousel">' +
          '<div class="hero__section active">' +
            '<a href="#" data-no-swup>' +
              '<div class="hero__section-content">' +
                '<div class="hero__section-image">' +
                  (photo ? '<img src="' + photo + '" alt="' + escapeHtml(post.title) + '">' : "") +
                "</div>" +
                '<div class="hero__section-text">' +
                  '<div class="hero__title_text">' + escapeHtml(post.title) + "</div>" +
                  '<span class="hero__info_shout">' + escapeHtml(post.sub_title) + "</span>" +
                  '<div class="hero__info_text">' + heroText + "</div>" +
                "</div>" +
              "</div>" +
            "</a>" +
          "</div>" +
        "</div>" +
      "</div></div>"
    );
  }

  var RENDERERS = { full: renderFull, card: renderCard, hero: renderHero };

  // --- Fetch the single row by id, then render the requested view ---
  var fetchUrl =
    SUPABASE_URL +
    "/rest/v1/news_posts?id=eq." + encodeURIComponent(id) +
    "&select=*,news_post_tags(tag_id,tags(id,name))";

  fetch(fetchUrl, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + SUPABASE_ANON_KEY },
  })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (rows) {
      if (!rows || rows.length === 0) {
        showMessage("Preview not found — the post may have been deleted.");
        return;
      }
      var renderer = RENDERERS[view] || renderFull;
      root.innerHTML = renderer(rows[0]);
    })
    .catch(function (err) {
      showMessage("Could not load preview: " + (err && err.message ? err.message : "network error"));
    });
})();
