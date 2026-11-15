// _data/press.js
//
// Everything the E · Press landing page (#141) needs, derived from live
// Supabase content rather than typed. #138 was explicit that the numbers in
// the sketch — 111 artists, 70 programme points, 5 projects, 125 photographs,
// 28 dispatches — are literal facts about the archive, so they are counted
// here and never written into the template. If the archive grows, the page
// says so on the next build.
//
// This file serves ONE page. It is deliberately not wired into the archive
// pages, which still read lineup/news/gallery directly.

const lineup = require("./lineup.js");
const news = require("./news.js");
const projects = require("./projects.js");
const gallery = require("./gallery.js");
const schedule = require("./schedule.js");

/**
 * The 28 portraits #138 composed E around, in the order they were approved on
 * the canvas, as slugs.
 *
 * The `artists` table has no curation field — no `featured`, no `sort_order` —
 * so there is no way to ask Supabase for "the 28 that should lead". Ordering by
 * name gives an accidental cast (the first alphabetically is a record whose
 * name begins with a space), which is not a lineup grid, it is a directory. So
 * the selection stays here as identifiers and the *content* — photo, name,
 * link — is resolved live. Rename an artist and this keeps working; delete one
 * and the grid backfills rather than holing.
 *
 * Where curation should actually live is not this ticket's to decide.
 */
const FEATURED_SLUGS = [
  "kmru", "mc-yallah", "kampire", "blinky ", "nyokabi-kariuki", "ogoya-nengo",
  "sisso-miko", "youth", "mehmet-aslan", "labdi", "kasiva-mutua", "jim-chuchu",
  "nabalayo", "odd-okoddo", "mxshi", "bizi-bingi", "vallerie-muthoni", "mina",
  "R_R_", "hotkeys", "basthma", "adam-yawe", "jolie", "taamuli", "gravitopia",
  "kichaka", "ngat-maler", "mazera",
];

/**
 * Dispatches that are still `public` in Supabase but are dead content on a
 * landing page.
 *
 * The Open Call 2027 closed, and its two posts are the two most recent in the
 * table — so the obvious "latest three" query puts a closed application form at
 * the top of the front page. That is the same failure that left a closed Open
 * Call at the head of the old nav (#143).
 *
 * PROVISIONAL. A hand-maintained slug list is the honest minimum, not the
 * answer: it needs someone to remember. #142 owns the real rule — most likely
 * an expiry or a campaign flag on `news_posts`, which is a schema change and
 * outside #141. Until then, this list is the rule, and it is wrong the day
 * someone publishes a fourth open-call post without editing this file.
 */
const RETIRED_SLUGS = new Set([
  "still-time-to-apply",
  "kilele-summit-2027-open-call",
]);

/** Portraits per grid row below the 640px breakpoint. Mirrors press.css. */
const NARROW_PER_ROW = 6;

/**
 * Asks Supabase for an image at the size we actually display it.
 *
 * The resize only happens on the `/render/image/public/` endpoint. On
 * `/object/public/` — which is what every _data/*.js builds — a `?width=`
 * query string is accepted and silently ignored: the same 348 KB original
 * comes back with a 200. This page puts 28 portraits above the fold-and-a-bit,
 * so that difference is 9.7 MB against 0.8 MB, which is the difference between
 * a prototype you can judge on a phone and one you cannot.
 *
 * (The same silent no-op is in _data/lineup.js's `photo_path_small`, which the
 * archive pages use. Not touched here — it is not this ticket's page.)
 *
 * `height` + `resize=cover` makes the CDN do the square crop the grid would
 * otherwise do in the browser, so we stop shipping the pixels we throw away.
 * Anything that is not a Supabase object URL — news.js passes external URLs
 * straight through — is returned untouched.
 */
const OBJECT_PATH = "/storage/v1/object/public/";
const RENDER_PATH = "/storage/v1/render/image/public/";

function sized(url, width, height) {
  if (!url || !url.includes(OBJECT_PATH)) return url || null;
  const q = [`width=${width}`, height ? `height=${height}&resize=cover` : null, "quality=75"]
    .filter(Boolean)
    .join("&");
  return `${url.replace(OBJECT_PATH, RENDER_PATH)}?${q}`;
}

/**
 * Every _data source has an error path, and they do not agree on its shape:
 * schedule.js returns a bare `[]` where success returns `{byDay, multiDay}`,
 * and gallery.js returns `{categories, photos}` from one branch and `[]`-ish
 * from another. #141 asks the page to degrade sanely when Supabase returns
 * nothing, and "sanely" starts with the build not dying on `.byDay` of an
 * array — which is exactly what it did the first time this was tested against
 * an unreachable Supabase.
 *
 * (The same latent crash sits in _data/schedule_list.js, which reads
 * `scheduleData.byDay` unguarded. Untouched — not this page.)
 */
const arr = (v) => (Array.isArray(v) ? v : []);
const obj = (v) => (v && !Array.isArray(v) && typeof v === "object" ? v : {});

module.exports = async function () {
  const [artists, allNews, allProjects, galleryData, scheduleData] = (
    await Promise.all([lineup(), news(), projects(), gallery(), schedule()])
  ).map((r, i) => (i === 3 || i === 4 ? obj(r) : arr(r)));

  const programmePoints =
    Object.values(obj(scheduleData.byDay)).flat().length +
    arr(scheduleData.multiDay).length;

  // Several artist names carry stray leading/trailing whitespace in the CMS.
  // The grid captions are uppercase mono at 9px, where a leading space is a
  // visible indent, so trim on the way out rather than trusting the field.
  const clean = (a) => ({
    ...a,
    name: (a.name || "").trim(),
    thumb: sized(a.photo_path, 400, 400),
  });

  const bySlug = new Map(artists.map((a) => [a.slug, a]));
  const picked = FEATURED_SLUGS.map((s) => bySlug.get(s)).filter(Boolean);
  // Backfill so a deleted or unpublished artist leaves a portrait, not a hole.
  const rest = artists.filter((a) => !FEATURED_SLUGS.includes(a.slug) && a.photo_path);
  const featured = [...picked, ...rest].slice(0, 28).map(clean);

  // Latest dispatches: not retired, not the video post (E's card is a still
  // photograph, and the aftermovie post carries no image at all).
  const latestNews = allNews
    .filter((n) => !RETIRED_SLUGS.has(n.slug) && !n.hero_video && n.photo_path)
    .slice(0, 3)
    .map((n) => ({ ...n, thumb: sized(n.photo_path, 900) }));

  const galleryPhotos = arr(galleryData.photos).filter((p) => p && p.url);

  return {
    counts: {
      artists: artists.length,
      programmePoints,
      projects: allProjects.length,
      photographs: galleryPhotos.length,
      dispatches: allNews.filter((n) => !RETIRED_SLUGS.has(n.slug)).length,
    },
    featured,
    /*
     * The grid is two rows of portraits with a pipe run between them, and it
     * shows a different number of faces at each end of the scale: 28 at 1440
     * (7 columns x 2 rows, twice) and 12 at 375 (3 x 2, twice). Every face is
     * rendered and the surplus is hidden in CSS, so `overflow` here and the
     * .faces__cell--overflow rule in press.css are the same fact stated twice
     * — change one and the "and N more" count below stops being true.
     */
    faceRows: [featured.slice(0, 14), featured.slice(14, 28)].map((row) =>
      row.map((a, i) => ({ ...a, overflow: i >= NARROW_PER_ROW }))
    ),
    // "And N more" — two figures, because the grid above them differs.
    remaining: {
      wide: Math.max(artists.length - featured.length, 0),
      narrow: Math.max(artists.length - NARROW_PER_ROW * 2, 0),
    },
    latestNews,
    /*
     * The three ink-band cards. Images are real archive content, not
     * stand-ins: two portraits from the featured set and one photograph
     * from the gallery.
     *
     * A count of zero is never a fact about this archive — it only ever
     * means the fetch failed — so a zero prints nothing rather than
     * "0 artists", which would be the page confidently lying.
     */
    archiveCards: [
      {
        title: "Lineup 2026",
        meta: artists.length ? `${artists.length} artists` : "",
        href: "/2026/lineup/",
        image: featured[0] ? sized(featured[0].photo_path, 900) : null,
      },
      {
        title: "Schedule 2026",
        meta: programmePoints ? `${programmePoints} programme points` : "",
        href: "/2026/schedule/",
        image: featured[2] ? sized(featured[2].photo_path, 900) : null,
      },
      {
        title: "Gallery 2026",
        meta: galleryPhotos.length ? `${galleryPhotos.length} photographs` : "",
        href: "/2026/gallery/",
        image: galleryPhotos.length ? sized(galleryPhotos[0].url, 900) : null,
      },
    ],
  };
};
