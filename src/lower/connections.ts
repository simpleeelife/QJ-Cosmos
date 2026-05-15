import type { Note } from "./notesLoader";

const DAY_MS = 24 * 60 * 60 * 1000;
const TEMPORAL_GAP_DAYS = 3;
const THEME_OVERLAP_THRESHOLD = 2;
const DREAM_OVERLAP_THRESHOLD = 1;

export type ConnectionKind =
  | "temporal"
  | "lunar"
  | "theme"
  | "dream"
  | "question";

export interface Connection {
  fromId: string;
  toId: string;
  kind: ConnectionKind;
}

export function buildConnections(notes: Note[]): Connection[] {
  const conns: Connection[] = [];

  // 1. Temporal: 連続日のチェーン
  const dated = notes.filter((n) => n.date != null);
  dated.sort((a, b) => a.date!.getTime() - b.date!.getTime());
  for (let i = 0; i < dated.length - 1; i++) {
    const gap =
      (dated[i + 1].date!.getTime() - dated[i].date!.getTime()) / DAY_MS;
    if (gap <= TEMPORAL_GAP_DAYS) {
      conns.push({
        fromId: dated[i].id,
        toId: dated[i + 1].id,
        kind: "temporal",
      });
    }
  }

  // 2. Lunar: 同月相のチェーン
  const byPhase = new Map<string, Note[]>();
  for (const n of notes) {
    if (!n.moonPhase) continue;
    const list = byPhase.get(n.moonPhase) ?? [];
    list.push(n);
    byPhase.set(n.moonPhase, list);
  }
  for (const list of byPhase.values()) {
    list.sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0));
    for (let i = 0; i < list.length - 1; i++) {
      conns.push({ fromId: list[i].id, toId: list[i + 1].id, kind: "lunar" });
    }
  }

  // 3. Theme: themes 2個以上一致(全ペア)
  for (let i = 0; i < notes.length; i++) {
    const a = notes[i];
    if (a.themes.length === 0) continue;
    const setA = new Set(a.themes);
    for (let j = i + 1; j < notes.length; j++) {
      const b = notes[j];
      if (b.themes.length === 0) continue;
      let overlap = 0;
      for (const t of b.themes) if (setA.has(t)) overlap++;
      if (overlap >= THEME_OVERLAP_THRESHOLD) {
        conns.push({ fromId: a.id, toId: b.id, kind: "theme" });
      }
    }
  }

  // 4. Dream: dream_motifs 1個以上一致(全ペア)
  for (let i = 0; i < notes.length; i++) {
    const a = notes[i];
    if (a.dreamMotifs.length === 0) continue;
    const setA = new Set(a.dreamMotifs);
    for (let j = i + 1; j < notes.length; j++) {
      const b = notes[j];
      if (b.dreamMotifs.length === 0) continue;
      let overlap = 0;
      for (const t of b.dreamMotifs) if (setA.has(t)) overlap++;
      if (overlap >= DREAM_OVERLAP_THRESHOLD) {
        conns.push({ fromId: a.id, toId: b.id, kind: "dream" });
      }
    }
  }

  // 5. Question: addresses(過去問いID参照)→ 元ノートと繋ぐ
  const questionToNote = new Map<string, string>();
  for (const n of notes) {
    for (const q of n.openQuestions) {
      questionToNote.set(q.id, n.id);
    }
  }
  for (const n of notes) {
    if (n.addresses.length === 0) continue;
    const seen = new Set<string>();
    for (const targetQid of n.addresses) {
      const sourceNoteId = questionToNote.get(targetQid);
      if (!sourceNoteId || sourceNoteId === n.id) continue;
      if (seen.has(sourceNoteId)) continue;
      seen.add(sourceNoteId);
      conns.push({ fromId: n.id, toId: sourceNoteId, kind: "question" });
    }
  }

  return conns;
}
