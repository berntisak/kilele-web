# Glossary

Domain vocabulary for kilele-web. Terms only — no implementation detail.

## Kit

The evergreen design system: everything about how Kilele looks that is the **same every year** — the logo (mark), the colour/type/spacing variables, the typefaces, the shared header and menu, the reusable components, and the red-pipe/concrete motif. Built once and changed deliberately in one place. The Kit is owned in **code**, never in the CMS (see ADR-0001).

## Edition

One year's instance of Kilele (e.g. 2026, 2027): its page(s), the sections they show, that year's **content** (artists, schedule, news — authored in the CMS), and the swappable year label. An Edition is **composed out of the Kit**; it never redefines the Kit.

The Kit/Edition split is the spine of the design architecture: change the look = edit the Kit; run a new year = new Edition content on the same Kit. (See #140.)

## Content

The per-Edition material authored by people and stored in Supabase via the CMS: artists, programme points / schedule, news, gallery, and the text of static pages. Content is the CMS's domain; design is not.

## News

The articles Kilele publishes on the site, newest first. The front page shows the newest few in its **Latest news** Section.

_Avoid:_ dispatches, posts.

## Stage

Where an Edition is in its yearly life, as far as the front page is concerned. Every Edition passes through four Stages, in order:

1. **Announcement** — the Edition is announced: its theme, open calls, its look. No artists yet.
2. **Lineup** — artists for the Edition are being announced.
3. **Live** — the festival is happening.
4. **Post-festival** — the Edition has just ended and the front page looks back on it.

Only one Edition is current at a time. It stays current through Post-festival, until the next Edition is made current and starts at Announcement. The Stage is set by hand, per Edition, by an admin. It is not inferred from dates.

_Avoid:_ state, phase.

## Section

One full-width horizontal part of a page, stacked top to bottom (e.g. the theme, latest news, the faces grid).

_Avoid:_ band — at a music festival it reads as a musical act.

## Edition title

The Section at the top of the front page that shows the logo with the current Edition's year. It is the same in every Stage; the Lead section below it is what changes.

_Avoid:_ masthead, hero.

## Lead section

The top Section of the front page — the part that changes with the Stage, so the page leads with what matters at that point in the Edition's life.

## Previous edition

The Section of the front page that points back to the Edition before the current one: its lineup, schedule and gallery.

## Upcoming edition

The Section of the front page that presents the current Edition's theme while its festival is still ahead. Once the festival has happened, it disappears.

_Avoid:_ next edition (the current Edition is meant, not the one after it).

## Ground

The surface colour a Section is set on: **cream** (the warm off-white, the default) or **ink** (the near-black). Everything on a Section takes its colours from its Ground, so an ink Section flips to light text by itself.

_Avoid:_ background (too general), theme, dark mode.

## Header bar

The thin strip at the top of every page: the way home on the left, with a few words saying where you are, and the button that opens the index on the right. Part of the **frame** every page shares.

_Avoid:_ press bar, nav, menu bar.

## Footer bar

The strip at the bottom of every page: the Edition's year and Kilele's social channels. Part of the frame.

_Avoid:_ press footer.

## Frame

What every page shares, around its own content: the header bar, the index, the Partners section and the footer bar.

_Avoid:_ chrome, shell, template.

## Index

The full-screen list of the site's pages that opens from the header bar's INDEX button, in groups, with the real number of items behind some of them.

_Avoid:_ menu, nav, hamburger.

## Partners section

The Section at the foot of every page, just above the footer bar, showing the logos of the festival's partners and funders. Not shown on the Partners page itself.

_Avoid:_ partners footer (it is a Section, not part of the footer bar).

## Title block

The part of a text page that introduces it: the logo, the page title and, when the page has sections, the contents list. On a phone it sits above the text; on a wide screen it is the left column and stays in view while the text scrolls.

_Avoid:_ rail, masthead, sidebar (each describes only one of its two positions, or is unclear).

## Contents list

The numbered list of a text page's sections, inside the title block, each line a link that jumps to that section. Only section headings appear in it, never the smaller lead-ins.

_Avoid:_ table of contents, TOC, menu.
