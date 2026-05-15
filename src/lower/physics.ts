import * as THREE from "three";
import type { Note } from "./notesLoader";
import type { Connection, ConnectionKind } from "./connections";
import type { PlacementMode } from "../store/uiStore";

const REPULSION = 28;
const ANCHOR_K = 0.045;
const CENTER_K = 0.006;
const DAMPING = 0.86;
const MAX_VELOCITY = 1.8;
const MIN_DIST_SQ = 0.05;

const SPRING_REST: Record<ConnectionKind, number> = {
  temporal: 3.5,
  lunar: 4.5,
  theme: 3.0,
  dream: 2.8,
  question: 2.2,
};

const SPRING_K: Record<ConnectionKind, number> = {
  temporal: 0.05,
  lunar: 0.025,
  theme: 0.045,
  dream: 0.06,
  question: 0.08,
};

export function stepPhysics(
  notes: Note[],
  edges: Connection[],
  positions: Map<string, THREE.Vector3>,
  velocities: Map<string, THREE.Vector3>,
  anchors: Map<string, THREE.Vector3>,
  mode: PlacementMode
): void {
  // 1. 全ノードペアの斥力 — O(N^2)
  for (let i = 0; i < notes.length; i++) {
    const a = notes[i];
    const pa = positions.get(a.id);
    const va = velocities.get(a.id);
    if (!pa || !va) continue;
    for (let j = i + 1; j < notes.length; j++) {
      const b = notes[j];
      const pb = positions.get(b.id);
      const vb = velocities.get(b.id);
      if (!pb || !vb) continue;
      const dx = pb.x - pa.x;
      const dy = pb.y - pa.y;
      const dz = pb.z - pa.z;
      const distSq = Math.max(dx * dx + dy * dy + dz * dz, MIN_DIST_SQ);
      const dist = Math.sqrt(distSq);
      const force = REPULSION / distSq;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      const fz = (dz / dist) * force;
      va.x -= fx;
      va.y -= fy;
      va.z -= fz;
      vb.x += fx;
      vb.y += fy;
      vb.z += fz;
    }
  }

  // 2. エッジのバネ引力 — O(E)
  for (const e of edges) {
    const pa = positions.get(e.fromId);
    const pb = positions.get(e.toId);
    const va = velocities.get(e.fromId);
    const vb = velocities.get(e.toId);
    if (!pa || !pb || !va || !vb) continue;
    const dx = pb.x - pa.x;
    const dy = pb.y - pa.y;
    const dz = pb.z - pa.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.001;
    const rest = SPRING_REST[e.kind];
    const k = SPRING_K[e.kind];
    const force = (dist - rest) * k;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;
    const fz = (dz / dist) * force;
    va.x += fx;
    va.y += fy;
    va.z += fz;
    vb.x -= fx;
    vb.y -= fy;
    vb.z -= fz;
  }

  // 3. アンカー引力(hybrid/brainはanchors)・中心引力(physicsのみ)
  if (mode === "hybrid" || mode === "brain") {
    for (const n of notes) {
      const anchor = anchors.get(n.id);
      const p = positions.get(n.id);
      const v = velocities.get(n.id);
      if (!anchor || !p || !v) continue;
      v.x += (anchor.x - p.x) * ANCHOR_K;
      v.y += (anchor.y - p.y) * ANCHOR_K;
      v.z += (anchor.z - p.z) * ANCHOR_K;
    }
  } else if (mode === "physics") {
    for (const n of notes) {
      const p = positions.get(n.id);
      const v = velocities.get(n.id);
      if (!p || !v) continue;
      v.x -= p.x * CENTER_K;
      v.y -= p.y * CENTER_K;
      v.z -= p.z * CENTER_K;
    }
  }

  // 4. 速度減衰 + クランプ + 位置更新
  for (const n of notes) {
    const p = positions.get(n.id);
    const v = velocities.get(n.id);
    if (!p || !v) continue;
    v.x *= DAMPING;
    v.y *= DAMPING;
    v.z *= DAMPING;
    const speedSq = v.x * v.x + v.y * v.y + v.z * v.z;
    if (speedSq > MAX_VELOCITY * MAX_VELOCITY) {
      const scale = MAX_VELOCITY / Math.sqrt(speedSq);
      v.x *= scale;
      v.y *= scale;
      v.z *= scale;
    }
    p.x += v.x;
    p.y += v.y;
    p.z += v.z;
  }
}
