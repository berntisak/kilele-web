# Editable masters of the Kilele mark

The mark chosen in [#137](https://github.com/berntisak/kilele-web/issues/137),
in a form that opens in Affinity, Inkscape and GIMP.

    npm run marks:editable

## Why these exist

The marks that ship — `src/assets/logos/kilele-mark.prototype.svg` and
`kilele-mark-reduced.prototype.svg` — are written for a browser, deliberately.
Three things in them are what desktop editors choke on:

1. **CSS custom properties.** `fill="var(--m-ink)"`, defined in an internal
   `<style>` block. This is what lets one file serve both the cream and the ink
   colourway, taking its colours from the page's tokens. Affinity has no support
   for `var()` at all; Inkscape does not resolve it in presentation attributes
   either. Every fill and stroke resolves to nothing, so the artwork opens
   empty or black.
2. **Live text in Archivo Black.** Without the webfont the editor substitutes,
   and the composition breaks — the legs are cut to specific letterforms, so the
   type is not free to move.
3. **`paint-order="stroke fill"`**, which is what puts the knockout halo
   *behind* the letters. Inkscape honours it; Affinity does not, so the 17px
   cream stroke paints over the type and the letters come out hollow.

The masters here have literal hex values, no `<style>`, the halo as two stacked
draws instead of `paint-order`, and the type as outlines.

## Files

| | |
|---|---|
| `build-editable.mjs` | Generates everything below. **Edit this, not the SVGs.** |
| `kilele-mark.flat.svg` | Full cut, literal values, type still live. Open this to re-set the type. |
| `kilele-mark-reduced.flat.svg` | Reduced cut, same. |
| `kilele-mark.editable.svg` | **The deliverable.** Full cut, outlined. |
| `kilele-mark-reduced.editable.svg` | **The deliverable.** Reduced cut, outlined. |

Both `.editable.svg` files are the cream colourway. For ink, swap
`#0f0f0e` → `#f2eee2` (type and fittings), `#b61212` → `#c74240` (pipes), and
`#f2eee2` → `#0f0f0e` (the halo). The halo is not decoration — it is the slug
beneath the type that keeps a clean gap where a pipe passes behind a letter, and
it is why the mark cannot sit on a photograph or a transparent ground.

Strokes are left as strokes rather than outlined, so weights stay adjustable.
Outline them too if you need the file to survive a printer's workflow.

## How the outlining works

`build-editable.mjs` downloads Archivo Black to a temp directory and hands it to
Inkscape through a throwaway fontconfig file. **Nothing is installed into your
Font Book.** Inkscape must be present; the script looks in the usual places and
says so if it cannot find it.

One thing worth knowing if you ever re-set the type. The flat sources anchor the
run at an explicit pen start, `x="33"`, rather than centring it with
`text-anchor="middle"` the way the shipped files do. The two engines disagree
about centring: CSS letter-spacing adds a space after *every* glyph including
the last, and the browser counts that trailing `-6` in the advance it centres
(594), while Pango, which Inkscape shapes with, does not (600). Centred, the
outlines land exactly 3px left of where the browser draws them — enough to shift
the gaps the legs cut through the letters. `x="33"` is the browser's own
resolved pen position, `330 - 594/2`, so no anchor arithmetic happens and the
two cannot drift.

Verified against the browser rendering with live Archivo Black: ink extents
match to 0.00px, and the remaining hairlines in a difference blend are
antialiasing — they do not thicken under 4× zoom.

## Still to do before this is a real logo asset

Nothing here is hinted, kerned by hand, or trapped for print, and there is no
monochrome or single-colour cut yet. `kilele-favicon.prototype.svg` is a
separate, simplified drawing and is not generated from these.
