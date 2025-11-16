# Kilele Web Copilot Instructions

## Project Overview
**Kilele 2026** is a static site generator project for a festival website built with **Eleventy (11ty)** v3. The site displays lineup, schedule, news, and about pages with a dynamic data layer powered by Supabase.

### Architecture
- **Static Generation**: Eleventy builds HTML from source templates in `src/` → `_site/`
- **CMS Integration**: News, lineup, and schedule data are fetched from Supabase tables at build time
- **Template Engine**: Nunjucks (.html templates with YAML frontmatter)
- **Page Routing**: Permalinks in frontmatter define URL structure; dynamic pagination creates individual pages per item

## Key Build & Development Commands

```bash
npm start       # Runs `eleventy --serve` with live reload on localhost:8080
npm test        # Placeholder (not implemented)
```

**Build Process**: 
- Eleventy scans `src/`, processes templates, executes data files (`_data/*.js`), and outputs to `_site/`
- Data files must `module.exports` an async function that returns data
- Build runs once per start; use `--serve` flag for file watching

## Data Flow & Integration Points

### Supabase Tables
Three tables power dynamic content (queries configured in `_data/`):

| Table | Data File | Pagination | Output |
|-------|-----------|-----------|--------|
| `artists` | `lineup.js` | N/A | Available as `lineup` global in templates |
| `news_posts` | `news.js`, `news_latest.js` | `news` (pagination in `news/[slug].html`) | Individual news posts at `/news/{slug}/` |
| `program_points` | `schedule.js` | N/A | Grouped by weekday at `schedule.html` |

**Environment Variables** (in `.env`):
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLIC_KEY` — Anon key (safe for public queries)

### Image URL Construction
All data files append Supabase Storage base URL + add optional query params:
```javascript
`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/{bucket}/${path}?width=100&quality=70`
```
Buckets: `artists/`, `news/`, `program_points/`

## Template Patterns & Conventions

### Frontmatter Structure
```yaml
---
layout: layouts/base.html          # All pages inherit from base
title: Page Title                  # Used in <title> and page headers
pagination:                        # For dynamic pages (news, schedule, lineup)
  data: dataSourceName
  size: 1                         # Items per page
  alias: itemVariable
  resolve: values                 # Use values() method for object iteration
permalink: "/path/{{ item.slug }}/"
eleventyComputed:                 # Dynamic frontmatter computed at build
  title: "{{ post.title }}"
---
```

### Template Filters & Globals
- `| markdown` — Renders markdown to HTML using markdown-it with HTML linkify enabled
- `| postDate` — Formats ISO date to `MED` locale format (e.g., "Nov 16, 2025")
- `| sanitize` — DOMPurify sanitizes HTML, allows iframe embeds for Substack
- `| safe` — Marks content as safe to bypass auto-escaping (use after `| markdown` or `| sanitize`)

### Common Variables
- `loop.index` — 1-indexed loop counter
- `loop.index0` — 0-indexed counter
- `loop.first`, `loop.last` — Boolean flags

## Directory Structure & File Organization

```
src/
  _data/              # Async data providers (fetch from Supabase)
  _includes/
    basehead.html     # Common <meta>, fonts, CSS links
    layouts/
      base.html       # Default layout with header, nav, Swup integration
      partners.html   # Partner section included in base
  css/                # Copied as-is to _site/css/
    variables.css     # CSS custom properties (--primary, --accent, etc.)
    global.css        # Reset, typography, base styles
    {component}.css   # Page-specific or component styles
  scripts/            # Passed through unchanged
    hero.js           # Hero carousel carousel logic
    menu.js           # Mobile menu toggle
  2026/
    lineup/           # Dynamic pages and listing page
    schedule/         # Dynamic pages and schedule listing
  news/
    news.html         # News listing/archive
    [slug].html       # Dynamic news post page (paginated from news.js)
  about/
    about.html
  index.html          # Homepage with hero carousel + news feed
  assets/             # Images, logos, backgrounds (copied to _site/assets/)
```

**Key Conventions**:
- CSS file names match page/component names (e.g., `lineup.css` for lineup pages)
- All CSS is precompiled; use CSS variables defined in `variables.css`
- Scripts use vanilla JS (no framework)

## Frontend Features & Dependencies

### Carousel/Carousel (Hero)
- **File**: `scripts/hero.js` (6000ms autoplay interval)
- Toggles `.active` class on slides and dots on click/autoplay
- Used on homepage for news highlights carousel

### Client-Side Routing
- **Library**: Swup v4.8.2 (AJAX page transitions)
- Configured in `base.html` with `<div id="swup" class="container transition-fade">`
- Preserves header/nav across page loads with smooth fade transition

### Mobile Menu
- **File**: `scripts/menu.js`
- Toggles mobile menu on `<button class="menu-toggle">` click

### Markdown Parsing
- **Library**: markdown-it with HTML + linkify enabled
- Articles and news posts use `post.content | markdown | sanitize | safe`

### Image Optimization
- **Plugin**: @11ty/eleventy-img auto-transforms images to multiple formats
- Configured to pass through `src/assets/` without optimization (original assets)
- Consider using Supabase Storage image API for dynamic resizing

## Deployment & Building

- **Output**: `_site/` is the static build artifact
- **Watch Files**: `.eleventy.js` monitors `src/css/` for changes (CSS is passed through, not compiled)
- No build step for CSS/JavaScript; changes to `src/css/**` or `src/scripts/**` trigger Eleventy rebuild

## Common Development Tasks

### Adding a News Post
1. Create entry in Supabase `news_posts` table with `public: true`, ISO `publish_date`, and `image_path`
2. Content will auto-populate via `news.js` data provider at next build
3. Page automatically creates `/news/{slug}/` route from pagination config in `news/[slug].html`

### Adding a Lineup Artist
1. Insert artist into `artists` table with `public: true` and optional `photo_path`
2. Accessible in `src/2026/lineup/` templates via `lineup` global
3. Run `npm start` to trigger build and fetch latest data

### Adding Schedule Events
1. Insert `program_points` row with related `category_id`, `venue_id`, and linked artists via `program_point_artists` junction table
2. `schedule.js` joins and groups by weekday; accessible as `schedule` object in templates
3. Start time used for sorting and date grouping (uses Africa/Nairobi timezone)

### Creating a New Page
1. Add `.html` file in `src/` with frontmatter including `layout` and `title`
2. Use `layouts/base.html` for consistency with site navigation
3. Reference global data via Nunjucks variables (e.g., `{% for artist in lineup %}`)

## Performance & Best Practices

- **CSS Variables**: All colors and sizing use CSS custom properties; centralize in `variables.css`
- **Image Paths**: Always use Supabase Storage base URL + path from database; handle null paths gracefully
- **Filters**: Chain filters for safety: `markdown | sanitize | safe` for user content
- **Link Structure**: Use relative paths in templates (e.g., `/news/`, not hardcoded domains)
- **Build Cache**: `.cache/` folder speeds up Eleventy builds; safe to delete if issues occur

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Data not updating | Ensure `.env` vars are set, Supabase is accessible, and `public: true` in database |
| Build fails in CI | Check `.env` is injected; data providers need network access |
| CSS not updating | Verify `src/css/` is in `addWatchTarget`; rebuild with `npm start` |
| Images not loading | Confirm image path in Supabase Storage matches data file URL construction |
