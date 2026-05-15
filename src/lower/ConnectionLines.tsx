import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Connection, ConnectionKind } from "./connections";
import { useUiStore } from "../store/uiStore";

interface Props {
  connections: Connection[];
  positionsRef: React.RefObject<Map<string, THREE.Vector3>>;
}

const COLORS: Record<ConnectionKind, [number, number, number]> = {
  temporal: [1.0, 0.55, 0.2],
  lunar:    [0.35, 0.65, 1.0],
  theme:    [0.3, 1.0, 0.45],
  dream:    [0.85, 0.4, 1.0],
  question: [1.0, 0.85, 0.2],
};

export function ConnectionLines({ connections, positionsRef }: Props) {
  const visibility = useUiStore((s) => s.lineVisibility);

  const visibleConnections = useMemo(
    () => connections.filter((c) => visibility[c.kind]),
    [connections, visibility]
  );

  const geom = useMemo(() => {
    const positions = new Float32Array(visibleConnections.length * 6);
    const colors = new Float32Array(visibleConnections.length * 6);
    for (let i = 0; i < visibleConnections.length; i++) {
      const col = COLORS[visibleConnections[i].kind];
      const off = i * 6;
      colors[off] = col[0]; colors[off + 1] = col[1]; colors[off + 2] = col[2];
      colors[off + 3] = col[0]; colors[off + 4] = col[1]; colors[off + 5] = col[2];
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return g;
  }, [visibleConnections]);

  useFrame(() => {
    const map = positionsRef.current;
    if (!map) return;
    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < visibleConnections.length; i++) {
      const c = visibleConnections[i];
      const a = map.get(c.fromId);
      const b = map.get(c.toId);
      const off = i * 6;
      if (!a || !b) continue;
      arr[off] = a.x; arr[off + 1] = a.y; arr[off + 2] = a.z;
      arr[off + 3] = b.x; arr[off + 4] = b.y; arr[off + 5] = b.z;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <lineSegments>
      <primitive object={geom} attach="geometry" />
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.4}
        depthWrite={false}
      />
    </lineSegments>
  );
}
