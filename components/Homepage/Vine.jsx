/**
 * Static SVG vines for the hero. Leaf positions are computed once at module
 * load from cubic Bezier segments, so nothing is recalculated on render or
 * scroll. All motion is CSS (see styles/heroSlider.scss).
 */

const LEAF = "M0 0 C5 -7 15 -8 22 0 C15 8 5 7 0 0Z";
const LEAF_COLORS = ["#399663", "#1a5c3a", "#5fb683", "#2f7f52"];

function cubicPoint(p0, p1, p2, p3, t) {
  const u = 1 - t;
  const x = u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0];
  const y = u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1];
  const dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
  const dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI };
}

function buildVine(segments, { step = 0.07, size = 1, seed = 0 } = {}) {
  let d = `M${segments[0][0].join(" ")}`;
  const leaves = [];
  let i = seed;
  for (const [p0, p1, p2, p3] of segments) {
    d += ` C${p1.join(" ")} ${p2.join(" ")} ${p3.join(" ")}`;
    for (let t = step / 2; t < 1; t += step) {
      const { x, y, angle } = cubicPoint(p0, p1, p2, p3, t);
      const side = i % 2 === 0 ? 1 : -1;
      // deterministic "random" variation so server and client render the same
      const jitter = ((i * 37) % 11) / 10;
      leaves.push({
        x: +x.toFixed(1),
        y: +y.toFixed(1),
        r: +(angle + side * (45 + jitter * 20)).toFixed(1),
        s: +(size * (0.75 + jitter * 0.5)).toFixed(2),
        c: LEAF_COLORS[i % LEAF_COLORS.length],
      });
      i += 1;
    }
  }
  return { d, leaves };
}

const VINES = {
  // Two sagging swags across the top of the hero
  garland: {
    viewBox: "0 0 1440 170",
    ...buildVine(
      [
        [[-20, 12], [240, 150], [500, 150], [720, 46]],
        [[720, 46], [940, 150], [1200, 150], [1460, 12]],
      ],
      { step: 0.035, size: 1.1 }
    ),
  },
  // Trailing off the left end of the shelf
  shelfLeft: {
    viewBox: "0 0 140 230",
    ...buildVine([[[118, 4], [70, 30], [20, 90], [40, 220]]], { step: 0.11, size: 0.9, seed: 1 }),
  },
  // Trailing off the right end of the shelf
  shelfRight: {
    viewBox: "0 0 140 190",
    ...buildVine([[[22, 4], [80, 40], [130, 90], [96, 180]]], { step: 0.13, size: 0.9, seed: 2 }),
  },
};

export default function Vine({ name, className }) {
  const vine = VINES[name];
  if (!vine) return null;
  return (
    <svg
      className={className}
      viewBox={vine.viewBox}
      preserveAspectRatio="xMidYMin meet"
      aria-hidden="true"
      focusable="false"
    >
      <path className="vineStem" d={vine.d} fill="none" stroke="#2f6b45" strokeWidth="3" strokeLinecap="round" pathLength="1" />
      <g className="vineLeaves">
        {vine.leaves.map((l, idx) => (
          <path
            key={idx}
            d={LEAF}
            fill={l.c}
            transform={`translate(${l.x} ${l.y}) rotate(${l.r}) scale(${l.s})`}
            style={{ "--i": idx }}
          />
        ))}
      </g>
    </svg>
  );
}
