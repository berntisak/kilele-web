// Editable masters of the Kilele mark ("H · Downcomer", #137) for desktop
// vector editors.
//
// The shipped marks in src/assets/logos/*.prototype.svg are browser-first on
// purpose: they colour themselves from --m-ink / --m-red / --m-ground so one
// file serves the cream and ink colourways, and they paint the knockout halo
// with paint-order="stroke fill". Three things in that make them unopenable in
// Affinity, Inkscape and GIMP:
//
//   1. CSS custom properties in presentation attributes. Affinity has no
//      support for var() at all; Inkscape does not resolve it in presentation
//      attributes either. Every fill and stroke resolves to nothing.
//   2. Live text in Archivo Black. Without the webfont the editor substitutes,
//      and the composition breaks — the legs are positioned against specific
//      letterform geometry, so the type is not free to move.
//   3. paint-order="stroke fill", which is what puts the halo BEHIND the
//      letters. Inkscape honours it; Affinity does not, so the 17px cream
//      stroke paints over the type and the letters come out hollow.
//
// This writes flat equivalents: literal hex, no <style>, no var(), and the
// halo as two stacked draws instead of paint-order — then pipes them through
// Inkscape to convert the type to outlines, so the files carry no font
// dependency either.
//
// Run with `npm run marks:editable`. Outputs:
//   *.flat.svg      literal values, type still live — re-set the type here
//   *.editable.svg  the deliverable: outlined, opens anywhere
//
// Geometry is identical to the shipped files. Leg coordinates live here once so
// the two cuts cannot drift.
//
// One deliberate difference from the shipped files: the type is anchored at an
// explicit pen start of x=33 rather than centred with text-anchor="middle".
// The two engines disagree about centring — CSS letter-spacing adds a space
// after EVERY glyph including the last, and the browser counts that trailing
// -6 in the advance it centres (594), while Pango, which is what Inkscape
// shapes with, does not (600). Centred, the outlines land exactly 3px left of
// where the browser draws them, which is enough to break the gaps the legs cut
// through the letters. x=33 is the browser's own resolved pen position
// (330 - 594/2), so no anchor arithmetic happens at all and the two cannot
// drift. Verified: ink extents match to 0.00px.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const INK = "#0f0f0e", RED = "#b61212", GROUND = "#f2eee2";

const UP_FULL = [[46,70],[84,36],[122,82],[214,24],[252,12],[290,48],[434,20],[540,76],[578,42]];
const DN_FULL = [[84,148],[202,130],[252,150],[322,196],[360,348],[400,182],[464,146],[530,194],[578,170]];
const UP_RED  = [[84,36],[252,12],[434,20],[578,42]];
const DN_RED  = [[202,130],[360,348],[530,194]];

function mark({ reduced, note }) {
  const legs = [...(reduced ? UP_RED : UP_FULL), ...(reduced ? DN_RED : DN_FULL)]
    .map(([x, y]) => `      <line x1="${x}" y1="116" x2="${x}" y2="${y}"/>`).join("\n");
  // The blanked-leg flange is sub-pixel in the reduced cut and is dropped there.
  const flange = reduced ? "" : `\n    <rect x="107" y="72" width="30" height="6"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 366" role="img" aria-label="kilele">
  <!--
    Kilele wordmark — "H · Downcomer" (#137)${note}

    EDITABLE MASTER. Cream colourway, literal values, no CSS variables and no
    paint-order — opens in Affinity, Inkscape and GIMP. Generated from
    design-refs/marks/build-editable.mjs; edit that, not this.

    For the ink colourway swap: ${INK} -> ${GROUND} (type and fittings),
    ${RED} -> #c74240 (pipes), ${GROUND} -> ${INK} (the halo).

    The halo is load-bearing, not decoration: it is the cream slug beneath the
    type that keeps a clean gap where a pipe passes behind a letter. It is the
    reason this mark cannot sit on a photograph or a transparent ground.
  -->

  <!-- Pipes: main run, cut off square at both ends, with round-capped legs. -->
  <g stroke="${RED}" stroke-width="17" fill="none">
    <line x1="0" y1="116" x2="612" y2="116" stroke-linecap="butt"/>
    <g stroke-linecap="round">
${legs}
    </g>
  </g>

  <!-- The tittle: a pipe seen end-on, over the dotless i. -->
  <circle cx="202" cy="176.25" r="19.6" fill="none" stroke="${RED}" stroke-width="15.5"/>

  <!-- Fittings: two collars, a valve on a sawn-off feed, an end cap. -->
  <g fill="${INK}" stroke="${INK}">
    <rect x="167" y="103" width="6" height="26"/>
    <rect x="497" y="103" width="6" height="26"/>${flange}
    <rect x="421" y="53" width="26" height="6"/>
    <rect x="447" y="54.5" width="16" height="3"/>
    <circle cx="470" cy="56" r="7" fill="none" stroke-width="3.5"/>
    <rect x="609" y="100" width="7" height="32"/>
  </g>

  <!--
    The wordmark, in two stacked draws rather than one with paint-order:
    first the cream slug that knocks the pipes out, then the ink letters.
  -->
  <g font-family="Archivo Black" font-size="210" letter-spacing="-6" text-anchor="start">
    <text x="33" y="326" fill="${GROUND}" stroke="${GROUND}" stroke-width="17" stroke-linejoin="round">k&#305;lele</text>
    <text x="33" y="326" fill="${INK}">k&#305;lele</text>
  </g>
</svg>
`;
}

const dir = path.dirname(new URL(import.meta.url).pathname);
const CUTS = [
  ["kilele-mark", { reduced: false, note: ", full cut." }],
  ["kilele-mark-reduced", { reduced: true, note: ", reduced cut — the small-size variant, four up-legs and three down." }],
];

for (const [name, opts] of CUTS) {
  fs.writeFileSync(path.join(dir, `${name}.flat.svg`), mark(opts));
  console.log(`wrote ${name}.flat.svg`);
}

/* ---------- outline the type ----------------------------------------
 * Inkscape shapes the run and converts it to paths. Archivo Black is
 * fetched to a temp dir and handed to Inkscape through a throwaway
 * fontconfig file rather than installed — nobody's Font Book gets
 * touched by running a build script.
 * ------------------------------------------------------------------ */

const INKSCAPE = [
  "/Applications/Inkscape.app/Contents/MacOS/inkscape",
  "/usr/bin/inkscape",
  "/usr/local/bin/inkscape",
  "/opt/homebrew/bin/inkscape",
].find((p) => fs.existsSync(p));

if (!INKSCAPE) {
  console.error(
    "\nInkscape not found — the .flat.svg files are written, but their type is\n" +
    "still live and still needs Archivo Black to render. Install Inkscape and\n" +
    "re-run, or open a .flat.svg and convert text to paths by hand."
  );
  process.exit(1);
}

const FONT_URL =
  "https://github.com/google/fonts/raw/main/ofl/archivoblack/ArchivoBlack-Regular.ttf";
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "kilele-marks-"));
const fontDir = path.join(tmp, "fonts");
fs.mkdirSync(fontDir);

const res = await fetch(FONT_URL);
if (!res.ok) throw new Error(`Archivo Black download failed: ${res.status}`);
fs.writeFileSync(path.join(fontDir, "ArchivoBlack-Regular.ttf"), Buffer.from(await res.arrayBuffer()));

const conf = path.join(tmp, "fonts.conf");
fs.writeFileSync(conf, `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
<fontconfig>
  <dir>${fontDir}</dir>
  <dir>/System/Library/Fonts</dir>
  <dir>/Library/Fonts</dir>
  <cachedir>${path.join(tmp, "cache")}</cachedir>
</fontconfig>
`);

for (const [name] of CUTS) {
  execFileSync(INKSCAPE, [
    "--export-text-to-path",
    "--export-plain-svg",
    `--export-filename=${path.join(dir, `${name}.editable.svg`)}`,
    path.join(dir, `${name}.flat.svg`),
  ], { env: { ...process.env, FONTCONFIG_FILE: conf }, stdio: "ignore" });

  const file = path.join(dir, `${name}.editable.svg`);
  let written = fs.readFileSync(file, "utf8");
  if (written.includes("<text")) throw new Error(`${name}: text survived the outline pass`);

  // Inkscape leaves the type-setting attributes on the wrapper group even
  // though it now holds only paths. They describe nothing, and an editor that
  // reads them will report a missing font for a file that has none.
  written = written.replace(
    /(<g\b[^>]*?)((?:\s+(?:font-family|font-size|letter-spacing|text-anchor)="[^"]*")+)/g,
    "$1"
  );
  fs.writeFileSync(file, written);
  console.log(`wrote ${name}.editable.svg`);
}

fs.rmSync(tmp, { recursive: true, force: true });
