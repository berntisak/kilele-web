# Glossary

Domain vocabulary for kilele-web. Terms only — no implementation detail.

## Kit

The evergreen design system: everything about how Kilele looks that is the **same every year** — the logo (mark), the colour/type/spacing variables, the typefaces, the shared header and menu, the reusable components, and the red-pipe/concrete motif. Built once and changed deliberately in one place. The Kit is owned in **code**, never in the CMS (see ADR-0001).

## Edition

One year's instance of Kilele (e.g. 2026, 2027): its page(s), the sections they show, that year's **content** (artists, schedule, news — authored in the CMS), and the swappable year label. An Edition is **composed out of the Kit**; it never redefines the Kit.

The Kit/Edition split is the spine of the design architecture: change the look = edit the Kit; run a new year = new Edition content on the same Kit. (See #140.)

## Content

The per-Edition material authored by people and stored in Supabase via the CMS: artists, programme points / schedule, news, gallery, and the text of static pages. Content is the CMS's domain; design is not.

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

## Lead section

The top Section of the front page — the part that changes with the Stage, so the page leads with what matters at that point in the Edition's life.
