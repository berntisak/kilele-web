import { writeFileSync, mkdirSync } from 'node:fs';
import {
  markE, favE, markF, favF, markG, favG, markH, favH, DEVICES,
} from './round2.mjs';

const OUT = process.argv[2] || '.';
mkdirSync(OUT, { recursive: true });

const AB = `'Archivo Black','Arial Black',sans-serif`;
const SG = `'Special Gothic Expanded One','Arial Black',sans-serif`;
const SM = `'Space Mono',ui-monospace,monospace`;

/* ------------------------------------------------------------------ *
 * The four marks. Every coordinate is derived from measured Archivo
 * Black / Special Gothic metrics, not eyeballed:
 *   Archivo Black 210px  — ascender ink 152.3, x-height 113.4
 *   "kilele"  210/-6 letter-spacing → advance run 594
 *   "kılele"  230/-6                → advance run 654, ı ink centre +38.3
 *   Special Gothic Expanded One "KILELE" 140/+2 → advance run 580.2
 * ------------------------------------------------------------------ */

/* A — MANIFOLD: the spectrum survives, re-engineered as pipe risers
   standing on a header main. */
const RISERS = [
  [62, 92], [129, 40], [196, 14], [263, 10], [330, 52],
  [397, 68], [464, 16], [531, 58], [598, 86],
];
const markA = `
<svg viewBox="0 0 660 350" role="img" aria-label="kilele">
  <g stroke="var(--m-red)" stroke-width="17" stroke-linecap="round" fill="none">
    <line x1="40" y1="112" x2="620" y2="112"/>
    ${RISERS.map(([x, y]) => `<line x1="${x}" y1="112" x2="${x}" y2="${y}"/>`).join('\n    ')}
  </g>
  <g fill="var(--m-ink)">
    <rect x="163" y="99" width="6" height="26"/>
    <rect x="430" y="99" width="6" height="26"/>
    <rect x="250" y="51" width="26" height="6"/>
  </g>
  <text x="330" y="316" text-anchor="middle" font-family="${AB}" font-size="210"
        letter-spacing="-6" fill="var(--m-ink)">kilele</text>
</svg>`;

const favA = `
<svg viewBox="0 0 32 32" role="img" aria-label="kilele">
  <g stroke="var(--m-red)" stroke-width="4" stroke-linecap="round" fill="none">
    <line x1="5" y1="25.5" x2="27" y2="25.5"/>
    <line x1="8" y1="25.5" x2="8" y2="13"/>
    <line x1="16" y1="25.5" x2="16" y2="4.5"/>
    <line x1="24" y1="25.5" x2="24" y2="9.5"/>
  </g>
</svg>`;

/* B — SUMMIT RUN: the spectrum abstracts down to one continuous run of
   conduit that climbs to a summit and falls away. */
const markB = `
<svg viewBox="0 0 660 480" role="img" aria-label="kilele">
  <path d="M30,212 L111,212 Q145,212 145,178 L145,154 Q145,120 179,120
           L221,120 Q255,120 255,86 L255,74 Q255,40 289,40
           L446,40 Q480,40 480,74 L480,118 Q480,152 514,152 L630,152"
        fill="none" stroke="var(--m-red)" stroke-width="19" stroke-linecap="round"/>
  <g fill="var(--m-ink)">
    <rect x="72" y="199" width="6" height="26"/>
    <rect x="367" y="27" width="6" height="26"/>
    <rect x="567" y="139" width="6" height="26"/>
  </g>
  <text x="330" y="446" text-anchor="middle" font-family="${AB}" font-size="210"
        letter-spacing="-6" fill="var(--m-ink)">kilele</text>
</svg>`;

const favB = `
<svg viewBox="0 0 32 32" role="img" aria-label="kilele">
  <path d="M4,26 L6,26 Q10,26 10,22 L10,12 Q10,8 14,8 L22,8 Q26,8 26,12 L26,26"
        fill="none" stroke="var(--m-red)" stroke-width="4" stroke-linecap="round"/>
</svg>`;

/* C — SECTION: the spectrum goes. The tittle of a dotless ı (U+0131,
   present in Archivo Black at the same advance as i) becomes a length of
   pipe seen end-on. One red event, nothing else. */
const markC = `
<svg viewBox="10 80 700 250" role="img" aria-label="kilele">
  <text x="360" y="296" text-anchor="middle" font-family="${AB}" font-size="230"
        letter-spacing="-6" fill="var(--m-ink)">k&#305;lele</text>
  <circle cx="218.7" cy="132" r="21.5" fill="none"
          stroke="var(--m-red)" stroke-width="17"/>
</svg>`;

const favC = `
<svg viewBox="0 0 32 32" role="img" aria-label="kilele">
  <rect x="13.5" y="16" width="5" height="12" fill="var(--m-ink)"/>
  <circle cx="16" cy="7.5" r="4.2" fill="none" stroke="var(--m-red)" stroke-width="4"/>
</svg>`;

/* D — CAPSULE: no drawn spectrum at all. The mark is a container — the
   word set inside a length of pipe seen from the side, bolted at both
   ends. Deadpan, institutional, signage-first. */
const markD = `
<svg viewBox="0 0 760 230" role="img" aria-label="kilele">
  <rect x="8" y="8" width="744" height="214" rx="107" fill="var(--m-red)"/>
  <circle cx="52" cy="115" r="9" fill="var(--m-ground)"/>
  <circle cx="708" cy="115" r="9" fill="var(--m-ground)"/>
  <text x="380" y="164.7" text-anchor="middle" font-family="${SG}" font-size="140"
        letter-spacing="2" fill="var(--m-ground)">KILELE</text>
</svg>`;

const favD = `
<svg viewBox="0 0 32 32" role="img" aria-label="kilele">
  <rect x="1" y="7" width="30" height="18" rx="9" fill="var(--m-red)"/>
  <text x="16" y="21.3" text-anchor="middle" font-family="${SG}" font-size="15"
        fill="var(--m-ground)">K</text>
</svg>`;

/* ------------------------------------------------------------------ */

const CANDIDATES = [
  {
    file: 'Main.dc.html',
    letter: 'A',
    name: 'Manifold',
    title: 'A · Manifold',
    ratio: 660 / 350,
    mark: markA,
    fav: favA,
    position: 'Keeps the spectrum. Rebuilds it in conduit.',
    body:
      'The nine bars survive as red pipe risers standing off a header main, with ' +
      'ink flange collars where a real run would be clamped. The waveform-over-wordmark ' +
      'relationship the current mark owns is untouched — only the material changes.',
    forIt:
      'The most direct descendant. Nobody has to be told it is the same festival, and ' +
      'the peak profile still doubles as the summit the name means.',
    against:
      'Nine risers is a lot of detail to carry down to 32px — the favicon has to drop ' +
      'to three, so the mark and the icon are not the same object.',
  },
  {
    file: 'SummitRun.dc.html',
    letter: 'B',
    name: 'Summit Run',
    title: 'B · Summit Run',
    ratio: 660 / 480,
    mark: markB,
    fav: favB,
    position: 'Abstracts the spectrum into one continuous run.',
    body:
      'A single length of conduit enters from the left, climbs in two elbows to a ' +
      'plateau, and falls away in one. Asymmetric on purpose: an approach, a summit, ' +
      'a descent. Three flange collars are the only ink in the drawing.',
    forIt:
      'One gesture. It survives reduction better than anything else here — the ' +
      'favicon is the same shape, not a simplification of it — and it is the most ' +
      'literal reading of *kilele*.',
    against:
      'Loses the plurality of the spectrum: one peak instead of a room full of them. ' +
      'It is also the tallest lockup, so it pays the most at header height.',
  },
  {
    file: 'Section.dc.html',
    letter: 'C',
    name: 'Section',
    title: 'C · Section',
    ratio: 700 / 250,
    mark: markC,
    fav: favC,
    position: 'Drops the spectrum. One red event.',
    body:
      'Set in a dotless ı, so the tittle can be replaced outright by a length of ' +
      'pipe seen end-on. The whole motif compresses into a single ring sitting where ' +
      'a dot belongs. Nothing else is drawn.',
    forIt:
      'The quietest and the most confident. Widest lockup here, so it is the largest ' +
      'at any given header height, and the ring is unmistakable at 32px.',
    against:
      'Throws away the equity in the waveform entirely. The summit reading now rests ' +
      'on the word alone — which is fine in Nairobi and invisible everywhere else.',
  },
  {
    file: 'Capsule.dc.html',
    letter: 'D',
    name: 'Capsule',
    title: 'D · Capsule',
    ratio: 760 / 230,
    mark: markD,
    fav: favD,
    position: 'Drops the spectrum. The mark becomes a container.',
    body:
      'Not a drawing of a pipe but a pipe you read through: the word knocked out of a ' +
      'length of conduit seen side-on, bolted at both ends. Special Gothic Expanded One ' +
      'rather than Archivo Black, because the container wants a face that fills it.',
    forIt:
      'The most institutional and the most reproducible — a solid shape stamps onto a ' +
      'wall, a wristband or a crate without any hairline detail to lose.',
    against:
      'The furthest from the existing mark: different case, different face, no ' +
      'waveform. It is also a heavy red block, which is a lot of the loudest colour ' +
      'in the palette sitting permanently in the header.',
  },
];

/* ---- panel ------------------------------------------------------- */

const cream = '#f2eee2', ink = '#0f0f0e', signal = '#b61212',
      signalLit = '#c74240', concrete500 = '#4a4742', concrete300 = '#85807a',
      concrete100 = '#bbb5ab';

const ON_CREAM = `--m-ink:${ink};--m-red:${signal};--m-ground:${cream}`;
const ON_INK = `--m-ink:${cream};--m-red:${signalLit};--m-ground:${ink}`;
const ONE_CREAM = `--m-ink:${ink};--m-red:${ink};--m-ground:${cream}`;
const ONE_INK = `--m-ink:${cream};--m-red:${cream};--m-ground:${ink}`;

const label = (t, tone) =>
  `<div style="font-family:${SM};font-size:10px;font-weight:700;letter-spacing:0.16em;` +
  `text-transform:uppercase;color:${tone};">${t}</div>`;

/* The year rides on a dimension leader, never inside the mark. */
const yearLeader = (tone) => `
      <div style="display:flex;align-items:center;gap:0;flex-shrink:0;">
        <svg width="96" height="18" viewBox="0 0 96 18" style="display:block;">
          <circle cx="3" cy="9" r="3" fill="${tone}"/>
          <line x1="3" y1="9" x2="88" y2="9" stroke="${tone}" stroke-width="1.5"/>
          <line x1="88" y1="1" x2="88" y2="17" stroke="${tone}" stroke-width="1.5"/>
        </svg>
        <div style="font-family:${SM};font-size:19px;font-weight:700;letter-spacing:0.1em;
                    color:${tone};padding-left:10px;">2026</div>
      </div>`;

/* A 40px-tall mark inside a real header bar, so the size is judged in context. */
const headerBar = (c, vars, bg, tone, ruleTone) => `
      <div style="${vars};background:${bg};padding:14px 20px;display:flex;
                  align-items:center;gap:22px;border:1px solid ${ruleTone};">
        <div style="height:40px;width:${(40 * c.ratio).toFixed(0)}px;flex-shrink:0;">
          ${c.mark.replace('<svg ', '<svg style="display:block;width:100%;height:100%;" ')}
        </div>
        <div style="flex-grow:1;"></div>
        <div style="display:flex;gap:18px;font-family:${SM};font-size:11px;
                    font-weight:700;letter-spacing:0.14em;color:${tone};">
          <span>LINEUP</span><span>SCHEDULE</span><span>ABOUT</span>
        </div>
      </div>`;

const favBlock = (c, vars, bg, tone, ruleTone) => `
      <div style="${vars};background:${bg};border:1px solid ${ruleTone};padding:18px;
                  display:flex;align-items:center;gap:20px;">
        <div style="width:32px;height:32px;flex-shrink:0;">
          ${c.fav.replace('<svg ', '<svg style="display:block;width:100%;height:100%;" ')}
        </div>
        <div style="width:96px;height:96px;flex-shrink:0;">
          ${c.fav.replace('<svg ', '<svg style="display:block;width:100%;height:100%;" ')}
        </div>
        <div style="font-family:${SM};font-size:10px;letter-spacing:0.14em;
                    color:${tone};line-height:1.7;">32PX<br/>+ 3&#215;</div>
      </div>`;

function panel(c) {
  const heroMarkW = 520;
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&amp;family=Space+Mono:wght@400;700&amp;family=Special+Gothic+Expanded+One&amp;display=swap">
  <style>
    body { margin: 0; background: ${cream}; }
    a { color: ${signal}; } a:hover { color: ${ink}; }
  </style>
</helmet>
<div style="${ON_CREAM};background:${cream};min-height:1240px;padding:44px 40px 40px;
            box-sizing:border-box;display:flex;flex-direction:column;gap:30px;">

  <div style="display:flex;align-items:flex-start;gap:20px;
              border-bottom:1px solid ${concrete100};padding-bottom:18px;">
    <div style="font-family:${SM};font-size:44px;font-weight:700;line-height:0.9;
                color:${signal};flex-shrink:0;">${c.letter}</div>
    <div style="display:flex;flex-direction:column;gap:7px;">
      <div style="font-family:${AB};font-size:26px;letter-spacing:-0.01em;
                  color:${ink};">${c.name}</div>
      <div style="font-family:${SM};font-size:12px;letter-spacing:0.02em;
                  color:${concrete500};line-height:1.6;max-width:600px;">${c.position}</div>
    </div>
  </div>

  ${label('01 &#8212; Hero, cream ground', concrete500)}
  <div style="${ON_CREAM};background:${cream};border:1px solid ${concrete100};
              padding:38px 34px;display:flex;align-items:flex-end;gap:30px;">
    <div style="width:${heroMarkW}px;flex-shrink:0;">
      ${c.mark.replace('<svg ', '<svg style="display:block;width:100%;height:auto;" ')}
    </div>
    ${yearLeader(ink)}
  </div>

  ${label('02 &#8212; Hero, ink ground', concrete500)}
  <div style="${ON_INK};background:${ink};padding:38px 34px;display:flex;
              align-items:flex-end;gap:30px;">
    <div style="width:${heroMarkW}px;flex-shrink:0;">
      ${c.mark.replace('<svg ', '<svg style="display:block;width:100%;height:auto;" ')}
    </div>
    ${yearLeader(cream)}
  </div>

  ${label('03 &#8212; Header, mark 40px tall, in context', concrete500)}
  <div style="display:flex;flex-direction:column;gap:12px;">
    ${headerBar(c, ON_CREAM, cream, ink, concrete100)}
    ${headerBar(c, ON_INK, ink, cream, ink)}
  </div>

  ${label('04 &#8212; Favicon, 32px', concrete500)}
  <div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:12px;">
    ${favBlock(c, ON_CREAM, cream, concrete500, concrete100)}
    ${favBlock(c, ON_INK, ink, concrete300, ink)}
  </div>

  ${label('05 &#8212; One colour, for a partner&#8217;s wall', concrete500)}
  <div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:12px;">
    <div style="${ONE_CREAM};background:${cream};border:1px solid ${concrete100};
                padding:22px;display:flex;align-items:center;justify-content:center;">
      <div style="width:230px;">
        ${c.mark.replace('<svg ', '<svg style="display:block;width:100%;height:auto;" ')}
      </div>
    </div>
    <div style="${ONE_INK};background:${ink};padding:22px;display:flex;
                align-items:center;justify-content:center;">
      <div style="width:230px;">
        ${c.mark.replace('<svg ', '<svg style="display:block;width:100%;height:auto;" ')}
      </div>
    </div>
  </div>

  <div style="flex-grow:1;"></div>

  <div style="display:flex;flex-direction:column;gap:14px;border-top:1px solid ${concrete100};
              padding-top:20px;font-family:${SM};font-size:12px;line-height:1.65;">
    <div style="color:${concrete500};">${c.body}</div>
    <div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:22px;">
      <div style="display:flex;flex-direction:column;gap:6px;">
        ${label('The case for it', signal)}
        <div style="color:${ink};">${c.forIt}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        ${label('What it costs', concrete300)}
        <div style="color:${ink};">${c.against}</div>
      </div>
    </div>
  </div>

</div>
</x-dc>
</body>
</html>
`;
}

/* ---- round 2 ------------------------------------------------------ *
 * Round 1's verdict: D is out; keep A's waveform-as-pipes, B's asymmetry
 * (without its wasted height) and C's ring tittle; everything read too
 * clean and sterile. These three carry the same six tests as round 1 and
 * differ in how much mischief they take on.
 * ------------------------------------------------------------------- */

const ROUND2 = [
  {
    file: 'ServiceRun.dc.html',
    letter: 'E',
    name: 'Service Run',
    title: 'E · Service Run',
    ratio: 660 / 350,
    mark: markE,
    fav: favE,
    position: 'A, behaving like a real run rather than a bar chart.',
    body:
      'The legs cluster in four groups instead of marching evenly, the feed is sawn ' +
      'off at the left edge rather than politely capped, one leg is blanked off and ' +
      'never used, one carries a valve, and one turns away at the top and leaves. ' +
      'Same spectrum, but it now reads as something installed rather than drawn.',
    forIt:
      'Least risk of the three. The waveform equity is intact and the character comes ' +
      'entirely from plumbing that behaves, so nothing here is a style that can date.',
    against:
      'Still the mildest. If the complaint was sterility, this answers it with detail ' +
      'rather than with attitude — and it is the busiest thing to reduce.',
  },
  {
    file: 'SectionAA.dc.html',
    letter: 'F',
    name: 'Section A–A',
    title: 'F · Section A–A',
    ratio: 660 / 300,
    mark: markF,
    fav: favF,
    position: 'B’s asymmetry, made compact. The ring takes the other half.',
    body:
      'The run gives up the full width and takes only the right of the corridor, ' +
      'climbing once and leaving off-frame; the ring tittle takes the left. That ' +
      'balances the composition sideways instead of stacking it, so the lockup is ' +
      '2.2 wide to 1 tall where B was 1.375.',
    forIt:
      'Fixes B’s dead space without losing the asymmetry, and it is the only one ' +
      'where the two things you liked — the run and the ring — share the ' +
      'work instead of competing.',
    against:
      'The quietest of the three, and the ring and the run are doing unrelated jobs: ' +
      'read uncharitably it is two separate ideas in one corridor.',
  },
  {
    file: 'Interference.dc.html',
    letter: 'G',
    name: 'Interference',
    title: 'G · Interference',
    ratio: 660 / 366,
    mark: markG,
    fav: favG,
    position: 'The plumbing got here first and the word is working around it.',
    body:
      'Everything E has, plus a leg that drops straight through the wordmark and out ' +
      'the bottom, knocking a clean gap in the letters as it passes — and a final ' +
      '“e” sitting 16px proud of the baseline, as if it had been shouldered ' +
      'aside. The ring takes the tittle.',
    forIt:
      'The only one with actual mischief rather than detail. The word is no longer ' +
      'sitting politely underneath the drawing; the two are in each other’s way, ' +
      'which is what a summit in a car park actually looks like.',
    against:
      'The nudged “e” will read as a mistake to somebody, forever, and you ' +
      'cannot explain a logo. The knockout gap also means the mark can never sit on a ' +
      'photograph without a solid ground behind it.',
  },
  {
    file: 'Downcomer.dc.html',
    letter: 'H',
    name: 'Downcomer',
    title: 'H \u00b7 Downcomer',
    ratio: 660 / 366,
    mark: markH,
    fav: favH,
    position: 'G with the corridor closed up and the \u201ce\u201d back on the baseline.',
    body:
      'The main drops 12 units and nine legs now come down off it instead of one. Each ' +
      'stops just clear of what is under it, so their depths all differ \u2014 the two ' +
      'deepest sit over the e\u2019s, where the x-height leaves a pocket 39 units taller ' +
      'than an ascender does. That pocket was most of the empty space. Three legs line up ' +
      'under a riser and read as one pipe passing through the main.',
    forIt:
      'The pipes and the word are now one object rather than two stacked ones, and it ' +
      'gets there without the nudged letter \u2014 so the mischief is all in the ' +
      'plumbing, where it survives being explained.',
    against:
      'It is the densest mark here by some way. At header height the corridor fills in ' +
      'and the legs start reading as a texture rather than as pipes, which is either ' +
      'the point or a problem depending on how small the header ends up.',
  },
];

function devicesPanel() {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&amp;family=Space+Mono:wght@400;700&amp;display=swap">
  <style>
    body { margin: 0; background: ${cream}; }
    a { color: ${signal}; } a:hover { color: ${ink}; }
  </style>
</helmet>
<div style="${ON_CREAM};background:${cream};min-height:1240px;padding:44px 40px 40px;
            box-sizing:border-box;display:flex;flex-direction:column;gap:26px;">

  <div style="display:flex;align-items:flex-start;gap:20px;
              border-bottom:1px solid ${concrete100};padding-bottom:18px;">
    <div style="font-family:${SM};font-size:44px;font-weight:700;line-height:0.9;
                color:${signal};flex-shrink:0;">&#8212;</div>
    <div style="display:flex;flex-direction:column;gap:7px;">
      <div style="font-family:${AB};font-size:26px;letter-spacing:-0.01em;
                  color:${ink};">Parts list</div>
      <div style="font-family:${SM};font-size:12px;letter-spacing:0.02em;
                  color:${concrete500};line-height:1.6;max-width:600px;">
        The six devices E, F and G are built from. Mix them however you like &#8212;
        none of them is welded to a particular candidate.</div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:16px;">
    ${DEVICES.map((d) => `
    <div style="border:1px solid ${concrete100};display:flex;flex-direction:column;">
      <div style="background:${cream};padding:0;overflow:hidden;">
        <svg viewBox="0 0 240 170" style="display:block;width:100%;height:auto;">${d.art}</svg>
      </div>
      <div style="border-top:1px solid ${concrete100};padding:14px 16px;display:flex;
                  flex-direction:column;gap:6px;">
        ${label(d.name, signal)}
        <div style="font-family:${SM};font-size:11.5px;line-height:1.6;
                    color:${concrete500};">${d.note}</div>
      </div>
    </div>`).join('')}
  </div>

  <div style="flex-grow:1;"></div>

  <div style="border-top:1px solid ${concrete100};padding-top:20px;font-family:${SM};
              font-size:12px;line-height:1.65;color:${concrete500};">
    All six are drawn at the mark&#8217;s own stroke weight (17 units against a 210px
    wordmark), so anything you graft from one candidate onto another lands in register
    without redrawing. The one device with a real cost is
    <span style="color:${ink};">Crossing</span>: the ground-coloured halo that keeps the
    gap clean is also what stops the mark sitting directly on a photograph.
  </div>

</div>
</x-dc>
</body>
</html>
`;
}

for (const c of CANDIDATES) writeFileSync(`${OUT}/${c.file}`, panel(c));
for (const c of ROUND2) writeFileSync(`${OUT}/${c.file}`, panel(c));
writeFileSync(`${OUT}/Devices.dc.html`, devicesPanel());

const canvas = {
  pages: [
    { id: 'round-2', name: 'Round 2' },
    { id: 'round-1', name: 'Round 1' },
  ],
  artboards: [
    ...ROUND2.map((c, i) => ({
      file: c.file, title: c.title, page: 'round-2',
      x: i * 1020, y: 0, w: 900, h: 1240,
    })),
    {
      file: 'Devices.dc.html', title: 'Parts list', page: 'round-2',
      x: ROUND2.length * 1020, y: 0, w: 900, h: 1240,
    },
    ...CANDIDATES.map((c, i) => ({
      file: c.file, title: c.title, page: 'round-1',
      x: i * 1020, y: 0, w: 900, h: 1240,
    })),
  ],
  annotations: [
    {
      id: 'round2-brief',
      x: 0, y: -300, w: 700, page: 'round-2',
      text:
        'ROUND 2 — answering the note on round 1.\n\n' +
        'D is gone. These three keep what you picked out: A’s waveform-as-pipes, ' +
        'B’s asymmetry (with B’s wasted height designed out), C’s ring ' +
        'tittle. The dotless ı makes the ring possible — U+0131 is in Archivo ' +
        'Black at the same advance as i.\n\n' +
        'On sterility: the character here is sourced from engineering convention rather ' +
        'than applied on top of it. A run sawn off at the frame, a leg capped and never ' +
        'used, a valve somebody can shut, a pipe that got there before the type did. ' +
        'Humour in the rigour — nothing distressed, nothing decorative.\n\n' +
        'E is mild, F is compact, G is the one that actually misbehaves.',
    },
    {
      id: 'round2-open',
      x: 740, y: -300, w: 380, page: 'round-2',
      text:
        'STILL OPEN, DELIBERATELY.\n\n' +
        'Texture is not in these. #133 settled that concrete gets synthesised in CSS, ' +
        'and a halftone or grain inside the mark itself is a separate decision that ' +
        'costs legibility at 32px — worth doing as its own pass if the marks still ' +
        'read too clean once they are sitting on a textured ground.\n\n' +
        'The parts list on the right is there so you can graft: G’s crossing onto ' +
        'E, F’s ring onto anything, and so on.',
    },
    {
      id: 'brief',
      x: 0, y: -260, w: 620, page: 'round-1',
      text:
        'ISSUE #137 — Which evergreen Kilele wordmark do we take forward?\n\n' +
        'Fixed upstream, not up for grabs here: Archivo Black for the wordmark, ' +
        'Special Gothic Expanded One for display, Space Mono for index/metadata (#134); ' +
        'cream #f2eee2 and ink #0f0f0e as first-class grounds, --signal #b61212 on cream ' +
        'and --signal-lit #c74240 on ink (#136).\n\n' +
        'The axis these four explore is the WAVEFORM: keep it (A), abstract it into the ' +
        'pipe language (B), or drop it (C, D).',
    },
    {
      id: 'year-layer',
      x: 660, y: -260, w: 360, page: 'round-1',
      text:
        'THE YEAR IS NOT IN THE MARK.\n\n' +
        'It hangs off it on a dimension leader — dot terminal at the mark, tick at the ' +
        'label, "2026" in Space Mono 700. Borrowed from the reference photo\'s thin black ' +
        'annotation lines.\n\n' +
        'Same treatment on all four heroes, so the relationship is judged once and the ' +
        'mark stays evergreen: swap the string, nothing else moves.',
    },
  ],
  launch: { view: 'canvas', page: 'round-2' },
};
writeFileSync(`${OUT}/canvas.json`, JSON.stringify(canvas, null, 2));

console.log('wrote', [...CANDIDATES, ...ROUND2].map((c) => c.file).join(', '),
  ', Devices.dc.html and canvas.json');

/* ---- standalone SVG export --------------------------------------- *
 * Each file is self-contained and works dropped straight into an <img>
 * or inlined. Defaults are the cream-ground colourway; inline the file
 * and override --m-red / --m-ink / --m-ground to get the ink ground or
 * the one-colour reproduction.
 * ------------------------------------------------------------------ */

const DEFAULTS = `<style>
    svg { --m-ink: ${ink}; --m-red: ${signal}; --m-ground: ${cream}; }
  </style>`;

function standalone(svg) {
  return svg
    .trim()
    .replace(/^<svg /, '<svg xmlns="http://www.w3.org/2000/svg" ')
    .replace(/>/, `>\n  ${DEFAULTS}`) + '\n';
}

const EXPORTS = [
  ['a-manifold', markA, favA], ['b-summit-run', markB, favB],
  ['c-section', markC, favC], ['d-capsule', markD, favD],
  ['e-service-run', markE, favE], ['f-section-aa', markF, favF],
  ['g-interference', markG, favG], ['h-downcomer', markH, favH],
];
if (process.argv[3] === '--svg') {
  const dir = process.argv[4];
  mkdirSync(dir, { recursive: true });
  for (const [slug, mark, fav] of EXPORTS) {
    writeFileSync(`${dir}/${slug}.svg`, standalone(mark));
    writeFileSync(`${dir}/${slug}-favicon.svg`, standalone(fav));
  }
  console.log('wrote', EXPORTS.length * 2, 'svg files to', dir);
}
