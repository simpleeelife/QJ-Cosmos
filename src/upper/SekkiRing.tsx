import { useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";

const MAJOR_SEKKI = [
  { lon: 0,   name: "春分", color: "#88dd88" },
  { lon: 90,  name: "夏至", color: "#ffdd66" },
  { lon: 180, name: "秋分", color: "#ff9966" },
  { lon: 270, name: "冬至", color: "#88aaff" },
];

function makeArcPoints(startDeg: number, endDeg: number, radius: number, segments: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = startDeg + ((endDeg - startDeg) * i) / segments;
    const r = (t * Math.PI) / 180;
    pts.push(new THREE.Vector3(Math.cos(r) * radius, 0, Math.sin(r) * radius));
  }
  return pts;
}

// sun.elon (geocentric ecliptic longitude of Sun) → Earth's heliocentric longitude on ring
function sekkiToRingDegrees(sekkiLon: number): number {
  return (sekkiLon + 180) % 360;
}

interface Props {
  radius: number;
  currentSekkiLongitude: number;
  segmentDegrees?: number;
}

export function SekkiRing({ radius, currentSekkiLongitude, segmentDegrees = 15 }: Props) {
  const baseGeo = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(makeArcPoints(0, 360, radius, 256));
  }, [radius]);

  const startRing = sekkiToRingDegrees(currentSekkiLongitude);
  const currentArcGeo = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(
      makeArcPoints(startRing, startRing + segmentDegrees, radius, 32)
    );
  }, [startRing, segmentDegrees, radius]);

  return (
    <group>
      <line>
        <primitive object={baseGeo} attach="geometry" />
        <lineBasicMaterial color="#3a4a7a" transparent opacity={0.25} />
      </line>
      <line>
        <primitive object={currentArcGeo} attach="geometry" />
        <lineBasicMaterial color="#aaccff" transparent opacity={0.95} />
      </line>
      {MAJOR_SEKKI.map((s) => (
        <SekkiMarker key={s.name} radius={radius} sekkiLon={s.lon} name={s.name} color={s.color} />
      ))}
    </group>
  );
}

function SekkiMarker({
  radius,
  sekkiLon,
  name,
  color,
}: {
  radius: number;
  sekkiLon: number;
  name: string;
  color: string;
}) {
  const ringDeg = sekkiToRingDegrees(sekkiLon);
  const rad = (ringDeg * Math.PI) / 180;
  const inner = radius - 1.8;
  const outer = radius + 1.8;
  const labelDist = radius + 3.5;

  const tickGeo = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(Math.cos(rad) * inner, 0, Math.sin(rad) * inner),
      new THREE.Vector3(Math.cos(rad) * outer, 0, Math.sin(rad) * outer),
    ]);
  }, [rad, inner, outer]);

  return (
    <group>
      <line>
        <primitive object={tickGeo} attach="geometry" />
        <lineBasicMaterial color={color} transparent opacity={0.85} />
      </line>
      <mesh position={[Math.cos(rad) * radius, 0, Math.sin(rad) * radius]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <Html
        position={[Math.cos(rad) * labelDist, 0.5, Math.sin(rad) * labelDist]}
        center
        distanceFactor={45}
        style={{
          color,
          fontSize: "14px",
          fontWeight: 500,
          textShadow: "0 0 4px #000, 0 0 8px #000",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          letterSpacing: "0.05em",
        }}
      >
        {name}
      </Html>
    </group>
  );
}
