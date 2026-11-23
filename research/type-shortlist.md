# Industrial type shortlist within Google Fonts

Research for [#134](https://github.com/berntisak/kilele-web/issues/134), under map [#132](https://github.com/berntisak/kilele-web/issues/132).
Investigated 2026-08-30. Branch: `research/type-shortlist` (from `design/red-pipes-prototype`).

**Question.** Which Google Fonts carry an industrial, deadpan, MSCHF-adjacent register — red conduit against
parking-garage concrete, bold but minimalistic, institutional signage quality — across three roles: wide/expanded
display, condensed-or-ultra-heavy wordmark, and monospace for a numbered/indexed layout?

**Hard constraint.** Google Fonts only. Every face below was verified present in the live Google Fonts catalogue
and verified to actually serve bytes from the `css2` API.

## Recommendation (short version)

**Special Gothic Expanded One (display) + Archivo Black (wordmark) + Space Mono 400/700 (index & metadata).**

Latin cost: **46,816 B across 4 woff2 files**, versus Montserrat's **35,508 B** (roman) / **72,628 B** (roman + italic)
today. That is **+11.0 KB** if the site never renders italic Montserrat, **−25.2 KB** if it does.
Full reasoning and two alternatives in [Pairings](#pairings).

---

## Method and sources

Everything below is measured, not recalled.

| What | Source |
| --- | --- |
| Which families exist, their axes, weights, dates | `https://fonts.google.com/metadata/fonts` — Google Fonts' own catalogue JSON (1,946 families as of 2026-08-30) |
| Per-family designer notes | `https://fonts.google.com/metadata/fonts/<Family>` and `ofl/<slug>/{DESCRIPTION.en_us.html,article/ARTICLE.en_us.html}` in [`google/fonts`](https://github.com/google/fonts) |
| Weights, widths, variable axes, OpenType features, digit metrics | the shipped TTF binaries from [`google/fonts`](https://github.com/google/fonts), parsed directly (`fvar`, `GSUB`/`GPOS` FeatureList, `cmap`, `hmtx`, `OS/2`) |
| Network cost | `https://fonts.googleapis.com/css2?…` requested with a Chrome UA, then every `woff2` in the response fetched and measured |
| Register / how it actually looks | specimens rendered in a browser at display size against a dark ground |

Two things the catalogue told us that a secondary write-up would have got wrong:

- **`Archivo Expanded` is not a Google Fonts family.** It is not in the catalogue and
  `css2?family=Archivo+Expanded` returns a 404 HTML page, not CSS. The expanded cuts live only inside the
  `Archivo` variable font's `wdth` axis (max 125).
- **`Big Shoulders Display` has been superseded by `Big Shoulders`.** The old name still resolves at the css2
  endpoint (legacy alias, 35,520 B latin) but is gone from the catalogue; the current family carries a real
  `opsz` axis the old one lacked. Don't hard-code the old name.

### Baseline: what Montserrat costs today

`src/_includes/basehead.html` currently loads:

```
https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap
```

That declares **10 `woff2` files totalling 327,596 B** (cyrillic, cyrillic-ext, latin, latin-ext, vietnamese
× roman/italic). A browser only fetches the subsets it needs, so the honest figure for a latin page is:

- **35,508 B** — latin, roman, full 100–900 weight axis
- **+ 37,120 B** — latin, italic, if any italic text renders (**72,628 B** total)
- **+ 68,224 B** — latin-ext, roman, if any glyph outside Latin-1 appears (artist names with `č`, `ō`, `ş`…)

All comparisons below use **latin / roman** as the common yardstick, and flag latin-ext separately.

---

## The shortlist

Eight faces. Weights, widths, axes, numerals and failure modes are all read off the binaries.

### Role 1 — Wide / expanded grotesques (oversized display)

Google Fonts has exactly **50 families whose `wdth` axis reaches 105 or above** — that is the entire universe of
"can actually go expanded" on this host. Most are Noto scripts, Anek scripts, or soft display faces. Three
survive the register test.

---

#### 1. Special Gothic Expanded One — *the display recommendation*

`https://fonts.google.com/specimen/Special+Gothic+Expanded+One` · Alistair McCready · added 2025

Google Fonts' own article describes it as a contemporary reimagining of early-20th-century Gothic type styles,
made with Special Group for their 15th anniversary. That lineage — American Gothic, Alternate Gothic, transit and
utility signage — is exactly the institutional register the brief asks for.
Flat-sided bowls, a squared-off zero, no geniality anywhere.

- **Weights / widths:** one style only — Regular 400, one fixed expanded width. Static, **not** variable.
- **Variable axes:** none.
- **Numerals:** lining by default. Digits are **proportional** by default (`1` = 479/1000 vs `0` = 912/1000 —
  nearly 2:1). A `tnum` feature **is present** in GSUB, so `font-feature-settings: "tnum"` fixes it. For an
  indexed layout this is mandatory, not optional.
- **Also present:** `case` (all-caps punctuation), `kern`, `ss01`, `liga`, `dlig`, `frac`, `sups`/`subs`.
- **Weakness at display size:** none in the drawing — it is *designed* for size. The real weakness is
  **one weight**. There is no bold, no light, no way to build tonal hierarchy inside the display face; every
  contrast has to come from size, colour or letterspacing. Also only 454 glyphs — latin and latin-ext only,
  no Cyrillic/Greek/Vietnamese (irrelevant here, and it keeps the file small).
- **Cost:** 18,008 B latin / 10,232 B latin-ext. 28,240 B for everything it has.

#### 2. Archivo — *the flexible alternative*

`https://fonts.google.com/specimen/Archivo` · Omnibus-Type (Héctor Gatti) · variable since 2021

Google's description calls it a grotesque sans reminiscent of late-nineteenth-century American typefaces,
originally drawn for highlights and headlines. Same family tree as Special Gothic, one generation earlier.

- **Weights / widths:** `wght` **100–900**, `wdth` **62–125** (ExtraCondensed → Expanded), roman **and** italic
  as a second variable file. 18 named static styles also exist.
- **Variable axes:** `wdth 62–125`, `wght 100–900`. Default instance is SemiBold 600 at width 100.
- **Numerals:** lining by default and *already almost tabular* — digits measure 575–577/1000, a 2-unit drift.
  Full numeral kit in GSUB: **`tnum`, `pnum`, `lnum`, `onum`, `zero`**. Set `tnum` and columns line up exactly.
- **Weakness at display size:** at `wdth 125 / wght 900` the joins in `a`, `e`, `s` tighten noticeably — it is a
  workhorse grotesque pushed to its edge, not a face drawn for that corner. More importantly, see the cost trap
  below: **Google will not serve you a slice of the `wdth` axis.**
- **Cost:** **90,096 B latin** with the `wdth` axis; **34,940 B latin** without it (weight axis only).
  Verified: requesting `wdth,wght@100..125,400..900` returns the *identical file* as `wdth,wght@62..125,100..900`.
  Only *pinning* a single width instances it — `wdth,wght@125,900` is 13,660 B latin, a static cut.

#### 3. Anybody — *the loud one*

`https://fonts.google.com/specimen/Anybody` · Tyler Finck (Etcetera Type Co.) · 2022

Google's description positions it as Eurostile crossed with 1990s influence, running from UltraCondensed to
ExtraExpanded.

- **Weights / widths:** `wght` **100–900**, `wdth` **50–150**, roman + italic (10° slant). Widest useful range
  in the shortlist.
- **Variable axes:** `wdth 50–150`, `wght 100–900`.
- **Numerals:** proportional by default (`1` = 763 vs `3` = 885/2000). **`tnum` present**, plus `pnum`, `zero`, `ss01`.
- **Weakness at display size:** the designer's own note is the warning — a high x-height and low cap height are
  described as deliberately exaggerating the extreme widths. At `wdth 150` the caps look squat and the register
  tips from **institutional** into **sci-fi**. Deadpan is not really its temperament.
- **Cost:** 56,860 B latin / 45,672 B latin-ext.

### Role 2 — Condensed or ultra-heavy grotesques (wordmark)

The existing mark (`src/assets/logos/kilele_logo_noYear.png`) is lowercase `kilele` in a very fat, near-monolinear
**geometric** grotesque: circular tittle, circular `e` bowls, angular `k` leg, under a sound-wave silhouette.
"Related but sharper" therefore means: **keep the fatness, swap the geometric skeleton for a grotesque one** —
flatter sides, tighter apertures, less circle.

---

#### 4. Archivo Black — *the wordmark recommendation*

`https://fonts.google.com/specimen/Archivo+Black` · Omnibus-Type · 2012

Rendered side by side with the current logo, this is the closest relative on Google Fonts: same weight class,
same lowercase proportions, but the `e` bowl is flat-sided and the apertures are cut rather than drawn round.
Sharper, and unmistakably the same species.

- **Weights / widths:** one style — 400 (which *is* the black weight; `usWeightClass` is 400 despite the name).
  Static, one width.
- **Variable axes:** none.
- **Numerals:** **tabular by default** — every digit is exactly 667/1000. No `tnum` needed, and none is present.
- **Weakness at display size:** no `case` feature, so all-caps punctuation (hyphens, parentheses, `@`) will sit
  at lowercase height and needs manual nudging. No `ccmp` and a thin feature set generally. And one weight only.
- **Trap:** **`Archivo Black` is a separate, older family — it is NOT the `wght 900` instance of the `Archivo`
  variable font.** Verified: Archivo Black's digits are 667/1000 uniform, Archivo VF's are ~576 and proportional;
  their feature sets differ; rendered together they are visibly different widths and apertures. Google's own description notes that Archivo Black was derived from Chivo. If both ship, treat them as two families, and never
  assume `font-weight: 900` on `Archivo` will reproduce the mark.
- **Cost:** **9,792 B latin** / 6,400 B latin-ext. The cheapest thing in this document.
  Subsetted to just the wordmark (`&text=KILELE`) it is **736 B**.

#### 5. Special Gothic Condensed One — *the sibling option*

`https://fonts.google.com/specimen/Special+Gothic+Condensed+One` · Alistair McCready · 2025

The condensed cut of the same design as the display face. Choosing this guarantees the mark and the display type
relate, because they are literally the same drawing at two widths.

- **Weights / widths:** one style — Regular 400, one fixed condensed width. Static.
- **Variable axes:** none. (A variable `Special Gothic` also exists: `wdth 75–125`, `wght 400–700`, 72,572 B latin —
  the middle of the family, if you want a ramp instead of three fixed points.)
- **Numerals:** proportional by default (`1` = 253 vs `0` = 461/1000); **`tnum` present**.
- **Weakness at display size:** it is a *normal-weight* condensed, not a fat one. Against the current mark it
  reads as a different idea rather than a sharpened one — a bigger jump than the brief asked for. Also one weight.
- **Cost:** 16,924 B latin / 9,788 B latin-ext.

#### 6. Big Shoulders — *the one with real optical sizing*

`https://fonts.google.com/specimen/Big+Shoulders` · Patric King · relaunched 2025-02-05

Google's description: a condensed American Gothic superfamily built for the Chicago Design System, its forms
rooted in the city's histories of railway transport, political action and dance. Civic-signage provenance;
exactly the right instincts.

- **Weights / widths:** `wght` **100–900**, one width (condensed). Roman only, no italic.
- **Variable axes:** `wght 100–900`, **`opsz 10–72`** — a genuine optical-size axis, the only one in the shortlist.
  Set `opsz` to the rendered size and the face thins its joins and tightens its spacing for display use. This is
  the best-behaved candidate at very large sizes, by construction.
- **Numerals:** **proportional, and there is no `tnum` feature at all.** `1` = 316 vs `2` = 618/2000 — a 2:1 wobble
  with no fix. **Disqualifying for the 001/002/003 register**; usable for a wordmark that contains no digits.
- **Weakness at display size:** none from the drawing. The numeral gap is the problem, plus `opsz` needs
  `font-variation-settings` since CSS `font-optical-sizing` only auto-maps to the rendered `font-size`.
- **Cost:** 58,296 B latin / 45,460 B latin-ext.

### Role 3 — Monospace (indexed register and metadata)

Every monospace considered is **tabular by construction** — all ten digits share one advance — so `tnum` is moot
for all of them. The differences are register, weight range and bytes.

---

#### 7. Space Mono — *the mono recommendation*

`https://fonts.google.com/specimen/Space+Mono` · Colophon Foundry for Google Design · 2016

Google's description names the reference points directly: a geometric foundation with grotesque details drawn
from 1960s headline faces, citing Microgramma and Eurostile. That is the same squared-off, flat-sided vocabulary
as Special Gothic Expanded One — the two share a zero.

- **Weights / widths:** **400 and 700 only**, each with an italic. Static, one width. No variable version.
- **Variable axes:** none.
- **Numerals:** **tabular by default** — every digit 612/1000. Lining by default; `onum` is available as an
  opt-in feature (Google's description mentions old-style figures; they are opt-in, not the default — verified).
  Also `case`, `frac`, `numr`/`dnom`, `sups`/`subs`, `ss01`, `ss02`.
- **Weakness at display size:** two weights is the whole range — no light for quiet metadata, no black for a loud
  index. Its idiosyncratic details (the flared `a`, the ligature set) are charming at 14 px and start to read as
  *quirky* rather than *deadpan* above ~48 px. Use it small, which is what the role wants.
- **Cost:** **9,464 B** (400) + **9,552 B** (700) latin = 19,016 B. 400 alone is 9,464 B.

#### 8. Azeret Mono — *the deadpan maximum*

`https://fonts.google.com/specimen/Azeret+Mono` · Displaay (Martin Vácha, Daniel Quisek) · 2021

Google's description traces it to OCR faces, operating-system interfaces past and imagined, and the nineties.
The most institutional-machine of the set — flat-sided zeros, no warmth at all.

- **Weights / widths:** `wght` **100–900**, roman **and** italic, one width.
- **Variable axes:** `wght 100–900`.
- **Numerals:** tabular by default (650/1000 uniform). Carries `tnum` and `zero` anyway, plus **16 stylistic sets**
  (`ss01`–`ss16`) for alternate `a`, `g`, `l`, slashed zero and so on — a lot of dial-turning available for a
  distinctive indexed voice.
- **Weakness at display size:** its width makes long metadata lines wrap early; and with 16 stylistic sets it is
  easy to end up with an under-specified, drifting look unless the set choices are written into tokens.
- **Cost:** **26,216 B latin** / 14,732 B latin-ext, for the whole 100–900 range in one file.

---

## Considered and rejected

| Face | On Google Fonts | Why not |
| --- | --- | --- |
| **Anton** | yes, 12,004 B latin | **No `tnum` feature at all** and proportional digits (`1` = 677 vs 1012/2048). Numbers visibly wobble and cannot be fixed. Also a 1500/2048 x-height leaves almost no cap-to-x differential — cramped at display size. |
| **League Gothic** | yes, `wdth 75–100`, 18,696 B | Beautiful Alternate Gothic revival (Benton, 1903), but **one weight** and **no `tnum`**, proportional digits. No hierarchy, no index. |
| **Bebas Neue** | yes, 8,596 B | **Effectively all-caps**: the lowercase glyphs are duplicates of the capitals (`a` and `A` both 401/1000; x-height = cap-height = 700). The current mark is lowercase; this cannot render it. Digits are tabular and it has `tnum` — it is just the wrong shape for the job. |
| **Science Gothic** | yes, `wdth 50–200` | The widest thing on Google Fonts, and `tnum` is present. But **95,704 B latin** — the most expensive candidate — and at `wdth 200` the colour goes light and the forms flatten. Its `CTRS` contrast axis is unregistered, so it needs `font-variation-settings`. |
| **Saira**, **Hubot Sans**, **Georama** | yes | Competent expanded grotesques with `tnum`, but 98,760 / 93,348 / 87,948 B latin respectively for a register that Special Gothic Expanded One delivers in 18,008 B. Hubot Sans additionally reads as a developer-brand face (it is GitHub's). |
| **Martian Mono** | yes | Genuinely on-brief — Evil Martians describe its aesthetics as "brutal and eye-catching"; `wght 100–800` + `wdth 75–112.5`, tabular at 750/1000. Rejected only on economics: **38,392 B latin** with the width axis (23,544 B pinned to width 100) against Space Mono's 19,016 B, and its wide advance eats horizontal space in metadata rows. Best swap-in if the mono needs a weight ramp. |
| **Geist Mono** | yes, 23,108 B latin, `wght 100–900` | Clean and tabular, `ss01`–`ss11`. Neutral to a fault — less character than Azeret at the same price. |
| **Chivo Mono** (26,380 B), **DM Mono** (8,688 B, only 300/400/500 static) | yes | Fine, unremarkable. DM Mono is the cheapest mono on the list if bytes dominate. |
| **Datatype** | yes | A monospace with `wdth 50–150` — tempting. But its GSUB has only `calt` and `liga`, **there is no `GPOS` table at all** (no kerning, no mark positioning), no `case`, no `tnum`. 77,312 B latin. Unfinished for production. |
| **Archivo Expanded** | **NO** | Not a Google Fonts family. See [Method](#method-and-sources). |
| **Big Shoulders Display** | deprecated alias | Superseded by `Big Shoulders`. Still resolves at css2 but is out of the catalogue. |

---

## Pairings

Costs are **latin, roman** bytes actually downloaded, measured from the `css2` API. Latin-ext is quoted separately
because it is only fetched if a glyph outside Latin-1 appears (an artist name with `č` or `ș` will trigger it).

### A — RECOMMENDED: Special Gothic Expanded One + Archivo Black + Space Mono 400/700

```html
<link href="https://fonts.googleapis.com/css2?family=Special+Gothic+Expanded+One&family=Archivo+Black&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

| | latin | latin-ext |
| --- | ---: | ---: |
| Special Gothic Expanded One 400 — display | 18,008 B | 10,232 B |
| Archivo Black 400 — wordmark | 9,792 B | 6,400 B |
| Space Mono 400 — index, metadata | 9,464 B | 9,752 B |
| Space Mono 700 — index emphasis | 9,552 B | 9,732 B |
| **Total** | **46,816 B (45.7 KB)** | +36,116 B |

**Versus Montserrat today:** 35,508 B roman → **+11,308 B (+11.0 KB, +32%)**; or 72,628 B roman+italic →
**−25,812 B (−25.2 KB, −36%)**. Four files instead of one, but one stylesheet request either way, and the
`preconnect` hints already in `basehead.html` stay exactly as they are.

**Why this one.** Three faces, three jobs, no overlap. Special Gothic Expanded One and Archivo Black are both
American-Gothic-descended, one generation apart, so the mark reads as family to the display type without being
identical to it. Space Mono's Microgramma/Eurostile skeleton shares the flat-sided zero that Special Gothic uses,
so the index and the display type rhyme. Every numeral role is covered: Archivo Black and Space Mono are tabular
by default, and Special Gothic Expanded One needs one line of CSS.

**What it costs you.** No text face. Three of the four files are one-weight statics, so tonal hierarchy has to come
from size and colour rather than weight — which suits "bold but minimalistic" but leaves nothing for paragraphs.
If real prose appears, add `Archivo:wght@400..700` **without** the `wdth` axis for **+34,940 B latin** (total
81,756 B) — and note Archivo-the-variable will not match Archivo Black.

**Required CSS.**

```css
--font-display: 'Special Gothic Expanded One', 'Archivo Black', system-ui, sans-serif;
--font-mark:    'Archivo Black', system-ui, sans-serif;
--font-mono:    'Space Mono', ui-monospace, SFMono-Regular, monospace;

/* mandatory: display digits are proportional by default */
.display, .index-number { font-feature-settings: "tnum"; }
```

### B — Cheapest that still works: Special Gothic Expanded One + Space Mono 400/700

Drop Archivo Black and set the wordmark in the display face, tracked out. **37,024 B latin (36.2 KB)** —
`+1,516 B` over Montserrat roman, `−35,604 B` against roman+italic. Two families.

Arguably *more* on-register: a deadpan institutional identity that refuses a special logo face is a very MSCHF
move. Rejected as the primary only because the mark then has no voice of its own, and #132 sequences the mark
decision ahead of the layout sketches — the mark should be able to be its own decision.

### C — Maximum flexibility, maximum bytes: Archivo (full `wdth` + `wght`) + Space Mono 400/700

One superfamily covers every role: display at `wdth 125 / wght 900`, wordmark at `wdth 62 / wght 900`, body at
`wdth 100 / wght 400`. Total coherence, real `tnum`, italics included.

**109,112 B latin (106.6 KB)** — **3.1× Montserrat's roman load**, because Google serves the whole `wdth` axis or
none of it. And total coherence is also total sameness: the mark and the display type share one skeleton, so
nothing in the system has its own voice. Only worth it if the sketches turn out to need width as a *live*
design dimension (animating `font-stretch`, width-shifting headlines) rather than two or three fixed points.

---

## Open questions for the next ticket

- **Latin-ext.** The current Montserrat load would pull 68,224 B of latin-ext the moment an artist name needs it.
  Pairing A's latin-ext total is 36,116 B. Worth checking against real Supabase artist names before this is
  treated as a saving.
- **`&text=` subsetting for the mark.** `Archivo+Black&text=KILELE` is **736 B**, and Special Gothic Expanded One
  subsetted the same way is **1,108 B**. Tempting for an above-the-fold mark, at the cost of a second request
  and a cache entry nobody else shares. Decide when the mark is decided.
- **Self-hosting.** Everything here is OFL. If the CSP later permits `self`-hosted fonts, the same files can be
  served from `/assets/fonts/` with no licence question — but #132 fixes Google Fonts as the constraint for now,
  so this is out of scope.
