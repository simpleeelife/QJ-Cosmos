import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useTimeStore } from "../store/timeStore";
import {
  getSnapshot,
  earthScenePosition,
  moonScenePosition,
} from "../astro/ephemeris";
import { Sun } from "./Sun";
import { Earth } from "./Earth";
import { Moon } from "./Moon";
import { SekkiRing } from "./SekkiRing";
import { CameraController } from "./CameraController";

const EARTH_ORBIT_RADIUS = 30;
const MOON_ORBIT_RADIUS = 3;

export function UpperCosmos() {
  const date = useTimeStore((s) => s.currentDate);
  const viewpoint = useTimeStore((s) => s.viewpoint);
  const snap = useMemo(() => getSnapshot(date), [date]);
  const earthPos = useMemo(
    () => earthScenePosition(snap, EARTH_ORBIT_RADIUS),
    [snap]
  );
  const moonPos = useMemo(
    () => moonScenePosition(snap, earthPos, MOON_ORBIT_RADIUS),
    [snap, earthPos]
  );

  return (
    <Canvas
      camera={{ position: [0, 25, 55], fov: 50, near: 0.001, far: 2000 }}
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
      <Sun position={[0, 0, 0]} />
      <SekkiRing
        radius={EARTH_ORBIT_RADIUS}
        currentSekkiLongitude={snap.sekki.longitude}
      />
      <Earth position={earthPos} />
      <Moon position={moonPos} />
      <CameraController
        viewpoint={viewpoint}
        earthPos={earthPos}
        moonPos={moonPos}
      />
    </Canvas>
  );
}
