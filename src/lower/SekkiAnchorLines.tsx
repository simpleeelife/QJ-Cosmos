import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Note } from "./notesLoader";
import { SEKKI_BY_NAME } from "./sekkiData";
import { brainSekkiPosition } from "./brainShape";

interface Props {
  notes: Note[];
  positionsRef: React.RefObject<Map<string, THREE.Vector3>>;
}

function parseRgb(s: string): [number, number, number] {
  const m = s.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (m) return [Number(m[1]) / 255, Number(m[2]) / 255, Number(m[3]) / 255];
  return [0.5, 0.5, 0.5];
}

interface AnchorItem {
  noteId: string;
  sekkiPos: [number, number, number];
}

export function SekkiAnchorLines({ notes, positionsRef }: Props) {
  const { geom, items } = useMemo(() => {
    const items: AnchorItem[] = [];
    const colorsList: [number, number, number][] = [];
    for (const n of notes) {
      if (!n.sekki) continue;
      const sekki = SEKKI_BY_NAME.get(n.sekki);
      if (!sekki) continue;
      items.push({
        noteId: n.id,
        sekkiPos: brainSekkiPosition(sekki.name),
      });
      colorsList.push(parseRgb(sekki.color));
    }
    const positions = new Float32Array(items.length * 6);
    const colors = new Float32Array(items.length * 6);
    for (let i = 0; i < items.length; i++) {
      const c = colorsList[i];
      const off = i * 6;
      colors[off] = c[0]; colors[off + 1] = c[1]; colors[off + 2] = c[2];
      colors[off + 3] = c[0]; colors[off + 4] = c[1]; colors[off + 5] = c[2];
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return { geom: g, items };
  }, [notes]);

  useFrame(() => {
    const map = positionsRef.current;
    if (!map) return;
    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < items.length; i++) {
      const { noteId, sekkiPos } = items[i];
      const notePos = map.get(noteId);
      const off = i * 6;
      if (!notePos) continue;
      arr[off] = sekkiPos[0];
      arr[off + 1] = sekkiPos[1];
      arr[off + 2] = sekkiPos[2];
      arr[off + 3] = notePos.x;
      arr[off + 4] = notePos.y;
      arr[off + 5] = notePos.z;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <lineSegments>
      <primitive object={geom} attach="geometry" />
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.2}
        depthWrite={false}
      />
    </lineSegments>
  );
}
