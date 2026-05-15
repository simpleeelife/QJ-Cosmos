import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Note } from "./notesLoader";
import type { Connection } from "./connections";
import { useUiStore } from "../store/uiStore";
import { stepPhysics } from "./physics";

interface Props {
  notes: Note[];
  edges: Connection[];
  positionsRef: React.RefObject<Map<string, THREE.Vector3>>;
  velocitiesRef: React.RefObject<Map<string, THREE.Vector3>>;
  anchorsRef: React.RefObject<Map<string, THREE.Vector3>>;
}

export function PhysicsTicker({
  notes,
  edges,
  positionsRef,
  velocitiesRef,
  anchorsRef,
}: Props) {
  useFrame(() => {
    const mode = useUiStore.getState().placementMode;
    if (mode === "static") return;
    if (
      !positionsRef.current ||
      !velocitiesRef.current ||
      !anchorsRef.current
    )
      return;
    stepPhysics(
      notes,
      edges,
      positionsRef.current,
      velocitiesRef.current,
      anchorsRef.current,
      mode
    );
  });
  return null;
}
