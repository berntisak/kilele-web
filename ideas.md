# Ideas / backlog

Loose notes on things worth doing later. Not commitments.

## Analytics: click & event tracking (beyond page views)

**Status:** page views are live via Vercel Web Analytics (script in `src/_includes/layouts/base.html`, enabled in the Vercel project settings). That already covers "how many times an artist / news / project / schedule page was *opened*", because each is its own URL.

Not yet covered — and the natural next step:

- **Clicks that don't cause a navigation, or outbound clicks**, e.g.:
  - clicking an artist/news **card** on a listing page (to see interest even before the page opens),
  - the **ticket** link (mookh.com), Substack, Instagram, and other outbound links,
  - the "Application Form" / Open Call links.
- **How to do it:** Vercel Web Analytics supports custom events. Add small `track()` calls, e.g. on card links and outbound links:
  ```js
  // after the insights script has loaded, window.va is available
  window.va?.('event', { name: 'artist_click', slug: '<artist-slug>' });
  window.va?.('event', { name: 'ticket_click' });
  ```
  Wire these via a tiny delegated listener in a new `src/scripts/trackEvents.js` (loaded like the other scripts, outside `#swup`). Keep event names/props stable so they aggregate cleanly.
- **Attribution / "where is traffic coming from":** tag campaign links with UTM params (`?utm_source=instagram`, `?utm_source=substack`, `?utm_source=partner-eunic`, …) so referrers are unambiguous in the analytics dashboard.

## Per-item view counts shown *inside the CMS*

If we want the view/open count displayed next to each artist / news item **in kilele-cms** (not just in an external analytics dashboard):

- Add a `page_views` table in Supabase (e.g. `path text, entity_type text, entity_slug text, viewed_at timestamptz, referrer text, country text`).
- A tiny client script on kilele-web inserts a row per page view via the **anon key**.
- **RLS is mandatory** (see kilele-cms instructions rule #6): INSERT-only policy for anon (`with check (true)`, no select/update/delete for anon), and a read policy for staff. Consider basic bot filtering and rate limiting to avoid noise.
- Surface aggregates in the CMS (e.g. a "Views" column on the artists/news lists, or a small dashboard).
- **Trade-off:** most control and tightest integration, but the most work (table + RLS + ingestion + bot filtering + dashboards). Only worth it if the in-CMS view is genuinely wanted over an external dashboard.

## Privacy note

Vercel Web Analytics (and alternatives like Umami/Plausible) are cookieless and don't need a consent banner, which fits the European partners and the care/consent ethos in the Code of Conduct. If we ever move to Google Analytics for richer acquisition data, a consent banner becomes required in the EU.
