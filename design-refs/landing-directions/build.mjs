// Kilele — landing-page direction sketches (issue #138).
// Generates the .dc.html artboards + canvas.json for the design canvas.
// Colours are the semantic tokens from src/css/tokens.prototype.css (#136),
// written literally so the canvas' properties panel can edit them.
// The mark is src/assets/logos/kilele-mark.prototype.svg (#137), inlined per
// colourway; the mobile artboards use the REDUCED-LEG variant #137 called for.
import fs from "node:fs";

const T = {
  cream: { ground:"#f2eee2", text:"#0f0f0e", muted:"#4a4742", rule:"#bbb5ab", pipe:"#b61212",
           mInk:"#0f0f0e", mRed:"#b61212", mGround:"#f2eee2" },
  ink:   { ground:"#0f0f0e", text:"#f2eee2", muted:"#85807a", rule:"#4a4742", pipe:"#c74240",
           mInk:"#f2eee2", mRed:"#c74240", mGround:"#0f0f0e" },
};

const DISPLAY = "'Special Gothic Expanded One','Archivo Black','Arial Black',sans-serif";
const MONO = "'Space Mono',ui-monospace,SFMono-Regular,monospace";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ---------- the mark ---------- */

const UP_FULL = [[46,70],[84,36],[122,82],[214,24],[252,12],[290,48],[434,20],[540,76],[578,42]];
const DN_FULL = [[84,148],[202,130],[252,150],[322,196],[360,348],[400,182],[464,146],[530,194],[578,170]];
const UP_RED  = [[84,36],[252,12],[434,20],[578,42]];
const DN_RED  = [[202,130],[360,348],[530,194]];

function mark(tone, width, reduced = false) {
  const t = T[tone];
  const up = reduced ? UP_RED : UP_FULL;
  const dn = reduced ? DN_RED : DN_FULL;
  const legs = [...up, ...dn].map(([x,y]) => `<line x1="${x}" y1="116" x2="${x}" y2="${y}"/>`).join("");
  const flange = reduced ? "" : `<rect x="107" y="72" width="30" height="6"/>`;
  const h = Math.round(width * 366 / 660);
  return `<svg viewBox="0 0 660 366" width="${width}" height="${h}" role="img" aria-label="kilele" style="display:block">
<g stroke="${t.mRed}" stroke-width="17" fill="none"><line x1="0" y1="116" x2="612" y2="116" stroke-linecap="butt"/><g stroke-linecap="round">${legs}</g></g>
<circle cx="202" cy="176.25" r="19.6" fill="none" stroke="${t.mRed}" stroke-width="15.5"/>
<g fill="${t.mInk}" stroke="${t.mInk}"><rect x="167" y="103" width="6" height="26"/><rect x="497" y="103" width="6" height="26"/>${flange}<rect x="421" y="53" width="26" height="6"/><rect x="447" y="54.5" width="16" height="3"/><circle cx="470" cy="56" r="7" fill="none" stroke-width="3.5"/><rect x="609" y="100" width="7" height="32"/></g>
<g font-family="'Archivo Black','Arial Black',sans-serif" font-size="210" letter-spacing="-6" fill="${t.mInk}" paint-order="stroke fill" stroke="${t.mGround}" stroke-width="17" stroke-linejoin="round"><text x="330" y="326" text-anchor="middle">k&#305;lele</text></g>
</svg>`;
}

/* ---------- the year, on its dimension leader (#137) ---------- */

function leader(tone, len = 130, size = 26, year = "2027") {
  const t = T[tone];
  return `<div style="display:flex; align-items:center; gap:10px">
<svg width="${len}" height="16" style="display:block; overflow:visible"><circle cx="4" cy="8" r="3.5" fill="${t.muted}"/><line x1="4" y1="8" x2="${len - 1}" y2="8" stroke="${t.muted}" stroke-width="1"/><line x1="${len - 1}" y1="1" x2="${len - 1}" y2="15" stroke="${t.muted}" stroke-width="1"/></svg>
<span style="font-family:${MONO}; font-weight:700; font-size:${size}px; color:${t.text}; letter-spacing:0.02em; line-height:1">${year}</span>
</div>`;
}

/* ---------- the motif as a page rule: a main, cut off at both frame edges,
              with round-capped legs dropping off it ---------- */

function pipeRule(tone, w, legs, stroke = 6, drop = 46) {
  const t = T[tone];
  const y = Math.round(stroke / 2) + 1;
  const h = drop + y + 2;
  const legMarkup = legs.map(([x, d]) =>
    `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + d}" stroke-linecap="round"/>`).join("");
  return `<svg width="${w}" height="${h}" style="display:block"><g stroke="${t.pipe}" stroke-width="${stroke}" fill="none"><line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke-linecap="butt"/>${legMarkup}</g></svg>`;
}

/* ---------- concrete, synthesised (#133): two blended turbulence fields ---------- */

function concrete(id, w, h) {
  return `<svg width="${w}" height="${h}" style="display:block">
<filter id="${id}a"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" seed="7"/><feColorMatrix type="saturate" values="0"/></filter>
<filter id="${id}b"><feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="2" seed="3"/><feColorMatrix type="saturate" values="0"/></filter>
<rect width="${w}" height="${h}" fill="#85807a"/>
<rect width="${w}" height="${h}" filter="url(#${id}b)" opacity="0.38"/>
<rect width="${w}" height="${h}" filter="url(#${id}a)" opacity="0.30"/>
</svg>`;
}

/* ---------- artboard wrapper ---------- */

function page(tone, body) {
  const t = T[tone];
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"><` + `/script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&amp;family=Space+Mono:wght@400;700&amp;family=Special+Gothic+Expanded+One&amp;display=swap">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: ${t.ground}; color: ${t.text}; font-family: ${MONO}; -webkit-font-smoothing: antialiased; }
    a { color: ${t.pipe}; text-decoration: none; }
    a:hover { color: ${t.text}; }
  </style>
</helmet>
${body}
</x-dc>
</body>
</html>`;
}

/* ---------- real content, all of it from the built site ---------- */

const INDEX_ROWS = [
  ["001", "COMMON GROUNDS",       "THEME FOR 2027"],
  ["002", "23—27 FEBRUARY 2027",  "THE MALL, WESTLANDS, NAIROBI"],
  ["003", "111 ARTISTS",          "LINEUP 2026"],
  ["004", "66 PROGRAMME POINTS",  "SCHEDULE 2026"],
  ["005", "5 PROJECTS",           "COMMISSIONS & RESIDENCIES 2026"],
  ["006", "125 PHOTOGRAPHS",      "GALLERY 2026 — SIX SECTIONS"],
  ["007", "29 DISPATCHES",        "NEWS"],
  ["008", "SUBSCRIBE",            "KILELESUMMIT.SUBSTACK.COM"],
];

const ARTISTS = JSON.parse(fs.readFileSync(new URL("./artists.json", import.meta.url), "utf8"));

const STATEMENT = "East Africa's first and only summit for music, tech and culture.";
const THEME_LINE = "Common Grounds is where we meet: on the dancefloor, in conversation, in collective action, and in the shared belief that another future is possible.";


/* ==================================================================
   A · INDEX  — cream. The mark is the only large element; the site is
   a numbered parts catalogue. Riskiest of the four.
   ================================================================== */

const A_W = 1440, A_M = 72;

function topBar(tone, w, m, left, right, fs = 11, h = 46) {
  const t = T[tone];
  return `<div style="display:flex; justify-content:space-between; align-items:center; height:${h}px; padding:0 ${m}px; border-bottom:1px solid ${t.rule}; font-family:${MONO}; font-size:${fs}px; letter-spacing:0.14em; text-transform:uppercase; color:${t.muted}">
<span>${esc(left)}</span><span>${esc(right)}</span></div>`;
}

function indexRow(tone, [n, title, meta], { crossed = false, titleSize = 34, rowH = 96, m = A_M, w = A_W } = {}) {
  const t = T[tone];
  const halo = crossed
    ? `text-shadow:5px 0 0 ${t.ground},-5px 0 0 ${t.ground},0 5px 0 ${t.ground},0 -5px 0 ${t.ground},4px 4px 0 ${t.ground},-4px 4px 0 ${t.ground},4px -4px 0 ${t.ground},-4px -4px 0 ${t.ground};`
    : "";
  const pipe = crossed
    ? `<svg width="${w}" height="${rowH}" style="position:absolute; inset:0; pointer-events:none"><line x1="352" y1="0" x2="352" y2="${rowH}" stroke="${t.pipe}" stroke-width="7" stroke-linecap="butt"/></svg>`
    : "";
  return `<div style="position:relative; display:grid; grid-template-columns:104px 1fr 420px 44px; align-items:center; gap:0; height:${rowH}px; padding:0 ${m}px; border-bottom:1px solid ${t.rule}">
${pipe}
<span style="position:relative; font-family:${MONO}; font-weight:700; font-size:13px; letter-spacing:0.08em; color:${t.pipe}">${esc(n)}</span>
<span style="position:relative; font-family:${DISPLAY}; font-size:${titleSize}px; line-height:1; letter-spacing:-0.01em; text-transform:uppercase; color:${t.text}; ${halo}">${esc(title)}</span>
<span style="position:relative; font-family:${MONO}; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:${t.muted}">${esc(meta)}</span>
<span style="position:relative; font-family:${MONO}; font-size:18px; color:${t.text}; text-align:right">&#8594;</span>
</div>`;
}

function footer(tone, w, m, fs = 11) {
  const t = T[tone];
  return `<div style="display:flex; justify-content:space-between; align-items:center; gap:24px; padding:36px ${m}px 44px; border-top:1px solid ${t.rule}; font-family:${MONO}; font-size:${fs}px; letter-spacing:0.14em; text-transform:uppercase; color:${t.muted}">
<span>Santuri East Africa</span><span>Instagram &#183; YouTube &#183; Substack</span></div>`;
}

const A_DESK = page("cream", `
<div style="width:${A_W}px; background:${T.cream.ground}">
${topBar("cream", A_W, A_M, "Kilele Summit — Nairobi, Kenya", "Index 001—008")}

<div style="padding:64px ${A_M}px 0">
  <div style="display:flex; align-items:flex-start; gap:44px">
    ${mark("cream", 960)}
    <div style="padding-top:161px">${leader("cream", 150, 30)}</div>
  </div>
  <p style="max-width:600px; margin:52px 0 0; font-family:${MONO}; font-size:14px; line-height:1.75; color:${T.cream.muted}">${esc(STATEMENT)} Six days at The Mall, Westlands, Nairobi, every February. Everything below is an index of what that has produced and what comes next.</p>
</div>

<div style="padding:56px 0 0">${pipeRule("cream", A_W, [[352, 30], [560, 58], [1016, 22], [1280, 44]], 7, 58)}</div>

<div style="padding-top:44px; border-top:1px solid ${T.cream.rule}; margin-top:24px">
${INDEX_ROWS.map((r, i) => indexRow("cream", r, { crossed: i === 2 })).join("\n")}
</div>

<div style="padding:80px ${A_M}px 96px">
  <div style="font-family:${DISPLAY}; font-size:112px; line-height:0.92; letter-spacing:-0.02em; text-transform:uppercase; color:${T.cream.text}; max-width:1150px">Common<br>Grounds</div>
  <div style="margin-top:28px; font-family:${MONO}; font-size:13px; letter-spacing:0.14em; text-transform:uppercase; color:${T.cream.muted}">The 2027 theme &#183; 23—27 February 2027 &#183; <a href="#">Subscribe on Substack &#8594;</a></div>
</div>

${footer("cream", A_W, A_M)}
</div>`);

const A_MOB_W = 375, A_MOB_M = 20;

const A_MOB = page("cream", `
<div style="width:${A_MOB_W}px; background:${T.cream.ground}">
${topBar("cream", A_MOB_W, A_MOB_M, "Kilele Summit", "001—008", 9, 38)}

<div style="padding:26px ${A_MOB_M}px 0">
  ${mark("cream", 335, true)}
  <div style="margin-top:16px">${leader("cream", 74, 17)}</div>
  <p style="margin:22px 0 0; font-family:${MONO}; font-size:11px; line-height:1.7; color:${T.cream.muted}">${esc(STATEMENT)} Six days at The Mall, Westlands, Nairobi, every February.</p>
</div>

<div style="padding:26px 0 0">${pipeRule("cream", A_MOB_W, [[92, 20], [268, 34]], 4, 34)}</div>

<div style="padding-top:20px; border-top:1px solid ${T.cream.rule}; margin-top:14px">
${INDEX_ROWS.map(([n, title, meta], i) => {
  const t = T.cream;
  const crossed = i === 2;
  const halo = crossed ? `text-shadow:4px 0 0 ${t.ground},-4px 0 0 ${t.ground},0 4px 0 ${t.ground},0 -4px 0 ${t.ground},3px 3px 0 ${t.ground},-3px 3px 0 ${t.ground},3px -3px 0 ${t.ground},-3px -3px 0 ${t.ground};` : "";
  const pipe = crossed ? `<svg width="${A_MOB_W}" height="90" style="position:absolute; inset:0; pointer-events:none"><line x1="268" y1="0" x2="268" y2="90" stroke="${t.pipe}" stroke-width="4" stroke-linecap="butt"/></svg>` : "";
  return `<div style="position:relative; height:90px; padding:16px ${A_MOB_M}px 0; border-bottom:1px solid ${t.rule}">
${pipe}
<div style="position:relative; display:flex; align-items:baseline; gap:12px">
<span style="font-family:${MONO}; font-weight:700; font-size:10px; letter-spacing:0.08em; color:${t.pipe}">${esc(n)}</span>
<span style="font-family:${DISPLAY}; font-size:21px; line-height:1; letter-spacing:-0.01em; text-transform:uppercase; color:${t.text}; ${halo}">${esc(title)}</span>
</div>
<div style="position:relative; display:flex; justify-content:space-between; align-items:center; margin-top:14px; padding-left:34px">
<span style="font-family:${MONO}; font-size:9px; letter-spacing:0.12em; text-transform:uppercase; color:${t.muted}">${esc(meta)}</span>
<span style="font-family:${MONO}; font-size:14px; color:${t.text}">&#8594;</span>
</div></div>`;
}).join("\n")}
</div>

<div style="padding:40px ${A_MOB_M}px 44px">
  <div style="font-family:${DISPLAY}; font-size:44px; line-height:0.92; letter-spacing:-0.02em; text-transform:uppercase; color:${T.cream.text}">Common<br>Grounds</div>
  <div style="margin-top:18px; font-family:${MONO}; font-size:10px; letter-spacing:0.12em; line-height:1.9; text-transform:uppercase; color:${T.cream.muted}">The 2027 theme<br>23—27 February 2027<br><a href="#">Subscribe on Substack &#8594;</a></div>
</div>

${footer("cream", A_MOB_W, A_MOB_M, 9)}
</div>`);

/* ==================================================================
   B · STATEMENT — ink. A poster: the mark, the year, one line. One
   action. The archive reachable but not shown.
   ================================================================== */

const B_W = 1440, B_M = 140, B_HERO = 960;

function ring(tone, r = 5) {
  const t = T[tone];
  const s = r * 2 + 6;
  return `<svg width="${s}" height="${s}" style="display:inline-block; vertical-align:middle"><circle cx="${s / 2}" cy="${s / 2}" r="${r}" fill="none" stroke="${t.pipe}" stroke-width="3"/></svg>`;
}

function cutEnd(tone, len = 54, stroke = 7) {
  const t = T[tone];
  return `<svg width="${len}" height="${stroke + 2}" style="display:inline-block; vertical-align:middle"><line x1="0" y1="${(stroke + 2) / 2}" x2="${len}" y2="${(stroke + 2) / 2}" stroke="${t.pipe}" stroke-width="${stroke}" stroke-linecap="butt"/></svg>`;
}

function strip(tone, w, m, items, fs = 12) {
  const t = T[tone];
  const inner = items.map(esc).join(`<span style="margin:0 20px">${ring(tone)}</span>`);
  return `<div style="display:flex; align-items:center; justify-content:center; height:96px; border-top:1px solid ${t.rule}; border-bottom:1px solid ${t.rule}; font-family:${MONO}; font-size:${fs}px; letter-spacing:0.16em; text-transform:uppercase; color:${t.text}">${inner}</div>`;
}

const B_DESK = page("ink", `
<div style="width:${B_W}px; background:${T.ink.ground}">

<div style="position:relative; height:${B_HERO}px; overflow:hidden">
  <div style="position:absolute; top:-40px; right:-60px; opacity:0.55">${concrete("bd1", 440, 320)}</div>
  <svg width="${B_W}" height="${B_HERO}" style="position:absolute; inset:0; pointer-events:none">
    <path d="M 240 0 L 240 268 Q 240 300 272 300 L 690 300" fill="none" stroke="${T.ink.pipe}" stroke-width="11" stroke-linecap="round"/>
    <line x1="${B_W}" y1="852" x2="1010" y2="852" stroke="${T.ink.pipe}" stroke-width="11" stroke-linecap="round"/>
    <rect x="1096" y="838" width="6" height="28" fill="${T.ink.text}"/>
  </svg>

  <div style="position:relative">
    ${topBar("ink", B_W, B_M, "Kilele Summit — Nairobi, Kenya", "Fourth edition")}
    <div style="padding:150px ${B_M}px 0">
      <div style="display:flex; align-items:flex-start; gap:40px">
        ${mark("ink", 700)}
        <div style="padding-top:115px">${leader("ink", 120, 24)}</div>
      </div>
      <div style="margin-top:36px; max-width:980px; font-family:${DISPLAY}; font-size:36px; line-height:1.05; letter-spacing:-0.01em; text-transform:uppercase; color:${T.ink.text}">${esc(STATEMENT)}</div>
      <div style="margin-top:26px; font-family:${MONO}; font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:${T.ink.muted}">23—27 February 2027 &#183; The Mall, Westlands, Nairobi &#183; Common Grounds</div>
      <div style="display:flex; align-items:center; gap:18px; margin-top:34px">
        ${cutEnd("ink")}
        <a href="#" style="font-family:${MONO}; font-weight:700; font-size:14px; letter-spacing:0.16em; text-transform:uppercase; color:${T.ink.text}; border-bottom:2px solid ${T.ink.pipe}; padding-bottom:6px">Subscribe on Substack &#8594;</a>
      </div>
    </div>
  </div>
</div>

${strip("ink", B_W, B_M, ["Lineup 2026", "Schedule 2026", "Gallery 2026", "News"])}

<div style="position:relative; padding:76px ${B_M}px 0">
  <div style="position:absolute; left:0; bottom:-30px; opacity:0.4">${concrete("bd2", 300, 200)}</div>
  <div style="position:relative; display:grid; grid-template-columns:1fr 460px; gap:80px; align-items:start">
    <p style="margin:0; font-family:${MONO}; font-size:15px; line-height:1.85; color:${T.ink.text}">${esc(THEME_LINE)}</p>
    <div style="font-family:${MONO}; font-size:11px; letter-spacing:0.14em; line-height:2.4; text-transform:uppercase; color:${T.ink.muted}">
      111 artists in 2026<br>66 programme points<br>125 photographs<br>29 dispatches
    </div>
  </div>
</div>

<div style="padding-top:80px">${footer("ink", B_W, B_M)}</div>
</div>`);

const B_MOB_W = 375, B_MOB_M = 22;

const B_MOB = page("ink", `
<div style="width:${B_MOB_W}px; background:${T.ink.ground}">

<div style="position:relative; height:620px; overflow:hidden">
  <div style="position:absolute; top:-20px; right:-40px; opacity:0.5">${concrete("bm1", 200, 150)}</div>
  <svg width="${B_MOB_W}" height="620" style="position:absolute; inset:0; pointer-events:none">
    <path d="M 58 0 L 58 176 Q 58 196 78 196 L 246 196" fill="none" stroke="${T.ink.pipe}" stroke-width="6" stroke-linecap="round"/>
    <line x1="${B_MOB_W}" y1="560" x2="252" y2="560" stroke="${T.ink.pipe}" stroke-width="6" stroke-linecap="round"/>
  </svg>
  <div style="position:relative">
    ${topBar("ink", B_MOB_W, B_MOB_M, "Kilele Summit", "4th ed.", 9, 38)}
    <div style="padding:92px ${B_MOB_M}px 0">
      ${mark("ink", 300, true)}
      <div style="margin-top:16px">${leader("ink", 66, 16)}</div>
      <div style="margin-top:26px; font-family:${DISPLAY}; font-size:22px; line-height:1.08; letter-spacing:-0.01em; text-transform:uppercase; color:${T.ink.text}">${esc(STATEMENT)}</div>
      <div style="margin-top:20px; font-family:${MONO}; font-size:10px; letter-spacing:0.14em; line-height:2; text-transform:uppercase; color:${T.ink.muted}">23—27 February 2027<br>The Mall, Westlands, Nairobi<br>Common Grounds</div>
      <div style="display:flex; align-items:center; gap:12px; margin-top:26px">
        ${cutEnd("ink", 28, 5)}
        <a href="#" style="font-family:${MONO}; font-weight:700; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:${T.ink.text}; border-bottom:2px solid ${T.ink.pipe}; padding-bottom:5px">Subscribe on Substack &#8594;</a>
      </div>
    </div>
  </div>
</div>

<div style="display:grid; grid-template-columns:1fr 1fr; border-top:1px solid ${T.ink.rule}">
${["Lineup 2026", "Schedule 2026", "Gallery 2026", "News"].map((s, i) => `<div style="display:flex; align-items:center; gap:10px; height:64px; padding:0 ${B_MOB_M}px; border-bottom:1px solid ${T.ink.rule}; ${i % 2 === 0 ? `border-right:1px solid ${T.ink.rule};` : ""} font-family:${MONO}; font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:${T.ink.text}">${ring("ink", 4)}${esc(s)}</div>`).join("")}
</div>

<div style="padding:34px ${B_MOB_M}px 0">
  <p style="margin:0; font-family:${MONO}; font-size:11px; line-height:1.85; color:${T.ink.text}">${esc(THEME_LINE)}</p>
</div>

<div style="padding-top:36px">${footer("ink", B_MOB_W, B_MOB_M, 9)}</div>
</div>`);

/* ==================================================================
   C · ARCHIVE — cream. The 2026 edition IS the page. Portraits are the
   body; the pipe runs in the gutter, where the ground is solid.
   ================================================================== */

const C_W = 1440, C_M = 72;

function gutterPipe(tone, w, stroke, xs, band = 56) {
  const t = T[tone];
  const mid = Math.round(band / 2);
  const legs = xs.map(([x, up, dn]) =>
    `<line x1="${x}" y1="${mid}" x2="${x}" y2="${mid - up}" stroke-linecap="round"/><line x1="${x}" y1="${mid}" x2="${x}" y2="${mid + dn}" stroke-linecap="round"/>`).join("");
  return `<svg width="${w}" height="${band}" style="display:block"><g stroke="${t.pipe}" stroke-width="${stroke}" fill="none"><line x1="0" y1="${mid}" x2="${w}" y2="${mid}" stroke-linecap="butt"/>${legs}</g></svg>`;
}

function portraitGrid(tone, list, cols, gap, capSize) {
  const t = T[tone];
  return `<div style="display:grid; grid-template-columns:repeat(${cols}, minmax(0, 1fr)); gap:${gap}px">
${list.map(a => `<div><img src="${a.file}" alt="${esc(a.name)}" style="display:block; width:100%; aspect-ratio:1; object-fit:cover; filter:grayscale(1) contrast(1.06)"><div style="margin-top:8px; font-family:${MONO}; font-size:${capSize}px; letter-spacing:0.08em; text-transform:uppercase; color:${t.muted}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${esc(a.name)}</div></div>`).join("\n")}
</div>`;
}

const C_DESK = page("cream", `
<div style="width:${C_W}px; background:${T.cream.ground}">
${topBar("cream", C_W, C_M, "Kilele Summit — Nairobi, Kenya", "Archive 2026")}

<div style="display:grid; grid-template-columns:1fr 440px; gap:60px; align-items:end; padding:56px ${C_M}px 44px">
  <div>
    ${mark("cream", 460)}
    <div style="margin-top:20px">${leader("cream", 96, 20, "2027")}</div>
  </div>
  <div style="font-family:${MONO}; font-size:12px; letter-spacing:0.14em; line-height:2.3; text-transform:uppercase; color:${T.cream.muted}; text-align:right">
    The third edition &#183; 23—28 February 2026<br>The Mall, Westlands, Nairobi<br>Theme: Sound and Solidarity
  </div>
</div>

<div style="padding:0 ${C_M}px 40px; border-top:1px solid ${T.cream.rule}; padding-top:44px">
  <div style="font-family:${DISPLAY}; font-size:56px; line-height:1; letter-spacing:-0.015em; text-transform:uppercase; color:${T.cream.text}">111 artists. 66 programme<br>points. Six days.</div>
</div>

<div style="padding:0 ${C_M}px">${portraitGrid("cream", ARTISTS.slice(0, 14), 7, 12, 9)}</div>
<div style="padding:26px 0">${gutterPipe("cream", C_W, 6, [[253, 12, 20], [627, 20, 10], [1000, 10, 18]])}</div>
<div style="padding:0 ${C_M}px">${portraitGrid("cream", ARTISTS.slice(14, 28), 7, 12, 9)}</div>

<div style="padding:72px ${C_M}px 64px">
  <div style="display:flex; align-items:baseline; gap:28px">
    <span style="font-family:${DISPLAY}; font-size:96px; line-height:0.9; letter-spacing:-0.02em; text-transform:uppercase; color:${T.cream.text}">And 83 more</span>
    <a href="#" style="font-family:${MONO}; font-size:13px; letter-spacing:0.16em; text-transform:uppercase">Lineup 2026 &#8594;</a>
  </div>
</div>

<div style="display:flex; justify-content:space-between; align-items:center; height:112px; padding:0 ${C_M}px; border-top:1px solid ${T.cream.rule}; border-bottom:1px solid ${T.cream.rule}">
  <span style="font-family:${MONO}; font-weight:700; font-size:14px; letter-spacing:0.16em; text-transform:uppercase; color:${T.cream.text}">Next &#183; Common Grounds &#183; 23—27 February 2027</span>
  <a href="#" style="font-family:${MONO}; font-size:13px; letter-spacing:0.16em; text-transform:uppercase; border-bottom:2px solid ${T.cream.pipe}; padding-bottom:5px">Subscribe on Substack &#8594;</a>
</div>

${footer("cream", C_W, C_M)}
</div>`);

const C_MOB_W = 375, C_MOB_M = 20;

const C_MOB = page("cream", `
<div style="width:${C_MOB_W}px; background:${T.cream.ground}">
${topBar("cream", C_MOB_W, C_MOB_M, "Kilele Summit", "Archive 2026", 9, 38)}

<div style="padding:24px ${C_MOB_M}px 26px">
  ${mark("cream", 250, true)}
  <div style="margin-top:14px">${leader("cream", 60, 15)}</div>
  <div style="margin-top:20px; font-family:${MONO}; font-size:9px; letter-spacing:0.12em; line-height:2; text-transform:uppercase; color:${T.cream.muted}">
    The third edition &#183; 23—28 February 2026<br>The Mall, Westlands, Nairobi
  </div>
</div>

<div style="padding:22px ${C_MOB_M}px 22px; border-top:1px solid ${T.cream.rule}">
  <div style="font-family:${DISPLAY}; font-size:26px; line-height:1.02; letter-spacing:-0.015em; text-transform:uppercase; color:${T.cream.text}">111 artists.<br>66 programme points.<br>Six days.</div>
</div>

<div style="padding:0 ${C_MOB_M}px">${portraitGrid("cream", ARTISTS.slice(0, 6), 3, 8, 7)}</div>
<div style="padding:16px 0">${gutterPipe("cream", C_MOB_W, 4, [[96, 8, 14], [252, 14, 7]], 36)}</div>
<div style="padding:0 ${C_MOB_M}px">${portraitGrid("cream", ARTISTS.slice(6, 18), 3, 8, 7)}</div>

<div style="padding:34px ${C_MOB_M}px 30px">
  <div style="font-family:${DISPLAY}; font-size:38px; line-height:0.94; letter-spacing:-0.02em; text-transform:uppercase; color:${T.cream.text}">And 93<br>more</div>
  <a href="#" style="display:inline-block; margin-top:16px; font-family:${MONO}; font-size:10px; letter-spacing:0.14em; text-transform:uppercase">Lineup 2026 &#8594;</a>
</div>

<div style="padding:24px ${C_MOB_M}px; border-top:1px solid ${T.cream.rule}; border-bottom:1px solid ${T.cream.rule}">
  <div style="font-family:${MONO}; font-weight:700; font-size:11px; letter-spacing:0.14em; line-height:1.9; text-transform:uppercase; color:${T.cream.text}">Next &#183; Common Grounds<br>23—27 February 2027</div>
  <a href="#" style="display:inline-block; margin-top:14px; font-family:${MONO}; font-size:10px; letter-spacing:0.14em; text-transform:uppercase; border-bottom:2px solid ${T.cream.pipe}; padding-bottom:4px">Subscribe on Substack &#8594;</a>
</div>

${footer("cream", C_MOB_W, C_MOB_M, 9)}
</div>`);

/* ==================================================================
   D · OPENER — ink. Keeps the 2026 full-bleed image. The mark cannot
   sit on a photograph (#137), so it gets a solid ink slab to stand on
   — the constraint made visible rather than designed around.
   ================================================================== */

const D_W = 1440, D_M = 72, D_HERO = 860;

const D_CARDS = [
  ["Lineup 2026", "111 artists", "kmru.jpg"],
  ["Schedule 2026", "66 programme points", "kampire.jpg"],
  ["Gallery 2026", "125 photographs", "sisso-and-maiko.jpg"],
];

const D_DESK = page("ink", `
<div style="width:${D_W}px; background:${T.ink.ground}">

<div style="position:relative; height:${D_HERO}px; overflow:hidden">
  <img src="diver.jpg" alt="Kilele 2026" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover">
  <div style="position:absolute; inset:0; background:linear-gradient(180deg, rgba(15,15,14,0.62) 0%, rgba(15,15,14,0.18) 42%, rgba(15,15,14,0.92) 100%)"></div>
  <svg width="${D_W}" height="${D_HERO}" style="position:absolute; inset:0; pointer-events:none">
    <g stroke="${T.ink.pipe}" stroke-width="8" fill="none">
      <line x1="36" y1="0" x2="36" y2="${D_HERO}" stroke-linecap="butt"/>
      <line x1="1404" y1="0" x2="1404" y2="${D_HERO}" stroke-linecap="butt"/>
      <line x1="0" y1="164" x2="${D_W}" y2="164" stroke-linecap="butt"/>
      <line x1="286" y1="164" x2="286" y2="248" stroke-linecap="round"/>
      <line x1="980" y1="164" x2="980" y2="212" stroke-linecap="round"/>
      <line x1="1176" y1="164" x2="1176" y2="284" stroke-linecap="round"/>
    </g>
  </svg>

  <div style="position:relative">
    ${topBar("ink", D_W, D_M, "Kilele Summit", "Lineup &#183; Schedule &#183; Gallery &#183; News")}
  </div>

  <div style="position:absolute; left:${D_M}px; bottom:56px; background:${T.ink.ground}; padding:40px 48px 34px">
    ${mark("ink", 520)}
    <div style="margin-top:22px">${leader("ink", 104, 21)}</div>
  </div>
</div>

<div style="padding:76px ${D_M}px 0">
  <div style="font-family:${DISPLAY}; font-size:88px; line-height:0.94; letter-spacing:-0.02em; text-transform:uppercase; color:${T.ink.text}">Common Grounds</div>
  <div style="margin-top:22px; font-family:${MONO}; font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:${T.ink.pipe}">23—27 February 2027 &#183; The Mall, Westlands, Nairobi</div>
  <p style="max-width:900px; margin:34px 0 0; font-family:${MONO}; font-size:15px; line-height:1.85; color:${T.ink.text}">${esc(THEME_LINE)}</p>
  <div style="display:flex; align-items:center; gap:18px; margin-top:34px">
    ${cutEnd("ink")}
    <a href="#" style="font-family:${MONO}; font-weight:700; font-size:14px; letter-spacing:0.16em; text-transform:uppercase; color:${T.ink.text}; border-bottom:2px solid ${T.ink.pipe}; padding-bottom:6px">Subscribe on Substack &#8594;</a>
  </div>
</div>

<div style="display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:24px; padding:72px ${D_M}px 84px">
${D_CARDS.map(([title, meta, img]) => `<div>
<img src="${img}" alt="" style="display:block; width:100%; height:240px; object-fit:cover; filter:grayscale(1) contrast(1.06)">
<div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:16px; padding-top:14px; border-top:1px solid ${T.ink.rule}">
<span style="font-family:${DISPLAY}; font-size:22px; text-transform:uppercase; color:${T.ink.text}">${esc(title)}</span>
<span style="font-family:${MONO}; font-size:14px; color:${T.ink.text}">&#8594;</span></div>
<div style="margin-top:8px; font-family:${MONO}; font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:${T.ink.muted}">${esc(meta)}</div>
</div>`).join("\n")}
</div>

${footer("ink", D_W, D_M)}
</div>`);

const D_MOB_W = 375, D_MOB_M = 20, D_MOB_HERO = 540;

const D_MOB = page("ink", `
<div style="width:${D_MOB_W}px; background:${T.ink.ground}">

<div style="position:relative; height:${D_MOB_HERO}px; overflow:hidden">
  <img src="diver-vert.jpg" alt="Kilele 2026" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover">
  <div style="position:absolute; inset:0; background:linear-gradient(180deg, rgba(15,15,14,0.62) 0%, rgba(15,15,14,0.18) 40%, rgba(15,15,14,0.94) 100%)"></div>
  <svg width="${D_MOB_W}" height="${D_MOB_HERO}" style="position:absolute; inset:0; pointer-events:none">
    <g stroke="${T.ink.pipe}" stroke-width="5" fill="none">
      <line x1="14" y1="0" x2="14" y2="${D_MOB_HERO}" stroke-linecap="butt"/>
      <line x1="361" y1="0" x2="361" y2="${D_MOB_HERO}" stroke-linecap="butt"/>
      <line x1="0" y1="118" x2="${D_MOB_W}" y2="118" stroke-linecap="butt"/>
      <line x1="106" y1="118" x2="106" y2="166" stroke-linecap="round"/>
      <line x1="284" y1="118" x2="284" y2="146" stroke-linecap="round"/>
    </g>
  </svg>
  <div style="position:relative">
    ${topBar("ink", D_MOB_W, D_MOB_M, "Kilele Summit", "Menu", 9, 38)}
  </div>
  <div style="position:absolute; left:0; right:0; bottom:0; background:${T.ink.ground}; padding:24px ${D_MOB_M}px 22px">
    ${mark("ink", 280, true)}
    <div style="margin-top:14px">${leader("ink", 62, 15)}</div>
  </div>
</div>

<div style="padding:30px ${D_MOB_M}px 0">
  <div style="font-family:${DISPLAY}; font-size:34px; line-height:0.96; letter-spacing:-0.02em; text-transform:uppercase; color:${T.ink.text}">Common<br>Grounds</div>
  <div style="margin-top:16px; font-family:${MONO}; font-size:10px; letter-spacing:0.14em; line-height:1.9; text-transform:uppercase; color:${T.ink.pipe}">23—27 February 2027<br>The Mall, Westlands, Nairobi</div>
  <p style="margin:22px 0 0; font-family:${MONO}; font-size:11px; line-height:1.85; color:${T.ink.text}">${esc(THEME_LINE)}</p>
  <div style="display:flex; align-items:center; gap:12px; margin-top:24px">
    ${cutEnd("ink", 28, 5)}
    <a href="#" style="font-family:${MONO}; font-weight:700; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:${T.ink.text}; border-bottom:2px solid ${T.ink.pipe}; padding-bottom:5px">Subscribe on Substack &#8594;</a>
  </div>
</div>

<div style="display:flex; flex-direction:column; gap:22px; padding:34px ${D_MOB_M}px 40px">
${D_CARDS.map(([title, meta, img]) => `<div>
<img src="${img}" alt="" style="display:block; width:100%; height:150px; object-fit:cover; filter:grayscale(1) contrast(1.06)">
<div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:12px; padding-top:10px; border-top:1px solid ${T.ink.rule}">
<span style="font-family:${DISPLAY}; font-size:16px; text-transform:uppercase; color:${T.ink.text}">${esc(title)}</span>
<span style="font-family:${MONO}; font-size:12px; color:${T.ink.text}">&#8594;</span></div>
<div style="margin-top:6px; font-family:${MONO}; font-size:9px; letter-spacing:0.12em; text-transform:uppercase; color:${T.ink.muted}">${esc(meta)}</div>
</div>`).join("\n")}
</div>

${footer("ink", D_MOB_W, D_MOB_M, 9)}
</div>`);


const NEWS = [
  ["15 Jul 2026", "Embodied Archives video is out", "news-embodied.jpg"],
  ["08 Apr 2026", "We Made It to Kilele, and Beyond", "news-beyond.jpg"],
  ["13 Mar 2026", "Faces At Kilele", "news-faces.jpg"],
];

/* ==================================================================
   E · PRESS — cream, gritty. Answers the B/C split directly: C's grid
   discipline and its faces, B's material (concrete, halftone, hatching,
   a page-wide print grain), and D's lower block, which was the part of
   D that worked. Ink appears once, as a contained band, so the page has
   B's weight without B's mood.
   ================================================================== */

const E_W = 1440, E_M = 72;

// #133: halftone needs a pitch of 12px or more or it turns to mud.
function halftone(color, pitch = 14, r = 2.1) {
  return `background-image:radial-gradient(circle, ${color} ${r}px, transparent ${r + 0.4}px); background-size:${pitch}px ${pitch}px`;
}
function hatch(color, pitch = 7) {
  return `background-image:repeating-linear-gradient(45deg, ${color} 0 1px, transparent 1px ${pitch}px)`;
}
const grainLayer = (z = 5, o = 1) =>
  `<div style="position:absolute; inset:0; background-image:url(./grain.png); background-repeat:repeat; opacity:${o}; pointer-events:none; z-index:${z}"></div>`;

const PRINT = "grayscale(1) sepia(0.24) contrast(1.12)";

function pressGrid(tone, list, cols, gap, capSize) {
  const t = T[tone];
  return `<div style="display:grid; grid-template-columns:repeat(${cols}, minmax(0, 1fr)); gap:${gap}px">
${list.map(a => `<div><div style="position:relative"><img src="${a.file}" alt="${esc(a.name)}" style="display:block; width:100%; aspect-ratio:1; object-fit:cover; filter:${PRINT}"><div style="position:absolute; inset:0; ${halftone("rgba(15,15,14,0.30)", 13, 1.5)}; mix-blend-mode:multiply; opacity:0.45"></div></div><div style="margin-top:8px; font-family:${MONO}; font-size:${capSize}px; letter-spacing:0.08em; text-transform:uppercase; color:${t.muted}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${esc(a.name)}</div></div>`).join("\n")}
</div>`;
}

const E_DESK = page("cream", `
<div style="position:relative; width:${E_W}px; background:${T.cream.ground}">

${topBar("cream", E_W, E_M, "Kilele Summit — Nairobi, Kenya", "Fourth edition")}

<div style="position:relative; overflow:hidden; padding:56px ${E_M}px 40px">
  <div style="position:absolute; top:-34px; right:-50px; opacity:0.5">${concrete("ed1", 400, 270)}</div>
  <div style="position:relative; display:grid; grid-template-columns:1fr 400px; gap:60px; align-items:end">
    <div>
      ${mark("cream", 520)}
      <div style="margin-top:22px">${leader("cream", 104, 22)}</div>
    </div>
    <div style="font-family:${MONO}; font-size:12px; letter-spacing:0.13em; line-height:2.2; text-transform:uppercase; color:${T.cream.muted}; text-align:right">
      East Africa's first and only summit<br>for music, tech and culture<br>The Mall, Westlands, Nairobi
    </div>
  </div>
</div>

<div style="position:relative; overflow:hidden; border-top:1px solid ${T.cream.rule}; padding:64px ${E_M}px 60px">
  <div style="position:absolute; top:0; right:0; width:460px; height:100%; ${halftone("rgba(74,71,66,0.55)")}; opacity:0.5"></div>
  <div style="position:relative">
    <div style="font-family:${DISPLAY}; font-size:104px; line-height:0.93; letter-spacing:-0.02em; text-transform:uppercase; color:${T.cream.text}">Common Grounds</div>
    <div style="margin-top:24px; font-family:${MONO}; font-weight:700; font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:${T.cream.pipe}">23—27 February 2027 &#183; The Mall, Westlands, Nairobi</div>
    <p style="max-width:880px; margin:30px 0 0; font-family:${MONO}; font-size:15px; line-height:1.85; color:${T.cream.text}">${esc(THEME_LINE)}</p>
    <div style="display:flex; align-items:center; gap:18px; margin-top:34px">
      ${cutEnd("cream")}
      <a href="#" style="font-family:${MONO}; font-weight:700; font-size:14px; letter-spacing:0.16em; text-transform:uppercase; color:${T.cream.text}; border-bottom:2px solid ${T.cream.pipe}; padding-bottom:6px">Subscribe on Substack &#8594;</a>
    </div>
  </div>
</div>

<div style="border-top:1px solid ${T.cream.rule}; padding:44px ${E_M}px 56px">
  <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:28px">
    <span style="font-family:${DISPLAY}; font-size:30px; text-transform:uppercase; color:${T.cream.text}">Latest</span>
    <a href="#" style="font-family:${MONO}; font-size:11px; letter-spacing:0.14em; text-transform:uppercase">All 29 dispatches &#8594;</a>
  </div>
  <div style="display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:24px">
${NEWS.map(([date, title, img]) => `<div>
<img src="${img}" alt="" style="display:block; width:100%; height:220px; object-fit:cover; filter:${PRINT}">
<div style="margin-top:14px; font-family:${MONO}; font-weight:700; font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:${T.cream.pipe}">${esc(date)}</div>
<div style="margin-top:8px; font-family:${DISPLAY}; font-size:20px; line-height:1.1; text-transform:uppercase; color:${T.cream.text}">${esc(title)}</div>
</div>`).join("\n")}
  </div>
</div>

<div>${pipeRule("cream", E_W, [[253, 34], [627, 20], [1000, 48], [1187, 14]], 7, 48)}</div>

<div style="display:flex; justify-content:space-between; align-items:baseline; padding:34px ${E_M}px 22px">
  <span style="font-family:${DISPLAY}; font-size:30px; text-transform:uppercase; color:${T.cream.text}">The 2026 edition</span>
  <span style="font-family:${MONO}; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:${T.cream.muted}">111 artists &#183; 66 programme points &#183; six days</span>
</div>

<div style="padding:0 ${E_M}px">${pressGrid("cream", ARTISTS.slice(0, 14), 7, 12, 9)}</div>
<div style="padding:24px 0">${gutterPipe("cream", E_W, 6, [[253, 12, 20], [627, 20, 10], [1000, 10, 18]])}</div>
<div style="padding:0 ${E_M}px">${pressGrid("cream", ARTISTS.slice(14, 28), 7, 12, 9)}</div>

<div style="padding:60px ${E_M}px 56px">
  <div style="display:flex; align-items:baseline; gap:28px">
    <span style="font-family:${DISPLAY}; font-size:88px; line-height:0.9; letter-spacing:-0.02em; text-transform:uppercase; color:${T.cream.text}">And 83 more</span>
    <a href="#" style="font-family:${MONO}; font-size:13px; letter-spacing:0.16em; text-transform:uppercase">Lineup 2026 &#8594;</a>
  </div>
</div>

<div style="position:relative; overflow:hidden; background:${T.ink.ground}; padding:64px ${E_M}px 72px">
  <div style="position:absolute; inset:0; ${hatch("rgba(242,238,226,0.16)")}; opacity:0.7"></div>
  <div style="position:relative; display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:24px">
${D_CARDS.map(([title, meta, img]) => `<div>
<img src="${img}" alt="" style="display:block; width:100%; height:230px; object-fit:cover; filter:${PRINT}">
<div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:16px; padding-top:14px; border-top:1px solid ${T.ink.rule}">
<span style="font-family:${DISPLAY}; font-size:22px; text-transform:uppercase; color:${T.ink.text}">${esc(title)}</span>
<span style="font-family:${MONO}; font-size:14px; color:${T.ink.text}">&#8594;</span></div>
<div style="margin-top:8px; font-family:${MONO}; font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:${T.ink.muted}">${esc(meta)}</div>
</div>`).join("\n")}
  </div>
</div>

<div style="display:flex; justify-content:space-between; align-items:center; height:112px; padding:0 ${E_M}px; border-bottom:1px solid ${T.cream.rule}">
  <span style="font-family:${MONO}; font-weight:700; font-size:14px; letter-spacing:0.16em; text-transform:uppercase; color:${T.cream.text}">Next &#183; Common Grounds &#183; 23—27 February 2027</span>
  <a href="#" style="font-family:${MONO}; font-size:13px; letter-spacing:0.16em; text-transform:uppercase; border-bottom:2px solid ${T.cream.pipe}; padding-bottom:5px">Subscribe on Substack &#8594;</a>
</div>

${footer("cream", E_W, E_M)}
${grainLayer()}
</div>`);

const E_MOB_W = 375, E_MOB_M = 20;

const E_MOB = page("cream", `
<div style="position:relative; width:${E_MOB_W}px; background:${T.cream.ground}">

${topBar("cream", E_MOB_W, E_MOB_M, "Kilele Summit", "4th ed.", 9, 38)}

<div style="position:relative; overflow:hidden; padding:24px ${E_MOB_M}px 26px">
  <div style="position:absolute; top:-16px; right:-30px; opacity:0.45">${concrete("em1", 180, 130)}</div>
  <div style="position:relative">
    ${mark("cream", 280, true)}
    <div style="margin-top:14px">${leader("cream", 62, 16)}</div>
    <div style="margin-top:20px; font-family:${MONO}; font-size:9px; letter-spacing:0.12em; line-height:2; text-transform:uppercase; color:${T.cream.muted}">
      East Africa's first and only summit<br>for music, tech and culture
    </div>
  </div>
</div>

<div style="position:relative; overflow:hidden; border-top:1px solid ${T.cream.rule}; padding:30px ${E_MOB_M}px 30px">
  <div style="position:absolute; top:0; right:0; width:150px; height:100%; ${halftone("rgba(74,71,66,0.5)", 12, 1.7)}; opacity:0.45"></div>
  <div style="position:relative">
    <div style="font-family:${DISPLAY}; font-size:38px; line-height:0.95; letter-spacing:-0.02em; text-transform:uppercase; color:${T.cream.text}">Common<br>Grounds</div>
    <div style="margin-top:16px; font-family:${MONO}; font-weight:700; font-size:10px; letter-spacing:0.14em; line-height:1.9; text-transform:uppercase; color:${T.cream.pipe}">23—27 February 2027<br>The Mall, Westlands, Nairobi</div>
    <p style="margin:20px 0 0; font-family:${MONO}; font-size:11px; line-height:1.85; color:${T.cream.text}">${esc(THEME_LINE)}</p>
    <div style="display:flex; align-items:center; gap:12px; margin-top:24px">
      ${cutEnd("cream", 28, 5)}
      <a href="#" style="font-family:${MONO}; font-weight:700; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:${T.cream.text}; border-bottom:2px solid ${T.cream.pipe}; padding-bottom:5px">Subscribe on Substack &#8594;</a>
    </div>
  </div>
</div>

<div style="border-top:1px solid ${T.cream.rule}; padding:26px ${E_MOB_M}px 30px">
  <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:18px">
    <span style="font-family:${DISPLAY}; font-size:20px; text-transform:uppercase; color:${T.cream.text}">Latest</span>
    <a href="#" style="font-family:${MONO}; font-size:9px; letter-spacing:0.12em; text-transform:uppercase">All 29 &#8594;</a>
  </div>
  <div style="display:flex; flex-direction:column; gap:22px">
${NEWS.map(([date, title, img]) => `<div>
<img src="${img}" alt="" style="display:block; width:100%; height:150px; object-fit:cover; filter:${PRINT}">
<div style="margin-top:12px; font-family:${MONO}; font-weight:700; font-size:9px; letter-spacing:0.16em; text-transform:uppercase; color:${T.cream.pipe}">${esc(date)}</div>
<div style="margin-top:6px; font-family:${DISPLAY}; font-size:17px; line-height:1.12; text-transform:uppercase; color:${T.cream.text}">${esc(title)}</div>
</div>`).join("\n")}
  </div>
</div>

<div>${pipeRule("cream", E_MOB_W, [[96, 22], [252, 12]], 4, 26)}</div>

<div style="padding:22px ${E_MOB_M}px 16px">
  <div style="font-family:${DISPLAY}; font-size:20px; text-transform:uppercase; color:${T.cream.text}">The 2026 edition</div>
  <div style="margin-top:8px; font-family:${MONO}; font-size:9px; letter-spacing:0.12em; text-transform:uppercase; color:${T.cream.muted}">111 artists &#183; 66 programme points &#183; six days</div>
</div>

<div style="padding:0 ${E_MOB_M}px">${pressGrid("cream", ARTISTS.slice(0, 6), 3, 8, 7)}</div>
<div style="padding:14px 0">${gutterPipe("cream", E_MOB_W, 4, [[96, 8, 14], [252, 14, 7]], 34)}</div>
<div style="padding:0 ${E_MOB_M}px">${pressGrid("cream", ARTISTS.slice(6, 12), 3, 8, 7)}</div>

<div style="padding:32px ${E_MOB_M}px 28px">
  <div style="font-family:${DISPLAY}; font-size:36px; line-height:0.94; letter-spacing:-0.02em; text-transform:uppercase; color:${T.cream.text}">And 99<br>more</div>
  <a href="#" style="display:inline-block; margin-top:14px; font-family:${MONO}; font-size:10px; letter-spacing:0.14em; text-transform:uppercase">Lineup 2026 &#8594;</a>
</div>

<div style="position:relative; overflow:hidden; background:${T.ink.ground}; padding:30px ${E_MOB_M}px 34px">
  <div style="position:absolute; inset:0; ${hatch("rgba(242,238,226,0.16)", 6)}; opacity:0.7"></div>
  <div style="position:relative; display:flex; flex-direction:column; gap:22px">
${D_CARDS.map(([title, meta, img]) => `<div>
<img src="${img}" alt="" style="display:block; width:100%; height:140px; object-fit:cover; filter:${PRINT}">
<div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:12px; padding-top:10px; border-top:1px solid ${T.ink.rule}">
<span style="font-family:${DISPLAY}; font-size:16px; text-transform:uppercase; color:${T.ink.text}">${esc(title)}</span>
<span style="font-family:${MONO}; font-size:12px; color:${T.ink.text}">&#8594;</span></div>
<div style="margin-top:6px; font-family:${MONO}; font-size:9px; letter-spacing:0.12em; text-transform:uppercase; color:${T.ink.muted}">${esc(meta)}</div>
</div>`).join("\n")}
  </div>
</div>

<div style="padding:24px ${E_MOB_M}px; border-bottom:1px solid ${T.cream.rule}">
  <div style="font-family:${MONO}; font-weight:700; font-size:11px; letter-spacing:0.14em; line-height:1.9; text-transform:uppercase; color:${T.cream.text}">Next &#183; Common Grounds<br>23—27 February 2027</div>
  <a href="#" style="display:inline-block; margin-top:14px; font-family:${MONO}; font-size:10px; letter-spacing:0.14em; text-transform:uppercase; border-bottom:2px solid ${T.cream.pipe}; padding-bottom:4px">Subscribe on Substack &#8594;</a>
</div>

${footer("cream", E_MOB_W, E_MOB_M, 9)}
${grainLayer()}
</div>`);

/* ---------- write ---------- */

const FILES = {
  "Main.dc.html": A_DESK,               // A · Index — desktop (leading candidate)
  "IndexMobile.dc.html": A_MOB,
  "StatementDesktop.dc.html": B_DESK,
  "StatementMobile.dc.html": B_MOB,
  "ArchiveDesktop.dc.html": C_DESK,
  "ArchiveMobile.dc.html": C_MOB,
  "OpenerDesktop.dc.html": D_DESK,
  "OpenerMobile.dc.html": D_MOB,
  "PressDesktop.dc.html": E_DESK,
  "PressMobile.dc.html": E_MOB,
};

for (const [name, src] of Object.entries(FILES)) fs.writeFileSync(new URL("./" + name, import.meta.url), src);

const MOB_X = 1600, GAP_Y = 180;
const rows = [
  { key: "E", deskFile: "PressDesktop.dc.html", deskTitle: "E · Press — desktop 1440", deskH: 3500,
    mobFile: "PressMobile.dc.html", mobTitle: "E · Press — 375", mobH: 3500 },
  { key: "A", deskFile: "Main.dc.html", deskTitle: "A · Index — desktop 1440", deskH: 2300,
    mobFile: "IndexMobile.dc.html", mobTitle: "A · Index — 375", mobH: 1450 },
  { key: "B", deskFile: "StatementDesktop.dc.html", deskTitle: "B · Statement — desktop 1440", deskH: 1700,
    mobFile: "StatementMobile.dc.html", mobTitle: "B · Statement — 375", mobH: 1200 },
  { key: "C", deskFile: "ArchiveDesktop.dc.html", deskTitle: "C · Archive — desktop 1440", deskH: 2100,
    mobFile: "ArchiveMobile.dc.html", mobTitle: "C · Archive — 375", mobH: 1750 },
  { key: "D", deskFile: "OpenerDesktop.dc.html", deskTitle: "D · Opener — desktop 1440", deskH: 2000,
    mobFile: "OpenerMobile.dc.html", mobTitle: "D · Opener — 375", mobH: 1950 },
];

const NOTES = {
  E: "E · PRESS — CHOSEN (#138).\nC's grid and C's faces, B's material, and the part of D that worked (the block below Common Grounds). Cream ground; ink appears ONCE, as a contained band.\n\nGROUND is the locked #f2eee2 from #136 — a cooled variant was tried and reverted. A real background TEXTURE is wanted for the final and is not decided here.\n\nGRIT: a tiled print grain (placeholder, deliberately strong), concrete at the masthead, halftone at 13–14px pitch, hatching in the ink band. Portraits warmed with sepia rather than flat grey.\n\nORDER: theme, then latest news, then the 2026 archive, then the archive cards. That order is load-bearing — no 2027 artists exist yet, so news carries the page today and the 2026 grid is labelled as archive.\n\nSTILL OPEN: the final texture, and whether the reduced-leg mark at 375px holds.",
  A: "A · INDEX — riskiest.\nThe mark is the only large element; the site becomes a numbered parts catalogue of what already exists. Every number is real (111 / 66 / 5 / 125 / 29).\n\nWHY: most faithful to the MSCHF register in the map's Notes — deadpan, institutional, humour in the rigour. Costs nothing to author and never goes stale: the counts update themselves from Supabase.\n\nTRADEOFF: a visitor who wants a festival poster gets a directory instead. Row 003 shows the pipe crossing type with a knockout — the one place the motif appears at page scale.",
  B: "B · STATEMENT — ink poster.\nOne screen: mark, year on its dimension leader, one line, one action. The archive is a strip, not the body.\n\nWHY: highest impact per pixel, and the only direction that reads as a poster rather than a website. The concrete blocks and the downcomer do the work the content isn't doing.\n\nTRADEOFF: it says almost nothing. If someone arrives wanting the lineup or the schedule, they are one strip away from bouncing. Also the least to look at on a return visit.",
  C: "C · ARCHIVE — cream, portraits as the body.\n28 of the 111 portraits shown, greyscaled so the red still reads as the only colour. The pipe runs in the GUTTER between grid rows — the one place on a photographic page where the knockout ground still exists (#137).\n\nWHY: zero new authoring, and the most human page of the four. Faces sell a festival.\n\nTRADEOFF: the whole page is last year. Without a strong 2027 line at the top it can read as an archive site rather than a live one. Greyscale is a real decision to accept or reject.",
  D: "D · OPENER — keeps the 2026 image.\nThe safest end, but not conventional: the photo is framed by pipe rails and the mark sits on a SOLID INK SLAB dropped over the image, because the knockout halo cannot survive a photographic ground.\n\nWHY: least disruptive to what exists, and the image is genuinely good.\n\nTRADEOFF: the slab is the compromise — judge whether it reads as deliberate or as a logo in a box. The photo also does most of the talking, so the new identity does the least work here.",
};

const artboards = [];
const annotations = [];
let y = 0;
for (const r of rows) {
  artboards.push({ file: r.deskFile, x: 0, y, w: 1440, h: r.deskH, title: r.deskTitle });
  artboards.push({ file: r.mobFile, x: MOB_X, y, w: 375, h: r.mobH, title: r.mobTitle });
  annotations.push({ id: "note-" + r.key.toLowerCase(), x: 2080, y, w: 360, text: NOTES[r.key] });
  y += Math.max(r.deskH, r.mobH) + GAP_Y;
}

fs.writeFileSync(new URL("./canvas.json", import.meta.url), JSON.stringify({
  artboards, annotations, launch: { view: "canvas" },
}, null, 2));

console.log("wrote " + Object.keys(FILES).length + " artboards + canvas.json");
