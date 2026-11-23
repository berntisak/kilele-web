# 1. The design system lives in code, not the CMS

- **Status:** Accepted (2026-11-13) — reversible
- **Context:** #140 (coexistence / architecture), map #132

## Context

kilele-web already has a CMS (a separate Vercel app over Supabase) that non-developers use to author **content**: artists, programme points / schedule, news, and the text of static pages. While planning the whole-site redesign, the question arose: should the *design* elements — colour, logo, typeface — also become CMS-editable, so the look can be tweaked without a code change?

## Decision

**No. The design system (the Kit) lives in code; the CMS keeps owning content only.**

- The Kit is **evergreen** — meant to be locked and stable across editions, not nudged year to year. CMS-editability invites exactly the drift the evergreen premise rejects.
- The colour variables carry **hidden rules**: they are measured so text stays readable and the red motif works on both the cream and ink grounds (there are two reds because one fails a non-text contrast check on dark). A CMS colour-picker would let someone silently break readability or the motif. Code keeps those guardrails enforceable.
- The logo is an **engineered graphic** (edges cut to clear the letters, a knockout halo), not a file swapped through a form.

## Consequences

- Colour / logo / type / components live in `src/css/kit/` and related assets; the CMS surface is unchanged.
- Changing the design is a code change (and a deploy), not a content edit — accepted as the price of integrity.
- **Reversible.** If a real need emerges later to make some design values editable, a constrained, validated subset could be exposed to the CMS without reopening the whole decision.
