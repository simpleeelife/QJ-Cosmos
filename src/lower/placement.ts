function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rand(seed: number, salt: number): number {
  let t = (seed + salt * 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export const GALAXY_RING_RADIUS = 32;
const CLUSTER_INNER_RADIUS = 1.4;
const CLUSTER_OUTER_RADIUS = 3.0;
const CLUSTER_Y_JITTER = 1.0;

// 節気の中心位置(銀河リング上)
export function sekkiClusterCenter(
  sekkiLongitude: number
): [number, number, number] {
  const rad = (sekkiLongitude * Math.PI) / 180;
  return [
    Math.cos(rad) * GALAXY_RING_RADIUS,
    0,
    Math.sin(rad) * GALAXY_RING_RADIUS,
  ];
}

// クラスタ中心からのローカル位置
// moon_age (0-29.5) で軌道角、ハッシュで半径と高さジッタ
export function noteLocalPosition(
  noteId: string,
  moonAge: number | null
): [number, number, number] {
  const h = hashStr(noteId);
  const angle =
    moonAge != null
      ? (moonAge / 29.5) * 2 * Math.PI + rand(h, 6) * 0.4
      : rand(h, 7) * 2 * Math.PI;
  const radius =
    CLUSTER_INNER_RADIUS +
    rand(h, 4) * (CLUSTER_OUTER_RADIUS - CLUSTER_INNER_RADIUS);
  const yJitter = (rand(h, 5) - 0.5) * CLUSTER_Y_JITTER;
  return [Math.cos(angle) * radius, yJitter, Math.sin(angle) * radius];
}

export function sizeFromContentLength(len: number): number {
  return 0.12 + Math.min(len / 8000, 1) * 0.5;
}

// solar_term未設定ノードのオフラインクラスタ位置(銀河中心の小さな雲)
const ORPHAN_RADIUS = 4;
export function orphanPosition(noteId: string): [number, number, number] {
  const h = hashStr(noteId);
  const u = rand(h, 1) * 2 - 1;
  const phi = rand(h, 2) * 2 * Math.PI;
  const r = Math.cbrt(rand(h, 3)) * ORPHAN_RADIUS;
  const sqrt = Math.sqrt(1 - u * u);
  return [r * sqrt * Math.cos(phi), r * u, r * sqrt * Math.sin(phi)];
}
