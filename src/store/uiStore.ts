import { create } from "zustand";
import type { ConnectionKind } from "../lower/connections";

export type PlacementMode = "static" | "hybrid" | "physics" | "brain";

export type LineKind = ConnectionKind | "sekkiAnchor";

interface UiState {
  hoveredNoteId: string | null;
  pinnedNoteId: string | null;
  focusedPosition: [number, number, number] | null;
  placementMode: PlacementMode;
  lineVisibility: Record<LineKind, boolean>;
  setHovered: (id: string | null) => void;
  togglePin: (id: string) => void;
  clearPin: () => void;
  setFocus: (pos: [number, number, number] | null) => void;
  setPlacementMode: (m: PlacementMode) => void;
  toggleLineKind: (kind: LineKind) => void;
}

export const useUiStore = create<UiState>((set) => ({
  hoveredNoteId: null,
  pinnedNoteId: null,
  focusedPosition: null,
  placementMode: "static",
  lineVisibility: {
    temporal: true,
    lunar: true,
    theme: true,
    dream: true,
    question: true,
    sekkiAnchor: true,
  },
  setHovered: (id) => set({ hoveredNoteId: id }),
  togglePin: (id) =>
    set((s) => ({ pinnedNoteId: s.pinnedNoteId === id ? null : id })),
  clearPin: () => set({ pinnedNoteId: null, focusedPosition: null }),
  setFocus: (pos) => set({ focusedPosition: pos }),
  setPlacementMode: (m) => set({ placementMode: m }),
  toggleLineKind: (kind) =>
    set((s) => ({
      lineVisibility: { ...s.lineVisibility, [kind]: !s.lineVisibility[kind] },
    })),
}));
