export interface SekkiInfo {
  name: string;
  longitude: number; // 太陽の地心黄経 0..345 (15°刻み)
  color: string;
}

// Seasonal color gradient: 春(緑)→夏(黄)→秋(橙)→冬(青)
function colorForSekkiLongitude(lon: number): string {
  const stops: [number, [number, number, number]][] = [
    [0,   [0x88, 0xdd, 0x88]], // 春分: green
    [90,  [0xff, 0xdd, 0x66]], // 夏至: yellow
    [180, [0xff, 0x99, 0x66]], // 秋分: orange
    [270, [0x88, 0xaa, 0xff]], // 冬至: blue
    [360, [0x88, 0xdd, 0x88]], // wrap
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, c0] = stops[i];
    const [t1, c1] = stops[i + 1];
    if (lon >= t0 && lon <= t1) {
      const k = (lon - t0) / (t1 - t0);
      const r = Math.round(c0[0] + (c1[0] - c0[0]) * k);
      const g = Math.round(c0[1] + (c1[1] - c0[1]) * k);
      const b = Math.round(c0[2] + (c1[2] - c0[2]) * k);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  return "#888888";
}

const RAW: { name: string; longitude: number }[] = [
  { name: "春分", longitude: 0 },
  { name: "清明", longitude: 15 },
  { name: "穀雨", longitude: 30 },
  { name: "立夏", longitude: 45 },
  { name: "小満", longitude: 60 },
  { name: "芒種", longitude: 75 },
  { name: "夏至", longitude: 90 },
  { name: "小暑", longitude: 105 },
  { name: "大暑", longitude: 120 },
  { name: "立秋", longitude: 135 },
  { name: "処暑", longitude: 150 },
  { name: "白露", longitude: 165 },
  { name: "秋分", longitude: 180 },
  { name: "寒露", longitude: 195 },
  { name: "霜降", longitude: 210 },
  { name: "立冬", longitude: 225 },
  { name: "小雪", longitude: 240 },
  { name: "大雪", longitude: 255 },
  { name: "冬至", longitude: 270 },
  { name: "小寒", longitude: 285 },
  { name: "大寒", longitude: 300 },
  { name: "立春", longitude: 315 },
  { name: "雨水", longitude: 330 },
  { name: "啓蟄", longitude: 345 },
];

export const ALL_SEKKI: SekkiInfo[] = RAW.map((s) => ({
  ...s,
  color: colorForSekkiLongitude(s.longitude),
}));

export const SEKKI_BY_NAME: Map<string, SekkiInfo> = new Map(
  ALL_SEKKI.map((s) => [s.name, s])
);
