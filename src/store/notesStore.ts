import { create } from "zustand";
import type { Note } from "../lower/notesLoader";
import { pickAndLoadVault } from "../lower/notesLoader";

interface NotesState {
  notes: Note[];
  loading: boolean;
  error: string | null;
  vaultName: string | null;
  skippedCount: number;
  loadFromVault: () => Promise<void>;
  clear: () => void;
}

export const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  loading: false,
  error: null,
  vaultName: null,
  skippedCount: 0,
  loadFromVault: async () => {
    set({ loading: true, error: null });
    try {
      const { notes, skipped } = await pickAndLoadVault();
      set({
        notes,
        loading: false,
        vaultName: `${notes.length} notes`,
        skippedCount: skipped.length,
      });
      if (skipped.length > 0) {
        // 大量スキップ時にコンソールへ詳細
        console.warn(
          `[qj-cosmos] ${skipped.length} files/dirs skipped:`,
          skipped.slice(0, 50)
        );
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("aborted") || msg.toLowerCase().includes("user")) {
        set({ loading: false });
        return;
      }
      set({ loading: false, error: msg });
    }
  },
  clear: () => set({ notes: [], vaultName: null, error: null, skippedCount: 0 }),
}));
