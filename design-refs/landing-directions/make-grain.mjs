// A tileable print-grain tile, written as a PNG with no dependencies.
// #133 settled that noise is baked into a small tiled background-image
// (4.3ms) rather than run as a live full-bleed filter (636ms); this is
// that tile. Pure per-pixel randomness tiles seamlessly — there is no
// low-frequency structure to line up at the seams.
import fs from "node:fs";
import zlib from "node:zlib";

const SIZE = 160;
const INK = [15, 15, 14];      // --ink
const CREAM = [242, 238, 226]; // --cream

const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return (buf) => {
    let c = -1;
    for (const b of buf) c = t[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  };
})();

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(CRC(body));
  return Buffer.concat([len, body, crc]);
}

const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1));
let p = 0;
for (let y = 0; y < SIZE; y++) {
  raw[p++] = 0; // filter: none
  for (let x = 0; x < SIZE; x++) {
    const dark = Math.random() < 0.52;
    const [r, g, b] = dark ? INK : CREAM;
    // Squash the distribution so most pixels are almost clear and the
    // occasional speck lands hard — toner, not TV static.
    const a = Math.round(Math.pow(Math.random(), 1.9) * (dark ? 84 : 70));
    raw[p++] = r; raw[p++] = g; raw[p++] = b; raw[p++] = a;
  }
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0); ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

fs.writeFileSync(new URL("./img/grain.png", import.meta.url), Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]));
console.log("wrote img/grain.png");
