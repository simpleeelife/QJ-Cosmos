import * as Astronomy from "astronomy-engine";

export interface CosmoSnapshot {
  date: Date;
  sunEclipticLongitude: number;
  moonPhaseAngle: number;
  moonIlluminatedFraction: number;
  moonPhaseName: string;
  moonEclipticLongitude: number;
  moonEclipticLatitude: number;
  sekki: { name: string; longitude: number };
  tide: "大潮" | "中潮" | "小潮" | "長潮" | "若潮";
}

const SEKKI: { name: string; lon: number }[] = [
  { name: "春分", lon: 0 },   { name: "清明", lon: 15 },  { name: "穀雨", lon: 30 },
  { name: "立夏", lon: 45 },  { name: "小満", lon: 60 },  { name: "芒種", lon: 75 },
  { name: "夏至", lon: 90 },  { name: "小暑", lon: 105 }, { name: "大暑", lon: 120 },
  { name: "立秋", lon: 135 }, { name: "処暑", lon: 150 }, { name: "白露", lon: 165 },
  { name: "秋分", lon: 180 }, { name: "寒露", lon: 195 }, { name: "霜降", lon: 210 },
  { name: "立冬", lon: 225 }, { name: "小雪", lon: 240 }, { name: "大雪", lon: 255 },
  { name: "冬至", lon: 270 }, { name: "小寒", lon: 285 }, { name: "大寒", lon: 300 },
  { name: "立春", lon: 315 }, { name: "雨水", lon: 330 }, { name: "啓蟄", lon: 345 },
];

function currentSekki(sunLon: number) {
  const sorted = [...SEKKI].sort((a, b) => a.lon - b.lon);
  let current = sorted[sorted.length - 1];
  for (const s of sorted) {
    if (s.lon <= sunLon) current = s;
    else break;
  }
  return { name: current.name, longitude: current.lon };
}

function moonPhaseName(angle: number): string {
  const a = ((angle % 360) + 360) % 360;
  if (a < 22.5 || a >= 337.5) return "新月";
  if (a < 67.5) return "三日月";
  if (a < 112.5) return "上弦";
  if (a < 157.5) return "十三夜";
  if (a < 202.5) return "満月";
  if (a < 247.5) return "十六夜";
  if (a < 292.5) return "下弦";
  return "有明月";
}

function phaseToTide(phaseDeg: number): CosmoSnapshot["tide"] {
  const dist = (target: number) => {
    let d = Math.abs(phaseDeg - target);
    if (d > 180) d = 360 - d;
    return d;
  };
  const dNew = dist(0);
  const dFull = dist(180);
  const dQuarter = Math.min(dist(90), dist(270));
  const spring = Math.min(dNew, dFull);
  if (spring < 22) return "大潮";
  if (spring < 45) return "中潮";
  if (dQuarter < 22) return "小潮";
  if (dQuarter < 45) return "長潮";
  return "若潮";
}

export function getSnapshot(date: Date): CosmoSnapshot {
  const sun = Astronomy.SunPosition(date);
  const moonPhaseAngle = Astronomy.MoonPhase(date);
  const illum = Astronomy.Illumination(Astronomy.Body.Moon, date);
  const moonEcl = Astronomy.EclipticGeoMoon(date);
  return {
    date,
    sunEclipticLongitude: sun.elon,
    moonPhaseAngle,
    moonIlluminatedFraction: illum.phase_fraction,
    moonPhaseName: moonPhaseName(moonPhaseAngle),
    moonEclipticLongitude: moonEcl.lon,
    moonEclipticLatitude: moonEcl.lat,
    sekki: currentSekki(sun.elon),
    tide: phaseToTide(moonPhaseAngle),
  };
}

export function earthScenePosition(
  snapshot: CosmoSnapshot,
  orbitRadius: number
): [number, number, number] {
  const earthLon = ((snapshot.sunEclipticLongitude + 180) * Math.PI) / 180;
  return [Math.cos(earthLon) * orbitRadius, 0, Math.sin(earthLon) * orbitRadius];
}

export function moonScenePosition(
  snapshot: CosmoSnapshot,
  earthPos: [number, number, number],
  orbitRadius: number
): [number, number, number] {
  const lonRad = (snapshot.moonEclipticLongitude * Math.PI) / 180;
  const latRad = (snapshot.moonEclipticLatitude * Math.PI) / 180;
  const x = Math.cos(latRad) * Math.cos(lonRad);
  const z = Math.cos(latRad) * Math.sin(lonRad);
  const y = Math.sin(latRad);
  return [
    earthPos[0] + x * orbitRadius,
    earthPos[1] + y * orbitRadius,
    earthPos[2] + z * orbitRadius,
  ];
}

export interface PlanetInfo {
  name: string;
  jp: string;
  body: Astronomy.Body;
  semiMajorAU: number;
  color: string;
  size: number;
  ring?: { inner: number; outer: number; color: string; tilt: number };
}

export const PLANETS: PlanetInfo[] = [
  { name: "Mercury", jp: "水星", body: Astronomy.Body.Mercury, semiMajorAU: 0.387, color: "#9b9588", size: 0.45 },
  { name: "Venus",   jp: "金星", body: Astronomy.Body.Venus,   semiMajorAU: 0.723, color: "#e8c97f", size: 0.85 },
  { name: "Mars",    jp: "火星", body: Astronomy.Body.Mars,    semiMajorAU: 1.524, color: "#c1573a", size: 0.55 },
  { name: "Jupiter", jp: "木星", body: Astronomy.Body.Jupiter, semiMajorAU: 5.203, color: "#d8a979", size: 1.6 },
  {
    name: "Saturn", jp: "土星", body: Astronomy.Body.Saturn, semiMajorAU: 9.537, color: "#e3c89b", size: 1.3,
    ring: { inner: 1.7, outer: 2.6, color: "#bfa888", tilt: (26.7 * Math.PI) / 180 },
  },
];

// 後方互換: 既存コードが INNER_PLANETS を参照している場合に備える
export const INNER_PLANETS = PLANETS.slice(0, 3);

export function planetScenePosition(
  body: Astronomy.Body,
  date: Date,
  auScale: number
): [number, number, number] {
  const v = Astronomy.HelioVector(body, date);
  const lon = Math.atan2(v.y, v.x);
  const r = Math.sqrt(v.x * v.x + v.y * v.y) * auScale;
  return [Math.cos(lon) * r, v.z * auScale, Math.sin(lon) * r];
}
