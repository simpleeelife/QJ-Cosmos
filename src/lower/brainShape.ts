import { ALL_SEKKI } from "./sekkiData";

const X_SCALE = 26; // 前後(脳の前後軸)
const Y_SCALE = 13; // 上下(脳は上下に扁平)
const Z_SCALE = 19; // 左右

// 各節気の脳形3D座標を一度だけ計算
const BRAIN_POSITIONS: Map<string, [number, number, number]> = (() => {
  const map = new Map<string, [number, number, number]>();
  const N = ALL_SEKKI.length;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const sekki = ALL_SEKKI[i];
    // Fibonacci sphere — 球面準等分布
    const yNorm = 1 - (i / (N - 1)) * 2; // 1..-1
    const radiusAtY = Math.sqrt(Math.max(0, 1 - yNorm * yNorm));
    const angle = goldenAngle * i;
    const xNorm = Math.cos(angle) * radiusAtY;
    const zNorm = Math.sin(angle) * radiusAtY;

    // 中央縦溝(longitudinal fissure)を作る: z≈0 付近を凹ませる
    const fissureFactor = 1 - Math.exp(-(zNorm * zNorm) * 6) * 0.18;

    map.set(sekki.name, [
      xNorm * X_SCALE,
      yNorm * Y_SCALE,
      zNorm * Z_SCALE * fissureFactor,
    ]);
  }
  return map;
})();

export function brainSekkiPosition(
  sekkiName: string
): [number, number, number] {
  return BRAIN_POSITIONS.get(sekkiName) ?? [0, 0, 0];
}
