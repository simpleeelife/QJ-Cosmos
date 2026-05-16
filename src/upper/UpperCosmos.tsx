import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useTimeStore } from "../store/timeStore";
import {
  getSnapshot,
  earthScenePosition,
  moonScenePosition,
  PLANETS,
  planetScenePosition,
} from "../astro/ephemeris";
import { Sun } from "./Sun";
import { Earth } from "./Earth";
import { Moon } from "./Moon";
import { Planet } from "./Planet";
import { OrbitRing } from "./OrbitRing";
import { SekkiRing } from "./SekkiRing";
import { CameraController } from "./CameraController";

const SCALE_CONFIGS = {
  inner: {
    auToScene: 30,
    moonOrbit: 3,
    sunSize: 5,
    freeInitial: [0, 35, 75] as [number, number, number],
    topDownInitial: [0, 110, 0] as [number, number, number],
    cameraInitial: [0, 35, 75] as [number, number, number],
    fromSunFov: 18,
  },
  all: {
    auToScene: 12,
    moonOrbit: 1.7,
    sunSize: 2,
    freeInitial: [0, 60, 140] as [number, number, number],
    topDownInitial: [0, 280, 0] as [number, number, number],
    cameraInitial: [0, 60, 140] as [number, number, number],
    fromSunFov: 45,
  },
};

export function UpperCosmos() {
  const date = useTimeStore((s) => s.currentDate);
  const viewpoint = useTimeStore((s) => s.viewpoint);
  const scope = useTimeStore((s) => s.planetScope);
  const cfg = SCALE_CONFIGS[scope];
  const earthOrbit = cfg.auToScene;
  const snap = useMemo(() => getSnapshot(date), [date]);
  const earthPos = useMemo(
    () => earthScenePosition(snap, earthOrbit),
    [snap, earthOrbit]
  );
  const moonPos = useMemo(
    () => moonScenePosition(snap, earthPos, cfg.moonOrbit),
    [snap, earthPos, cfg.moonOrbit]
  );
  const planetList = useMemo(
    () => (scope === "inner" ? PLANETS.slice(0, 3) : PLANETS),
    [scope]
  );
  const planets = useMemo(
    () =>
      planetList.map((p) => ({
        ...p,
        pos: planetScenePosition(p.body, date, cfg.auToScene),
        orbitR: p.semiMajorAU * cfg.auToScene,
      })),
    [date, planetList, cfg.auToScene]
  );

  return (
    <Canvas
      key={scope}
      camera={{ position: cfg.cameraInitial, fov: 50, near: 0.001, far: 2000 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#000008"]} />
      <Stars
        radius={300}
        depth={60}
        count={8000}
        factor={4}
        saturation={0}
        fade
        speed={0.3}
      />
      <ambientLight intensity={0.04} />
      <Sun position={[0, 0, 0]} size={cfg.sunSize} />
      {planets.map((p) => (
        <OrbitRing
          key={`orbit-${p.name}`}
          radius={p.orbitR}
          color="#2c3a5c"
          opacity={0.18}
        />
      ))}
      <SekkiRing
        radius={earthOrbit}
        currentSekkiLongitude={snap.sekki.longitude}
      />
      {planets.map((p) => (
        <Planet
          key={p.name}
          position={p.pos}
          color={p.color}
          size={p.size}
          ring={p.ring}
        />
      ))}
      <Earth position={earthPos} />
      <Moon position={moonPos} />
      <CameraController
        viewpoint={viewpoint}
        earthPos={earthPos}
        moonPos={moonPos}
        freeInitialPos={cfg.freeInitial}
        topDownInitialPos={cfg.topDownInitial}
        fromSunFov={cfg.fromSunFov}
      />
    </Canvas>
  );
}
