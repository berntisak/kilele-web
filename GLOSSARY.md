# Glossary

Domain vocabulary for kilele-web. Terms only — no implementation detail.

## Kit

The evergreen design system: everything about how Kilele looks that is the **same every year** — the logo (mark), the colour/type/spacing variables, the typefaces, the shared header and menu, the reusable components, and the red-pipe/concrete motif. Built once and changed deliberately in one place. The Kit is owned in **code**, never in the CMS (see ADR-0001).

## Edition

One year's instance of Kilele (e.g. 2026, 2027): its page(s), the sections they show, that year's **content** (artists, schedule, news — authored in the CMS), and the swappable year label. An Edition is **composed out of the Kit**; it never redefines the Kit.

The Kit/Edition split is the spine of the design architecture: change the look = edit the Kit; run a new year = new Edition content on the same Kit. (See #140.)

## Content

The per-Edition material authored by people and stored in Supabase via the CMS: artists, programme points / schedule, news, gallery, and the text of static pages. Content is the CMS's domain; design is not.
