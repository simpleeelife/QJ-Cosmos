import { useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { useNotesStore } from "../store/notesStore";
import { useUiStore } from "../store/uiStore";
import { NoteStar } from "./NoteStar";
import { SekkiSun } from "./SekkiSun";
import { ConnectionLines } from "./ConnectionLines";
import { SekkiAnchorLines } from "./SekkiAnchorLines";
import { CameraFollower } from "./CameraFollower";
import { PhysicsTicker } from "./PhysicsTicker";
import { ALL_SEKKI, SEKKI_BY_NAME } from "./sekkiData";
import { noteLocalPosition, orphanPosition } from "./placement";
import { brainSekkiPosition } from "./brainShape";
import { buildConnections } from "./connections";
import { buildBrainAnchors } from "./brainLayer";

interface PlacedMeta {
  id: string;
  color: string;
  staticPos: [number, number, number];
  anchorPos: [number, number, number];
}

export function LowerCosmos() {
  const notes = useNotesStore((s) => s.notes);
  const placementMode = useUiStore((s) => s.placementMode);
  const sekkiAnchorVisible = useUiStore((s) => s.lineVisibility.sekkiAnchor);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const positionsRef = useRef<Map<string, THREE.Vector3>>(new Map());
  const velocitiesRef = useRef<Map<string, THREE.Vector3>>(new Map());
  const anchorsRef = useRef<Map<string, THREE.Vector3>>(new Map());

  const { metas, countBySekki, orphanCount, edges, brainResult, sizeById } = useMemo(() => {
    const metas: PlacedMeta[] = [];
    const countBySekki = new Map<string, number>();
    let orphanCount = 0;

    for (const note of notes) {
      const sekki = note.sekki ? SEKKI_BY_NAME.get(note.sekki) : undefined;
      let staticPos: [number, number, number];
      let anchorPos: [number, number, number];
      let color: string;
      if (sekki) {
        const center = brainSekkiPosition(sekki.name);
        const local = noteLocalPosition(note.id, note.moonAge);
        staticPos = [
          center[0] + local[0],
          center[1] + local[1],
          center[2] + local[2],
        ];
        anchorPos = center;
        color = sekki.color;
        countBySekki.set(sekki.name, (countBySekki.get(sekki.name) ?? 0) + 1);
      } else {
        staticPos = orphanPosition(note.id);
        anchorPos = [0, 0, 0];
        color = "#888888";
        orphanCount++;
      }
      metas.push({ id: note.id, color, staticPos, anchorPos });
    }

    const edges = buildConnections(notes);

    // つながり次数(degree)を計算
    const degreeMap = new Map<string, number>();
    for (const e of edges) {
      degreeMap.set(e.fromId, (degreeMap.get(e.fromId) ?? 0) + 1);
      degreeMap.set(e.toId, (degreeMap.get(e.toId) ?? 0) + 1);
    }
    let maxDegree = 0;
    for (const d of degreeMap.values()) if (d > maxDegree) maxDegree = d;

    // サイズ = 文字数とつながり数のブレンド
    const sizeById = new Map<string, number>();
    for (const n of notes) {
      const degree = degreeMap.get(n.id) ?? 0;
      const degreeFactor = maxDegree ? degree / maxDegree : 0;
      const contentFactor = Math.min(n.contentLength / 8000, 1);
      // 0.13(最小) + degree寄与(最大0.55) + content寄与(最大0.22)
      const size =
        0.13 + Math.sqrt(degreeFactor) * 0.55 + contentFactor * 0.22;
      sizeById.set(n.id, size);
    }

    return {
      metas,
      countBySekki,
      orphanCount,
      edges,
      brainResult: buildBrainAnchors(notes),
      sizeById,
    };
  }, [notes]);

  // ノート初回ロード時に位置/速度/アンカー Map を初期化
  useEffect(() => {
    const positions = new Map<string, THREE.Vector3>();
    const velocities = new Map<string, THREE.Vector3>();
    const anchors = new Map<string, THREE.Vector3>();
    for (const m of metas) {
      positions.set(m.id, new THREE.Vector3(...m.staticPos));
      velocities.set(m.id, new THREE.Vector3());
      anchors.set(m.id, new THREE.Vector3(...m.anchorPos));
    }
    positionsRef.current = positions;
    velocitiesRef.current = velocities;
    anchorsRef.current = anchors;
  }, [metas]);

  // モード変更時の位置リセット: 静的に戻すときは静的位置にスナップ
  useEffect(() => {
    if (placementMode !== "static") return;
    const positions = positionsRef.current;
    const velocities = velocitiesRef.current;
    if (!positions || !velocities) return;
    for (const m of metas) {
      const p = positions.get(m.id);
      const v = velocities.get(m.id);
      if (p) p.set(...m.staticPos);
      if (v) v.set(0, 0, 0);
    }
  }, [placementMode, metas]);

  // 純力学に入るときはランダム初期位置(球内分布)で再構成
  useEffect(() => {
    if (placementMode !== "physics") return;
    const positions = positionsRef.current;
    const velocities = velocitiesRef.current;
    if (!positions || !velocities) return;
    const RADIUS = 18;
    for (const m of metas) {
      const p = positions.get(m.id);
      const v = velocities.get(m.id);
      if (p) {
        const u = Math.random() * 2 - 1;
        const phi = Math.random() * Math.PI * 2;
        const r = Math.cbrt(Math.random()) * RADIUS;
        const sqrt = Math.sqrt(Math.max(0, 1 - u * u));
        p.set(r * sqrt * Math.cos(phi), r * u, r * sqrt * Math.sin(phi));
      }
      if (v) v.set(0, 0, 0);
    }
  }, [placementMode, metas]);

  // モードに応じてアンカーを切り替え(hybrid=節気 / brain=脳3層)
  useEffect(() => {
    const anchors = anchorsRef.current;
    if (!anchors) return;
    if (placementMode === "brain") {
      for (const m of metas) {
        const brainAnchor = brainResult.anchors.get(m.id);
        const a = anchors.get(m.id);
        if (a && brainAnchor) a.set(...brainAnchor);
      }
    } else {
      for (const m of metas) {
        const a = anchors.get(m.id);
        if (a) a.set(...m.anchorPos);
      }
    }
  }, [placementMode, metas, brainResult]);

  const noteById = useMemo(() => {
    const m = new Map<string, (typeof notes)[number]>();
    for (const n of notes) m.set(n.id, n);
    return m;
  }, [notes]);

  return (
    <Canvas
      camera={{ position: [0, 18, 60], fov: 55, near: 0.1, far: 2000 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#000010"]} />
      <ambientLight intensity={0.08} />

      {placementMode !== "physics" &&
        placementMode !== "brain" &&
        ALL_SEKKI.map((sekki) => (
          <SekkiSun
            key={sekki.name}
            sekki={sekki}
            position={brainSekkiPosition(sekki.name)}
            noteCount={countBySekki.get(sekki.name) ?? 0}
          />
        ))}

      <ConnectionLines connections={edges} positionsRef={positionsRef} />

      {placementMode !== "physics" &&
        placementMode !== "brain" &&
        sekkiAnchorVisible && (
          <SekkiAnchorLines notes={notes} positionsRef={positionsRef} />
        )}

      {metas.map((m) => {
        const note = noteById.get(m.id);
        if (!note) return null;
        return (
          <NoteStar
            key={m.id}
            note={note}
            positionsRef={positionsRef}
            color={m.color}
            size={sizeById.get(m.id) ?? 0.2}
          />
        );
      })}

      <PhysicsTicker
        notes={notes}
        edges={edges}
        positionsRef={positionsRef}
        velocitiesRef={velocitiesRef}
        anchorsRef={anchorsRef}
      />

      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableRotate
        minDistance={0.3}
        maxDistance={250}
        zoomSpeed={1.2}
      />
      <CameraFollower controlsRef={controlsRef} />

      {orphanCount > 0 && (
        <Html position={[0, 16, 0]} center distanceFactor={50}>
          <div
            style={{
              color: "#888",
              fontSize: "10px",
              opacity: 0.6,
              pointerEvents: "none",
            }}
          >
            未分類: {orphanCount}
          </div>
        </Html>
      )}
    </Canvas>
  );
}
