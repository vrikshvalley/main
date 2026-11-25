/**
 * JSON for a <script type="application/ld+json"> tag. Plain JSON.stringify is
 * not safe inside a script element: a product name containing "</script>"
 * would end the tag and run whatever follows.
 */
const BACKSLASH = String.fromCharCode(92);
const LINE_SEP = String.fromCharCode(0x2028);
const PARA_SEP = String.fromCharCode(0x2029);

const escapeChar = (code) => BACKSLASH + "u" + code.toString(16).padStart(4, "0");

export function jsonLd(data) {
  return JSON.stringify(data)
    .split("<").join(escapeChar(0x3c))
    .split(">").join(escapeChar(0x3e))
    .split("&").join(escapeChar(0x26))
    .split(LINE_SEP).join(escapeChar(0x2028))
    .split(PARA_SEP).join(escapeChar(0x2029));
}
