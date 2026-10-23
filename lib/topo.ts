// Builds contour lines for the title screen's elevation map.
// Returns SVG path strings so react-native-svg can draw them.

export type Contours = {
  minor: string;
  index: string;
  labels: { x: number; y: number; text: string }[];
  summit: { x: number; y: number };
};

export function buildContours(W: number, H: number): Contours {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const N = 9;
  const grid = Array.from({ length: N * N }, rnd);
  const noise = (x: number, y: number) => {
    x *= N - 1;
    y *= N - 1;
    const i = Math.min(N - 2, Math.floor(x));
    const j = Math.min(N - 2, Math.floor(y));
    const fx = x - i, fy = y - j;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const v = (a: number, b: number) => grid[b * N + a];
    return (v(i, j) * (1 - sx) + v(i + 1, j) * sx) * (1 - sy) + (v(i, j + 1) * (1 - sx) + v(i + 1, j + 1) * sx) * sy;
  };
  const peak = (x: number, y: number, px: number, py: number, h: number, w: number) =>
    h * Math.exp(-((x - px) ** 2 + (y - py) ** 2) / w);
  const elev = (x: number, y: number) =>
    peak(x, y, 0.78, 0.22, 1.0, 0.05) + peak(x, y, 0.3, 0.48, 0.6, 0.035) + peak(x, y, 0.6, 0.7, 0.45, 0.06) + 0.35 * noise(x, y);

  const step = Math.max(6, Math.round(Math.min(W, H) / 90));
  const cols = Math.ceil(W / step) + 1;
  const rows = Math.ceil(H / step) + 1;
  const F = new Float32Array(cols * rows);
  let mn = Infinity, mx = -Infinity;
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const v = elev((i * step) / W, (j * step) / H);
      F[j * cols + i] = v;
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }

  const LEVELS = 30, BASE = 6600, INTERVAL = 80; // feet, like a USGS contour interval
  const r = (n: number) => Math.round(n * 10) / 10;
  let minor = "", index = "";
  const candidates: { x: number; y: number; text: string }[] = [];

  for (let L = 1; L < LEVELS; L++) {
    const t = mn + ((mx - mn) * L) / LEVELS;
    const isIndex = L % 5 === 0;
    const segs: string[] = [];
    const pts: [number, number][] = [];
    for (let j = 0; j < rows - 1; j++)
      for (let i = 0; i < cols - 1; i++) {
        const a = F[j * cols + i], b = F[j * cols + i + 1], c = F[(j + 1) * cols + i + 1], d = F[(j + 1) * cols + i];
        const X = i * step, Y = j * step, S = step;
        const e: [number, number][] = [];
        const lerp = (p: number, q: number, x1: number, y1: number, x2: number, y2: number): [number, number] => {
          const k = (t - p) / (q - p);
          return [x1 + (x2 - x1) * k, y1 + (y2 - y1) * k];
        };
        if (a < t !== b < t) e.push(lerp(a, b, X, Y, X + S, Y));
        if (b < t !== c < t) e.push(lerp(b, c, X + S, Y, X + S, Y + S));
        if (c < t !== d < t) e.push(lerp(c, d, X + S, Y + S, X, Y + S));
        if (d < t !== a < t) e.push(lerp(d, a, X, Y + S, X, Y));
        for (let k = 0; k + 1 < e.length; k += 2) {
          segs.push(`M${r(e[k][0])} ${r(e[k][1])}L${r(e[k + 1][0])} ${r(e[k + 1][1])}`);
          pts.push(e[k]);
        }
      }
    if (isIndex) index += segs.join("");
    else minor += segs.join("");
    if (isIndex && pts.length > 40) {
      const p = pts[Math.floor(pts.length * 0.37)];
      candidates.push({ x: p[0], y: p[1], text: (BASE + L * INTERVAL).toLocaleString("en-US") });
    }
  }

  // Keep elevation labels in open space, away from the title and button.
  const labels: Contours["labels"] = [];
  for (const c of candidates) {
    if (c.x < 20 || c.x > W - 20 || c.y < 20 || c.y > H - 20) continue;
    if (c.x < W * 0.72 && (c.y < H * 0.52 || c.y > H * 0.84)) continue;
    if (labels.some((l) => Math.hypot(l.x - c.x, l.y - c.y) < 46)) continue;
    labels.push(c);
  }

  return { minor, index, labels, summit: { x: 0.78 * W, y: 0.22 * H } };
}
