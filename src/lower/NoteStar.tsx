import { useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { Note } from "./notesLoader";
import { useTimeStore } from "../store/timeStore";
import { useUiStore } from "../store/uiStore";

const DAY_MS = 24 * 60 * 60 * 1000;
const PROXIMITY_SIGMA_DAYS = 5;
const PROXIMITY_BOOST = 6;
const BASE_EMISSIVE = 0.35;
const HOVER_BOOST = 3;

interface Props {
  note: Note;
  positionsRef: React.RefObject<Map<string, THREE.Vector3>>;
  color: string;
  size: number;
}

export function NoteStar({ note, positionsRef, color, size }: Props) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    // 位置をMapから読んでmeshに反映
    const pos = positionsRef.current?.get(note.id);
    if (pos && meshRef.current) {
      meshRef.current.position.set(pos.x, pos.y, pos.z);
    }

    if (!matRef.current || !meshRef.current) return;
    const ui = useUiStore.getState();
    const isHovered =
      ui.hoveredNoteId === note.id || ui.pinnedNoteId === note.id;

    let proximity = 0;
    if (note.date) {
      const cur = useTimeStore.getState().currentDate.getTime();
      const diffDays = Math.abs(cur - note.date.getTime()) / DAY_MS;
      proximity = Math.exp(-((diffDays / PROXIMITY_SIGMA_DAYS) ** 2));
    }

    const hoverBoost = isHovered ? HOVER_BOOST : 0;
    matRef.current.emissiveIntensity =
      BASE_EMISSIVE + proximity * PROXIMITY_BOOST + hoverBoost;

    const targetScale = isHovered ? 1.6 : 1.0;
    const cur = meshRef.current.scale.x;
    meshRef.current.scale.setScalar(cur + (targetScale - cur) * 0.2);
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    useUiStore.getState().setHovered(note.id);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    if (useUiStore.getState().hoveredNoteId === note.id) {
      useUiStore.getState().setHovered(null);
    }
    document.body.style.cursor = "";
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const ui = useUiStore.getState();
    const wasPinned = ui.pinnedNoteId === note.id;
    ui.togglePin(note.id);
    if (!wasPinned) {
      const pos = positionsRef.current?.get(note.id);
      if (pos) ui.setFocus([pos.x, pos.y, pos.z]);
    } else {
      ui.setFocus(null);
    }
  };

  return (
    <mesh
      ref={meshRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        ref={matRef}
        color={color}
        emissive={color}
        emissiveIntensity={BASE_EMISSIVE}
        roughness={0.4}
        metalness={0}
      />
    </mesh>
  );
}
