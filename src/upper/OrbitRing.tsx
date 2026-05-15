import { useMemo } from "react";
import * as THREE from "three";

interface Props {
  radius: number;
  segments?: number;
  color?: string;
  opacity?: number;
}

export function OrbitRing({
  radius,
  segments = 256,
  color = "#3a4a7a",
  opacity = 0.3,
}: Props) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(t) * radius, 0, Math.sin(t) * radius));
    }
    return pts;
  }, [radius, segments]);

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    return geom;
  }, [points]);

  return (
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </line>
  );
}
