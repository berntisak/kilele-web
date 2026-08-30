# Concrete texture: source photographs or synthesise in CSS?

Research for [#133](https://github.com/berntisak/kilele-web/issues/133), under map [#132](https://github.com/berntisak/kilele-web/issues/132).
Date: 2026-08-30. Branch: `research/concrete-texture`.

---

## Recommendation

**Synthesise the whole material layer. Ship no photographic concrete asset.**

The case against synthesis has always been "feTurbulence is too expensive over a full-bleed
ground". That objection is real but it is aimed at the wrong construction. Measured on this
machine (see §3), the cost splits cleanly:

| Construction | Cost |
|---|---|
| `filter: url(#turb)` on a full-viewport element, retina | **636 ms** |
| the *same noise* baked into a 140–420 px SVG tile, repeated | **4.3 ms** |

Same pixels on screen, ~148× the cost, purely because of where the filter sits. feTurbulence is
priced per output pixel (§3), so the fix is not to tune octaves — it is to never let the filter's
output region exceed a tile. Once the noise lives in a small tiled `background-image`, the
performance argument for photography evaporates, and everything else favours synthesis:

- **Weight.** Two blended noise tiles = **712 bytes of CSS**, pre-gzip. The raster equivalent is
  30–100 KB and, in this repo specifically, would be shipped unoptimised (§2, §6).
- **Licence exposure: zero.** No attribution to track, no terms to re-check when the site is
  rebuilt, no risk of the "free for personal use" trap (§1).
- **One system, not three.** Concrete, halftone and hatching all become tiled background layers
  driven by the same custom-property vocabulary (§4). The reference image's four treatments stop
  being four unrelated techniques.
- **It actually looks right.** A single fine-grain tile reads as paper noise, not concrete. But
  *two* tiles at different `baseFrequency` — fine grain over coarse mottling, blended with
  `overlay` + `soft-light` — reads convincingly as parking-garage concrete, with no detectable
  tile repeat across a 1440 px viewport (§3, visual check).

**Keep photography as a targeted escape hatch, not the base layer.** If one hero surface later
needs true photographic aggregate that Perlin noise cannot fake, take it from **ambientCG** or
**Poly Haven** (both genuinely CC0, §1) for that one surface. Never Textures.com — its terms
forbid redistribution, which is what publishing a texture file to a web server is (§1).

**One hard constraint falls out of §5:** the concrete ground dictates **dark text**. Off-white on
concrete measures 1.28–2.11:1 — a straightforward WCAG failure. Near-black on the same ground
measures 6.90–9.01:1. Light text and red text need a solid slab behind them.

---

## 1. Licensing: which sources are genuinely free

### Safe — true CC0, no attribution, commercial use fine

**ambientCG** — the strongest option; a large library of PBR concrete scans.

> "Creative Commons CC0 1.0 Universal License" … "You can copy, modify, distribute and perform the
> assets, even for commercial purposes, all without asking permission."
> — [docs.ambientcg.com/license](https://docs.ambientcg.com/license/)

The licence covers both the downloadable asset files and the material preview renders. Attribution
is optional. The documentation names no Patreon-exclusive carve-out and no trademark restriction on
the assets themselves.

**Poly Haven** — smaller texture library, same licence position.

> "Anyone can then use the work in any way and for any purpose, including commercial purposes"
> — [polyhaven.com/license](https://polyhaven.com/license)

Attribution not required; redistribution allowed. Note the site's *own* branding, logos and
marketing renders stay under copyright — only the assets are CC0.

### Usable but not CC0 — read the carve-outs

**Unsplash** — a bespoke licence, commonly and wrongly described as CC0. The grant is broad:

> "an irrevocable, nonexclusive, worldwide copyright license to download, copy, modify, distribute,
> perform, and use images from Unsplash for free, including for commercial purposes, without
> permission from or attributing the photographer or Unsplash"

but it carries two carve-outs: images "cannot be **sold** without significant modification", and you
may not compile Unsplash images "to replicate a similar or competing service".
— [unsplash.com/license](https://unsplash.com/license)

Neither carve-out bites for a background texture on a festival site. But it is *not* CC0, and the
licence is unilaterally amendable by Unsplash, which CC0 is not.

**Pexels** — similar shape. Attribution not required, commercial use fine, but:
"Don't redistribute or sell the photos and videos on other stock photo or wallpaper platforms",
and no use "as part of your trade-mark, design-mark, trade-name, business name or service mark".
— [pexels.com/license](https://www.pexels.com/license/)

That last clause matters here: this map's destination includes an **evergreen mark**. A Pexels
image must not end up inside the logo.

### The trap — avoid

**Textures.com.** This is the site that appears at the top of every "free concrete texture" search
result, and its free tier is not free in the sense needed here. Its own licensing FAQ states that
**redistribution is not allowed** — the stated reasoning being to keep the materials in one place so
the provenance and terms stay visible. Free accounts get daily credits that unlock only a limited
selection and only smaller sizes. Commercial *website design* for yourself or a client is permitted,
but you may not resell or give away the images as a competing product even when modified, and use on
print-on-demand products is barred.
— [textures.com/support/faq-license](https://www.textures.com/support/faq-license)

The redistribution clause is the problem. Serving a texture file as a static asset from a public web
server is a defensible reading of "redistribution", and the file sits there downloadable at a stable
URL. This is exactly the class of licence that looks free at download time and becomes a liability
later. Rule for this project: **CC0 or nothing.**

---

## 2. Realistic page weight for a raster concrete tile

Measured locally with the repo's own `sharp` (0.35.3), encoding a greyscale concrete-like tile
(low-frequency mottling + high-frequency grain + aggregate specks) and, for comparison, a greyscale
crop of the repo's existing photographic background:

**Synthetic grain tile (worst case for compression — noise is close to incompressible):**

| Tile | PNG-24 | PNG-8 | JPEG q80 | WebP q80 | WebP q65 | AVIF q50 |
|---|---|---|---|---|---|---|
| 256² | 63.7 KB | 33.3 KB | 9.4 KB | 15.6 KB | 11.1 KB | 5.9 KB |
| 512² | 249.3 KB | 129.0 KB | 36.5 KB | 61.2 KB | 44.7 KB | 22.3 KB |
| 1024² | 988.5 KB | 508.7 KB | 145.0 KB | 246.7 KB | 174.0 KB | 89.8 KB |

**Real photographic content (crop of `src/assets/backgrounds/kilele_bg_2026_horiz.jpg`, greyscaled):**

| Tile | PNG-24 | JPEG q80 | WebP q80 | AVIF q55 |
|---|---|---|---|---|
| 256² | 53.9 KB | 7.8 KB | 9.3 KB | 6.5 KB |
| 512² | 228.1 KB | 34.4 KB | 42.3 KB | 27.7 KB |
| 1024² | 567.6 KB | 81.5 KB | 97.7 KB | 66.4 KB |

Three things fall out of this:

1. **PNG is disqualified.** Lossless compression cannot compress grain — a 1024² tile costs ~1 MB.
   This matters because PNG is the instinctive choice for a "texture", and it is the wrong one.
2. **Lossy codecs are cheap precisely because they destroy grain.** JPEG/WebP/AVIF get small by
   discarding high-frequency detail, which in a concrete texture *is the content*. The compression
   win and the visual goal are in direct opposition. You buy a small file by degrading the thing you
   bought the file for.
3. **Retina doubles the required tile.** For 1:1 pixel mapping at `dpr=2` the tile must be encoded at
   twice its CSS footprint, so a 256 CSS-px tile is a 512² image — i.e. **22–45 KB** as a realistic
   floor for a decent-looking retina tile.

**Does a small tile plus blend modes get close to the reference?** Yes — but the blend modes are not
what does the work, the *second scale* is. A single tile at one frequency reads as uniform paper
noise regardless of blend mode. Layering a fine tile over a coarse, low-frequency mottling tile is
what produces the cloudy, uneven ground that reads as concrete. `background-blend-mode` is the
mechanism that combines them, and it "sets how an element's background images should blend with
each other and with the element's background color", does **not** create a stacking context, and has
been Baseline Widely available since January 2020
([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/background-blend-mode)).

Use `background-blend-mode` here, not `mix-blend-mode`. `mix-blend-mode` blends an element with
"the content rendered **behind** the element within the same stacking context", creates a stacking
context, and would drag page content into the blend — which is how texture treatments usually start
tinting the type by accident
([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode)).

**Format choice if a raster ever ships:** WebP. It is supported in "all versions of Chrome, Edge,
Firefox, Opera, and Safari". AVIF compresses better (~50% vs ~30% median against JPEG) but MDN still
advises a `<picture>` fallback because "support is not yet comprehensive (and has little historical
depth)", and AVIF "does not support progressive rendering, so files must be fully downloaded before
they can be displayed" — bad for a full-bleed ground
([MDN Image file types](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types)).
A CSS `background-image` cannot use `<picture>`, so a single universally-supported format is the
only option — see §6.

---

## 3. The crux: can feTurbulence produce concrete, and what does it cost full-bleed?

### What the spec guarantees

feTurbulence "creates an image using the Perlin turbulence function", allowing "the synthesis of
artificial textures like clouds or marble", and — critically for cost — **"The resulting image will
fill the entire filter primitive subregion for this filter primitive."**
([SVG 1.1 §15.24](https://www.w3.org/TR/SVG11/filters.html#feTurbulenceElement))

Two properties of the spec are unusually favourable:

- **The output is byte-identical across engines.** The spec does not describe the algorithm, it
  *publishes it*: "The C code below shows the exact algorithm used for this filter effect", including
  the exact Park–Miller PRNG constants (`RAND_a 16807`, `RAND_m 2147483647`) and a conformance test
  ("the algorithm should produce the result 1043618065 as the 10,000th generated number if the
  original seed is 1"). A given `seed`/`baseFrequency`/`numOctaves` yields the same texture in every
  conforming browser. This is a genuinely stronger reproducibility guarantee than most CSS.
- **Seamless tiling is specified, not improvised.** With `stitchTiles="stitch"` the UA "will
  automatically adjust baseFrequency-x and baseFrequency-y values such that the feTurbulence node's
  width and height … contains an integral number of the Perlin tile width and height for the first
  octave", copying lattice vectors from the opposite edge. Tileability is a spec guarantee, not a
  hand-tuned hack. Default is `noStitch`, so **it must be set explicitly.**

The published C also shows exactly where the cost is: `turbulence()` loops `numOctaves` times per
call, and the spec notes the implementation computes lattice points separately for R, then G, then B,
then A. So cost ≈ *output pixels × octaves × 4 channels*, with each step doing four gradient dot
products and three interpolations. Linear in area. That is the whole story.

### Measured cost

Rasterisation timed via `createImageBitmap()` on an SVG carrying the filter (forces a complete
rasterisation and resolves when done), unique `seed` per run to defeat caching, median of 5.
Apple Silicon Mac, Chrome 148, `dpr=2`, `fractalNoise`, `baseFrequency=0.8`.

**Cost vs surface area (numOctaves=3):**

| Surface | Pixels | Time | µs/pixel |
|---|---|---|---|
| 180×180 tile | 32 K | **4.3 ms** | 0.133 |
| 512×512 tile | 262 K | 33.0 ms | 0.126 |
| 1440×900 (1× viewport) | 1.30 M | 131.4 ms | 0.101 |
| 2880×1800 (2× retina viewport) | 5.18 M | **635.8 ms** | 0.123 |

Cost is **linear in pixel area at ~0.12 µs/px**, exactly as the spec's per-pixel algorithm predicts.
There is no threshold effect and no optimisation to find — the only lever is area.

**Cost vs octaves at 2880×1800 (retina full-bleed):**

| numOctaves | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Time | 317.5 ms | 406.6 ms | 586.1 ms | 821.0 ms | 911.9 ms |

**The same octave counts at 180×180:** 1 → 2.2 ms, 3 → 5.2 ms, 5 → 6.6 ms.

Note what this kills: even at **numOctaves=1**, a retina full-bleed surface costs **318 ms**. Tuning
octaves down does not rescue the full-bleed construction — the area term dominates. Conversely, at
tile scale even 5 octaves costs 6.6 ms, so at tile scale octaves are effectively free and you can use
as much detail as the look wants.

This is a fast desktop. A mid-range Android phone should be assumed several times slower, which puts
a naive full-bleed `filter:` firmly into multi-second territory.

### Where the cost actually lands, and Safari/Firefox

A caveat on this measurement, stated honestly: in a live page Chrome rasterises filters off the main
thread and caches the result, so an earlier attempt to detect the cost via frame timing was
inconclusive — an animated `transform` on a full-bleed filtered element ran at 120 fps because the
transform does not invalidate the cached filter layer. One cold-start run did record a **216.7 ms**
worst frame for a live full-viewport `filter: url(#turb)`. So the 636 ms is a *rasterisation* cost,
paid at first paint and again on every invalidation (resize, zoom, geometry change) — not a
per-frame cost during a transform animation. That is still the wrong cost to pay on a landing page's
first paint, and it is paid again every time the window is resized.

Engine differences worth planning around:

- **Firefox** has a long history here. Mozilla [bug 422371](https://bugzilla.mozilla.org/show_bug.cgi?id=422371)
  ("SVG feTurbulence filter is far too slow") has Robert Longson stating "feTurbulence is not the
  fastest filter in the world and it gets slower as numOctaves increases", with acceptable behaviour
  only up to roughly 7 octaves, and Jonathan Watt noting "Chrome is much faster (on Mac at least)
  when resizing the window". The bug was closed **RESOLVED WORKSFORME** in 2020 after the specific
  hang stopped reproducing — the underlying cost model did not change, only the pathological case.
- **Safari/WebKit** is the real risk for the *live filter* route. There is a long-standing class of
  WebKit issues around SVG filters referenced from CSS and SVG delivered as `background-image` from a
  data URI ([WebKit bug 33630](https://bugs.webkit.org/show_bug.cgi?id=33630)), and Safari is known
  to need `transform: translate3d(0,0,0)` alongside `filter` to avoid a severe interaction slowdown.
  Figma's SVG exporter emits a `BackgroundImageFix` element specifically because Safari fails to draw
  some filtered nodes without it.

The tiled-background route sidesteps most of this: the SVG is rasterised once, at tile size, as an
ordinary image, and no live CSS `filter` is attached to any large element.

**One mandatory attribute.** `color-interpolation-filters` has an initial value of `linearRGB` while
everything else in CSS interpolates in sRGB
([MDN](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/color-interpolation-filters)).
Leave it at the default and the noise's tonal range will not match the CSS colours around it, and has
historically differed between engines. **Set `color-interpolation-filters="sRGB"` on every filter.**

### Does it look like concrete?

Rendered and inspected at 1440×900, `dpr=2`:

- **One fine-grain tile alone: no.** It reads as evenly-distributed paper noise — a film-grain
  overlay, not a material. This is the failure mode most CSS "grain" snippets land in.
- **Fine + coarse, blended: yes.** A 140 px tile at `baseFrequency=0.9, numOctaves=3` (grain) over a
  420 px tile at `baseFrequency=0.035, numOctaves=4` (mottling), blended `overlay, soft-light` over a
  flat `#b9b5ad`, reads convincingly as poured concrete — uneven, cloudy, cold. **No tile repeat was
  detectable** across the full viewport despite the coarse tile repeating ~3.4× horizontally, because
  the low-frequency layer's features are large enough that the eye reads them as variation rather
  than pattern, and the fine layer breaks up the boundaries.

Total cost of that two-layer ground: **712 bytes** of CSS custom properties, before gzip.

What it will *not* give you is genuine photographic aggregate — visible stone, form-tie holes, rebar
staining, chipped edges. Perlin noise is stationary and featureless by construction. If the design
needs a specific piece of real concrete with real damage in it, that is the one case for a photo.

---

## 4. Halftone and hatching, and whether one system covers all four treatments

Yes — all four treatments in the reference can be one system, because all four are
**tiled background layers**. The vocabulary is identical; only the tile differs.

**Hatching — `repeating-linear-gradient`.** Straightforward and robust. Hard colour stops produce
crisp stripes; the repeat length "is the distance between the first and last color stop"
([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/repeating-linear-gradient)).
Verified rendering cleanly at 6 px pitch with 1 px lines. Note gradients have "no intrinsic
dimensions", so the pattern is defined entirely by its stop positions.

**Halftone dots — `radial-gradient` + `background-size`.** Works, with one important measured caveat.
Rendered at three pitches:

- **6 px: fails.** The dots vanish into a flat cream tint — at retina density with a small dot radius,
  the dots average out below the perceptual threshold and the treatment reads as a solid colour.
- **12 px: fragile.** Visible, but thin and prone to moiré.
- **24 px: correct.** Crisp, deliberate, unmistakably a halftone.

**So specify halftone pitch at ≥12 px, and prefer ~16–24 px.** A fine halftone is the treatment most
likely to silently disappear, and it will look fine on the designer's screen and vanish on someone
else's. Also expect some aliasing on the dot edges — Chromium has a long-standing report that
[CSS gradient hard stops are drawn with aliasing](https://bugs.chromium.org/p/chromium/issues/detail?id=408528).

**Alternative worth keeping in mind: SVG `<pattern>`.** With `patternUnits="userSpaceOnUse"` a dot
grid is a single `<circle>` in a sized tile, and `patternTransform` rotates the whole lattice — which
CSS gradients cannot do without rotating the element. Baseline Widely available since July 2015
([MDN](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/pattern)). If the design
wants rotated hatching or a rotated dot lattice, switch that layer to `<pattern>`; it stays inside
the same "tiled background-image" system.

**The unifying shape.** Every treatment is a `--texture-*` custom property holding a tile, composed
onto a flat colour with `background-blend-mode`. The near-black blocks are simply the degenerate
case: a flat colour with no tile. That gives one mental model, four instances:

```
--texture-grain      140px feTurbulence, baseFrequency 0.9,   octaves 3   → fine concrete grain
--texture-mottle     420px feTurbulence, baseFrequency 0.035, octaves 4   → coarse concrete cloud
--texture-halftone   radial-gradient, background-size ≥12px               → dot grid
--texture-hatch      repeating-linear-gradient, 6px pitch                 → line hatching
(none)               flat colour                                          → solid near-black block
```

`mask-image` is also available if a treatment needs to be knocked out rather than blended — it
accepts gradients and SVG and is Baseline Widely available since December 2023
([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image)).

---

## 5. Legibility and accessibility

This is the section with a hard constraint in it, not just advice.

WCAG measures contrast "with respect to the specified background over which the text is rendered in
normal usage"
([Understanding 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)). For a
varying background this is not the *average* — failure technique **F83** is explicit that "there
would need to be sufficient contrast between the text and those parts of the image that are most
like the text and behind the text", and gives exactly our failure mode as an example: "Black text
overlays an image with dark gray areas. Wherever the text crosses a dark gray area the contrast is so
bad that the text cannot be read"
([F83](https://www.w3.org/WAI/WCAG21/Techniques/failures/F83)).

**So the texture's luminance *amplitude* is an accessibility parameter, not just an aesthetic one.**
Contrast must be computed against the texture's darkest and lightest excursions behind the text.

Computed ratios against a plausible palette (`--concrete: #b9b5ad`, with ±luminance excursions
`#cfcbc3` / `#a29e96`; `--off-white: #e8e4dd`; `--near-black: #141414`; `--red: #e0231c`):

| Pair | Ratio | Verdict |
|---|---|---|
| off-white on concrete, light excursion | **1.28:1** | fails badly |
| off-white on concrete, mid | **1.61:1** | fails badly |
| off-white on concrete, dark excursion | **2.11:1** | fails |
| red on concrete, mid | **2.32:1** | fails text *and* fails 3:1 non-text |
| red on near-black | **3.88:1** | fails body text; passes large-text 3:1 |
| near-black on concrete, dark excursion | **6.90:1** | passes AA, passes AAA for large |
| near-black on concrete, mid | **9.01:1** | passes AA comfortably |
| off-white on near-black slab | **14.54:1** | passes AAA |

**Three consequences:**

1. **The concrete ground takes dark text, not light text.** Off-white on concrete is not a marginal
   call — at 1.28:1 it is nearly invisible. Every light-on-concrete composition in the sketches needs
   a solid backing.
2. **Red is a graphic colour, not a text colour.** At 2.32:1 on concrete it fails even the 3:1
   non-text threshold. On near-black it reaches 3.88:1 — usable for large display type and for the
   pipes as *graphic* elements, but not for body copy. Given the map's "red conduit pipes as the key
   element" this is fine and even helpful: it keeps red structural.
3. **Near-black on concrete is comfortably safe** across the whole texture range (6.90–9.01:1), which
   means the default register — dark type on the concrete ground — is the accessible one. The
   register does not have to fight the requirement.

**Mitigations, with the spec's own framing.** G18 names two, and the reference image's own vocabulary
already contains the better one:

- **A solid slab behind the text** — the reference's flat near-black blocks are exactly this, and at
  14.54:1 they are bulletproof. This is the recommended mitigation because it is already part of the
  visual language rather than an accessibility patch bolted on.
- **"Fogging"** — G18 describes text over a campus photo where "the area behind the text is fogged
  white so that the picture is very faint and the maximum darkness is still light enough to maintain
  a 4.5:1 contrast ratio"
  ([G18](https://www.w3.org/WAI/WCAG21/Techniques/general/G18)). In CSS this is a semi-opaque scrim
  layer. Serviceable, but it muddies the material and reads as a compromise.
- **A halo around the text** — G18 also allows this, but it fights the "no decorative softness"
  register and should be avoided here.

**Two further hazards specific to this direction:**

- **Hatching behind text is the F83 example almost verbatim** — "Black text overlays an image with
  black lines. The lines cross behind the letters making F's look like E's". Vertical hatching behind
  vertical letter stems is a specific, predictable legibility failure. **Never put text directly over
  the hatch layer.**
- **Halftone reduces effective contrast unpredictably** because the local background alternates
  between dot and gap. Treat a halftone field as its *darkest* value when computing contrast for
  anything sitting on it.

---

## 6. How this lands in *this* repo

Read of `.eleventy.js` and `scripts/optimize-assets.js`, which materially strengthens the
recommendation:

- **`eleventyImageTransformPlugin` will not touch a CSS background texture.** It is registered
  (`.eleventy.js`) as an *HTML output transform* — it rewrites `<img>` elements in built markup. A
  texture referenced from `src/css/` via `background-image: url(...)` is never seen by it. No
  responsive `srcset`, no automatic AVIF/WebP negotiation, no width variants.
- **`src/assets/` is passthrough-copied verbatim** (`eleventyConfig.addPassthroughCopy("src/assets/")`).
  Whatever byte-for-byte file is committed is what ships. There is no build-time image step for this
  class of asset at all.
- **`optimize-assets.js` is a manual, opt-in, destructive script** (`npm run optimize-assets`) that
  rewrites files **in place**. A new concrete texture would not match any existing rule and would
  fall through to the `fallback` rule: `maxDimension: 2000, jpegQuality: 82`. For a fine-grain
  concrete tile that is close to the worst available choice — JPEG at q82 smooths exactly the
  high-frequency grain the texture exists to provide, and it happens silently, in place, on a file
  someone already tuned. Shipping a raster texture here means *also* adding a bespoke rule to that
  script to protect it.
- **Existing precedent for the ground:** `src/css/global.css` `.background-fixed` is a
  `position: fixed`, `background-size: cover`, full-viewport layer fed by
  `--background-img` / `--background-img-responsive` from `variables.css`, with a `max-width: 1100px`
  swap. Today's asset is 342 KB. A synthesised ground replaces that whole mechanism — including the
  responsive swap, which exists only because a photograph has a fixed aspect ratio. **A tiled texture
  has no aspect ratio and needs no responsive variant.**
- `--secondary: #ff0000` already exists in `variables.css`. Note `#ff0000` on concrete measures worse
  than the `#e0231c` used in §5; if red is promoted, it should be re-picked against the concrete
  ground rather than inherited.

The net: this repo has no image pipeline that would make a raster texture cheap or safe, and one
manual script that would actively degrade it. A CSS-synthesised ground needs no pipeline at all —
it is text in `variables.css`, it gzips with the stylesheet, and it cannot be silently re-encoded.

---

## Method and reproduction

- **Encoding sizes** (§2): Node script using the repo's own `sharp@0.35.3`, generating a synthetic
  grain tile and cropping `src/assets/backgrounds/kilele_bg_2026_horiz.jpg`, encoding at PNG-24 /
  PNG-8 / JPEG q80 mozjpeg / WebP q80 / WebP q65 / AVIF q50–55.
- **Rasterisation timings** (§3): SVG data URIs carrying the filter, rasterised via
  `createImageBitmap()`, unique `seed` per run to defeat the image cache, median of 5 runs.
  Apple Silicon Mac, Chrome 148.0.7778.280, `devicePixelRatio=2`, viewport 1440×900. **Single machine,
  single engine** — the *shape* of the result (linear in area, ~0.12 µs/px, 148× penalty for
  full-bleed) is what generalises; the absolute milliseconds are not a cross-device claim.
- **Contrast ratios** (§5): WCAG 2.x relative-luminance formula computed directly over the candidate
  palette hexes.
- **Visual checks** (§3, §4): rendered in Chrome at 1440×900 `dpr=2` and inspected by screenshot.
  Benchmark and comparison pages were written under `_site/` (gitignored) and removed afterwards;
  they are not part of the repo.

## Sources

Primary sources only; no SEO listicles were used for any load-bearing claim.

**Licensing**
- [ambientCG — License](https://docs.ambientcg.com/license/)
- [Poly Haven — License](https://polyhaven.com/license)
- [Unsplash — License](https://unsplash.com/license)
- [Pexels — License](https://www.pexels.com/license/)
- [Textures.com — License questions](https://www.textures.com/support/faq-license)

**Specs**
- [SVG 1.1 §15.24 `feTurbulence`](https://www.w3.org/TR/SVG11/filters.html#feTurbulenceElement) — includes the normative C reference implementation
- [Filter Effects Module Level 1](https://www.w3.org/TR/filter-effects-1/) — `color-interpolation-filters` initial value

**MDN**
- [`feTurbulence`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence)
- [`color-interpolation-filters`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/color-interpolation-filters)
- [`background-blend-mode`](https://developer.mozilla.org/en-US/docs/Web/CSS/background-blend-mode)
- [`mix-blend-mode`](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode)
- [`repeating-linear-gradient()`](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/repeating-linear-gradient)
- [`radial-gradient()`](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient)
- [SVG `<pattern>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/pattern)
- [`mask-image`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image)
- [Image file type guide (WebP/AVIF support)](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types)

**Accessibility**
- [Understanding SC 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [G18 — Ensuring a contrast ratio of at least 4.5:1](https://www.w3.org/WAI/WCAG21/Techniques/general/G18)
- [F83 — Failure due to background images not providing sufficient contrast](https://www.w3.org/WAI/WCAG21/Techniques/failures/F83)

**Engine behaviour**
- [Mozilla bug 422371 — SVG feTurbulence filter is far too slow](https://bugzilla.mozilla.org/show_bug.cgi?id=422371)
- [WebKit bug 33630 — SVG not rendered as background-image from data URI](https://bugs.webkit.org/show_bug.cgi?id=33630)
- [Chromium bug 408528 — CSS gradient hard stops drawn with aliasing](https://bugs.chromium.org/p/chromium/issues/detail?id=408528)

---

## Open questions this does not settle

- Exact palette values for `--concrete` and its luminance amplitude. §5 assumes a plausible set; the
  real values need picking against the mark once #134-ish tickets land, and the amplitude must then be
  re-checked against F83.
- Whether the synthesised ground survives contact with the actual sketches. The visual check here was
  an isolated swatch, not a composed page.
- Whether any single hero surface warrants a real photographic concrete (the ambientCG escape hatch).
  That is a call for the layout sketches, not for this ticket.
- Motion. If the ground ever animates (`seed` is animatable per spec), every frame is a fresh
  rasterisation and the §3 cost model applies per frame — that would need re-measuring. Recommend
  treating the ground as static.
