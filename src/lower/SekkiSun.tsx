import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { SekkiInfo } from "./sekkiData";
import { useTimeStore } from "../store/timeStore";
import { getSnapshot } from "../astro/ephemeris";

interface Props {
  sekki: SekkiInfo;
  position: [number, number, number];
  noteCount: number;
}

const SUN_BASE_RADIUS = 0.7;
const SUN_HALO_RADIUS = 1.1;

export function SekkiSun({ sekki, position, noteCount }: Props) {
  const sunRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const radius = useMemo(() => {
    return SUN_BASE_RADIUS + Math.min(noteCount / 30, 1) * 0.5;
  }, [noteCount]);

  useFrame(() => {
    const date = useTimeStore.getState().currentDate;
    const cur = getSnapshot(date).sekki.name;
    const isCurrent = cur === sekki.name;

    if (sunRef.current) {
      const mat = sunRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = isCurrent ? 1.0 : 0.55;
    }
    if (haloRef.current) {
      haloRef.current.scale.setScalar(isCurrent ? 1.6 : 1.0);
      const mat = haloRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = isCurrent ? 0.4 : 0.12;
    }
    if (lightRef.current) {
      lightRef.current.intensity = isCurrent ? 2.5 : 0.3;
    }
  });

  return (
    <group position={position}>
      <pointLight
        ref={lightRef}
        intensity={0.3}
        distance={8}
        decay={2}
        color={sekki.color}
      />
      <mesh ref={sunRef}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial color={sekki.color} transparent opacity={0.55} />
      </mesh>
      <mesh ref={haloRef}>
        <sphereGeometry args={[SUN_HALO_RADIUS, 24, 24]} />
        <meshBasicMaterial color={sekki.color} transparent opacity={0.12} />
      </mesh>
      <Html
        position={[0, radius + 0.6, 0]}
        center
        distanceFactor={28}
        style={{
          color: sekki.color,
          fontSize: "12px",
          fontWeight: 500,
          textShadow: "0 0 4px #000, 0 0 8px #000",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          letterSpacing: "0.05em",
          opacity: 0.85,
        }}
      >
        {sekki.name}
        {noteCount > 0 && (
          <span style={{ opacity: 0.6, marginLeft: 4 }}>
            ({noteCount})
          </span>
        )}
      </Html>
    </group>
  );
}
