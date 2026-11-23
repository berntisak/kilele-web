# Landing page direction sketches (#138)

Working files for the design canvas that resolved
https://github.com/berntisak/kilele-web/issues/138.

Canvas: https://claude.ai/code/artifact/17659f28-0169-4e97-9c32-23f9fb9f7576

- `build.mjs` generates all ten `.dc.html` artboards plus `canvas.json`.
  Edit it, never the artboards — they are output.
- `make-grain.mjs` writes `img/grain.png`, the tiled print grain. It is a
  dependency-free PNG writer; per #133 the noise is baked into a small
  repeating tile rather than run as a live full-bleed filter.
- `artists.json` is the portrait manifest, with the Supabase source URL of
  each image kept for provenance.
- `img/` holds downsampled copies of real Supabase content — 28 artist
  portraits, 3 news photos and the 2026 background — embedded because the
  canvas cannot fetch across origins.

Five directions, each at 1440 and at 375: A · Index, B · Statement,
C · Archive, D · Opener, E · Press. **E won.** A–D are kept so the
resolution stays legible.

Regenerate and republish:

    node make-grain.mjs && node build.mjs
    node <design-skill>/seed-canvas.mjs --template <...>/payload.template.html \
      --out kilele-landing-directions.html --title "Kilele Landing Directions" \
      --artboard Main.dc.html ... --canvas canvas.json
