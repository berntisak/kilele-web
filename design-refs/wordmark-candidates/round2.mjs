/* Round 2 marks. Grafted onto gen.mjs's vocabulary.
 *
 * Feedback that produced these: D is out. Keep A's waveform-as-pipes, B's
 * asymmetry (without B's wasted vertical space), C's ring tittle. All of
 * round 1 read too clean and sterile — no character, no mischief.
 *
 * The mischief is deliberately sourced from engineering convention rather
 * than from grunge: a run that is cut off-frame, a leg capped and never
 * used, a valve somebody can shut, a pipe that got there before the type
 * did. Humour in the rigour, not applied on top of it.
 *
 * Archivo Black glyph advances at 210px (measured at 230 and scaled;
 * letter-spacing is absolute so it does NOT scale):
 *   k 140.05  ı 69.95  l 69.95  e 140.05
 * With letter-spacing -6, "kilele" runs 594 wide. Anchored middle at
 * x=330 the run starts at x=33, so glyph origins are:
 *   k 33.0   ı 167.05   l 231.0   e 294.95   l 429.0   e 492.95
 * The dotless ı ink centre sits +34.96 from its origin → ring cx 202.0.
 */

const AB = `'Archivo Black','Arial Black',sans-serif`;

/* ---- devices ------------------------------------------------------ *
 * PW is the pipe stroke; collars overhang it by 4.5 on each side.      */
const PW = 17;

const collarH = (x, y) => `<rect x="${x - 3}" y="${y - 13}" width="6" height="26"/>`;
const collarV = (x, y) => `<rect x="${x - 13}" y="${y - 3}" width="26" height="6"/>`;
/* a leg capped off: a blank flange plate across the end of a riser */
const blankFlange = (x, yTop) => `<rect x="${x - 15}" y="${yTop - 10}" width="30" height="6"/>`;
/* somebody can shut this: collar, stem, handwheel */
const valveV = (x, y) =>
  `${collarV(x, y)}<rect x="${x + 13}" y="${y - 1.5}" width="16" height="3"/>` +
  `<circle cx="${x + 36}" cy="${y}" r="7" fill="none" stroke-width="3.5"/>`;
const valveH = (x, y) =>
  `${collarH(x, y)}<rect x="${x - 1.5}" y="${y + 13}" width="3" height="16"/>` +
  `<circle cx="${x}" cy="${y + 36}" r="7" fill="none" stroke-width="3.5"/>`;
/* the run turns toward you — used as the tittle of the dotless ı */
const ring = (cx, cy) =>
  `<circle cx="${cx}" cy="${cy}" r="19.6" fill="none" stroke="var(--m-red)" stroke-width="15.5"/>`;

/* Type carrying a ground-coloured halo, so a pipe crossing behind it
   leaves a clean gap — and still does in one-colour reproduction. */
const knockout = `paint-order="stroke fill" stroke="var(--m-ground)" stroke-width="17" stroke-linejoin="round"`;

/* ================================================================== *
 * E — SERVICE RUN.  A, but behaving like a real run: clustered legs,
 * a cut feed, a leg capped off, a valve, one leg that turns away.
 * ================================================================== */
const RISERS_E = [
  [46, 78], [84, 44], [122, 90],
  [214, 26], [252, 12], [290, 52],
  [424, 62], [462, 16],
  [548, 84], [586, 50],
];
const markE = `
<svg viewBox="0 0 660 350" role="img" aria-label="kilele">
  <g stroke="var(--m-red)" stroke-width="${PW}" fill="none">
    <line x1="0" y1="112" x2="612" y2="112" stroke-linecap="butt"/>
    <g stroke-linecap="round">
      ${RISERS_E.map(([x, y]) => `<line x1="${x}" y1="112" x2="${x}" y2="${y}"/>`).join('\n      ')}
      <path d="M328,112 L328,46 Q328,34 340,34 L366,34"/>
    </g>
  </g>
  <g fill="var(--m-ink)" stroke="var(--m-ink)">
    ${collarH(170, 112)}
    ${collarH(508, 112)}
    ${blankFlange(122, 90)}
    ${valveV(462, 60)}
    <rect x="609" y="96" width="7" height="32"/>
  </g>
  <text x="330" y="316" text-anchor="middle" font-family="${AB}" font-size="210"
        letter-spacing="-6" fill="var(--m-ink)">kilele</text>
</svg>`;

const favE = `
<svg viewBox="0 0 32 32" role="img" aria-label="kilele">
  <g stroke="var(--m-red)" stroke-width="4" fill="none">
    <line x1="0" y1="25.5" x2="28" y2="25.5" stroke-linecap="butt"/>
    <g stroke-linecap="round">
      <line x1="6" y1="25.5" x2="6" y2="15"/>
      <line x1="13" y1="25.5" x2="13" y2="5"/>
      <line x1="24" y1="25.5" x2="24" y2="11"/>
    </g>
  </g>
</svg>`;

/* ================================================================== *
 * F — SECTION A–A.  B's asymmetry, but the run occupies only the right
 * of the corridor so the lockup stops wasting height. The ring takes
 * the left, as the tittle. Aspect 2.2 against B's 1.375.
 * ================================================================== */
const markF = `
<svg viewBox="0 0 660 300" role="img" aria-label="kilele">
  <path d="M240,96 L282,96 Q308,96 308,70 L308,64 Q308,38 334,38 L660,38"
        fill="none" stroke="var(--m-red)" stroke-width="${PW}"
        stroke-linecap="butt"/>
  <g fill="var(--m-ink)" stroke="var(--m-ink)">
    <rect x="236" y="80" width="7" height="32"/>
    ${valveH(470, 38)}
  </g>
  ${ring(202, 126.25)}
  <text x="330" y="276" text-anchor="middle" font-family="${AB}" font-size="210"
        letter-spacing="-6" fill="var(--m-ink)">k&#305;lele</text>
</svg>`;

const favF = `
<svg viewBox="0 0 32 32" role="img" aria-label="kilele">
  <circle cx="10" cy="9" r="5" fill="none" stroke="var(--m-red)" stroke-width="4.5"/>
  <path d="M6,28 L14,28 Q19,28 19,23 L19,18 Q19,13 24,13 L32,13"
        fill="none" stroke="var(--m-red)" stroke-width="4.5" stroke-linecap="butt"/>
</svg>`;

/* ================================================================== *
 * G — INTERFERENCE.  Everything: clustered waveform, cut feed, capped
 * leg, valve, ring tittle — plus one leg that drops straight through
 * the word, and a final "e" sitting 16px proud where it passed.
 * ================================================================== */
const RISERS_G = [
  [46, 70], [84, 36], [122, 82],
  [214, 24], [252, 12], [290, 48],
  [396, 58], [434, 20],
  [540, 76], [578, 42],
];
const markG = `
<svg viewBox="0 0 660 366" role="img" aria-label="kilele">
  <g stroke="var(--m-red)" stroke-width="${PW}" fill="none">
    <line x1="0" y1="104" x2="612" y2="104" stroke-linecap="butt"/>
    <g stroke-linecap="round">
      ${RISERS_G.map(([x, y]) => `<line x1="${x}" y1="104" x2="${x}" y2="${y}"/>`).join('\n      ')}
      <line x1="360" y1="104" x2="360" y2="348"/>
    </g>
  </g>
  ${ring(202, 176.25)}
  <g fill="var(--m-ink)" stroke="var(--m-ink)">
    ${collarH(170, 104)}
    ${collarH(500, 104)}
    ${blankFlange(122, 82)}
    ${valveV(434, 56)}
    <rect x="609" y="88" width="7" height="32"/>
  </g>
  <g font-family="${AB}" font-size="210" letter-spacing="-6"
     fill="var(--m-ink)" ${knockout}>
    <text x="330" y="326" text-anchor="middle">k&#305;lel<tspan dy="-16">e</tspan></text>
  </g>
</svg>`;

const favG = `
<svg viewBox="0 0 32 32" role="img" aria-label="kilele">
  <g stroke="var(--m-red)" stroke-width="4" fill="none">
    <line x1="0" y1="13" x2="29" y2="13" stroke-linecap="butt"/>
    <g stroke-linecap="round">
      <line x1="7" y1="13" x2="7" y2="3"/>
      <line x1="15" y1="13" x2="15" y2="7"/>
      <line x1="23" y1="13" x2="23" y2="30"/>
    </g>
  </g>
</svg>`;

/* ---- the devices, drawn large for mixing and matching -------------- */
const DEVICES = [
  {
    name: 'Cut end',
    note: 'The run is never a finished object — it arrives from off the mark and is sawn where the mark stops.',
    art: `<line x1="0" y1="75" x2="212" y2="75" stroke="var(--m-red)" stroke-width="${PW}" stroke-linecap="butt"/>
          <g fill="var(--m-ink)">${collarH(150, 75)}</g>`,
  },
  {
    name: 'Blank flange',
    note: 'A leg capped off and never used. Reads as infrastructure that predates whatever is happening here.',
    art: `<line x1="120" y1="140" x2="120" y2="40" stroke="var(--m-red)" stroke-width="${PW}" stroke-linecap="round"/>
          <g fill="var(--m-ink)">${blankFlange(120, 40)}</g>`,
  },
  {
    name: 'Valve',
    note: 'Somebody can turn this off. The one device that implies a person.',
    art: `<line x1="90" y1="140" x2="90" y2="30" stroke="var(--m-red)" stroke-width="${PW}" stroke-linecap="round"/>
          <g fill="var(--m-ink)" stroke="var(--m-ink)">${valveV(90, 78)}</g>`,
  },
  {
    name: 'Section',
    note: 'The run turns toward you and you see it end-on. Sized and placed to serve as the tittle of a dotless ı.',
    art: `${ring(120, 84)}`,
  },
  {
    name: 'Crossing',
    note: 'The plumbing got here first; the type gets out of the way. The gap survives one-colour reproduction.',
    art: `<line x1="120" y1="8" x2="120" y2="160" stroke="var(--m-red)" stroke-width="${PW}" stroke-linecap="round"/>
          <text x="120" y="130" text-anchor="middle" font-family="${AB}" font-size="150"
                fill="var(--m-ink)" ${knockout}>e</text>`,
  },
  {
    name: 'Nudge',
    note: 'One letter sits 16px proud of the baseline, as if the run shouldered it aside on the way past.',
    art: `<g font-family="${AB}" font-size="120" fill="var(--m-ink)">
            <text x="14" y="130">el</text><text x="134" y="114">e</text>
          </g>`,
  },
];

/* ================================================================== *
 * H — DOWNCOMER.  G with the corridor closed up. The main drops 12 to
 * y=116, and nine legs now come DOWN off it instead of one, each ending
 * just clear of whatever is beneath it — which is why their depths are
 * all different. The deep ones (322, 530) sit over the two e's, where
 * the x-height leaves a pocket 39 units taller than it does over an
 * ascender; that pocket was most of the empty space being complained
 * about. The final "e" is back on the baseline.
 *
 * Ink extents the drop depths are cut against (fs 210, ls -6, run x=33):
 *   k  ~45.6..166    ascender, ink top 173.7
 *   ı  181.15..222.95   x-height, ink top 215.1   (ring cx 202.05)
 *   l  245.10..286.90   ascender, ink top 173.7
 *   e  302.55..427.45   x-height, ink top 212.6
 *   l  443.10..484.90   ascender
 *   e  500.55..625.45   x-height
 * ================================================================== */
const RISERS_H = [
  [46, 70], [84, 36], [122, 82],
  [214, 24], [252, 12], [290, 48],
  [434, 20],
  [540, 76], [578, 42],
];
/* x, and the y the leg stops at. Legs at 84, 252 and 578 sit directly
   under a riser, so they read as one pipe passing through the main;
   the rest are deliberately offset. 360 is the one that goes all the
   way through the word and out the bottom. */
const DROPS_H = [
  [84, 148], [202, 130], [252, 150], [322, 196], [360, 348],
  [400, 182], [464, 146], [530, 194], [578, 170],
];
const markH = `
<svg viewBox="0 0 660 366" role="img" aria-label="kilele">
  <g stroke="var(--m-red)" stroke-width="${PW}" fill="none">
    <line x1="0" y1="116" x2="612" y2="116" stroke-linecap="butt"/>
    <g stroke-linecap="round">
      ${RISERS_H.map(([x, y]) => `<line x1="${x}" y1="116" x2="${x}" y2="${y}"/>`).join('\n      ')}
      ${DROPS_H.map(([x, y]) => `<line x1="${x}" y1="116" x2="${x}" y2="${y}"/>`).join('\n      ')}
    </g>
  </g>
  ${ring(202, 176.25)}
  <g fill="var(--m-ink)" stroke="var(--m-ink)">
    ${collarH(170, 116)}
    ${collarH(500, 116)}
    ${blankFlange(122, 82)}
    ${valveV(434, 56)}
    <rect x="609" y="100" width="7" height="32"/>
  </g>
  <g font-family="${AB}" font-size="210" letter-spacing="-6"
     fill="var(--m-ink)" ${knockout}>
    <text x="330" y="326" text-anchor="middle">k&#305;lele</text>
  </g>
</svg>`;

const favH = `
<svg viewBox="0 0 32 32" role="img" aria-label="kilele">
  <g stroke="var(--m-red)" stroke-width="4" fill="none">
    <line x1="0" y1="13" x2="29" y2="13" stroke-linecap="butt"/>
    <g stroke-linecap="round">
      <line x1="7" y1="13" x2="7" y2="3"/>
      <line x1="15" y1="13" x2="15" y2="6"/>
      <line x1="10" y1="13" x2="10" y2="21"/>
      <line x1="23" y1="13" x2="23" y2="30"/>
    </g>
  </g>
</svg>`;

export {
  markE, favE, markF, favF, markG, favG, markH, favH, DEVICES, AB, PW,
};
