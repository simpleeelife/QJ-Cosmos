import type { Note } from "./notesLoader";

export type BrainLayer = "stem" | "limbic" | "cortex";

export const BRAIN_LAYER_LABELS: Record<BrainLayer, string> = {
  stem: "本能(脳幹)",
  limbic: "感性(辺縁系)",
  cortex: "知性(新皮質)",
};

export const BRAIN_LAYER_COLORS: Record<BrainLayer, string> = {
  stem: "rgb(255, 110, 80)",
  limbic: "rgb(255, 180, 110)",
  cortex: "rgb(140, 200, 255)",
};

const STEM_KEYWORDS = [
  "身体", "体", "食", "睡眠", "眠", "性", "欲", "怖", "生存",
  "疲", "健康", "病", "死", "痛", "本能", "息", "声", "感覚",
];

const LIMBIC_KEYWORDS = [
  "関係", "愛", "悲", "喜", "怒", "記憶", "感情", "心",
  "寂", "父", "母", "家族", "友", "想い", "感じ", "泣",
  "辛", "うれ", "怖れ", "懐", "情", "夢", "感応", "響",
];

const CORTEX_KEYWORDS = [
  "創造", "分析", "哲学", "計画", "抽象", "理論", "仕組",
  "論理", "思考", "意識", "構造", "探求", "思想", "本質",
  "原理", "構築", "設計", "理性", "問い", "意味", "概念",
  "知性", "情報", "学", "知", "解", "考",
];

function scoreKeywords(text: string, keywords: string[]): number {
  let score = 0;
  for (const kw of keywords) {
    if (text.includes(kw)) score++;
  }
  return score;
}

export function classifyBrainLayer(note: Note): BrainLayer {
  let stem = 0;
  let limbic = 0;
  let cortex = 0;

  // 夢の存在 → 強い辺縁系シグナル
  limbic += note.dreamMotifs.length * 2;

  // 閉じない問い → 強い新皮質シグナル
  cortex += note.openQuestions.length * 2;

  // テーマからキーワードスコアリング
  const themeText = note.themes.join(" ");
  stem += scoreKeywords(themeText, STEM_KEYWORDS);
  limbic += scoreKeywords(themeText, LIMBIC_KEYWORDS);
  cortex += scoreKeywords(themeText, CORTEX_KEYWORDS);

  // フォールバック: テーマも夢も問いもないノートは新皮質寄り
  const max = Math.max(stem, limbic, cortex);
  if (max === 0) return "cortex";
  if (max === stem) return "stem";
  if (max === limbic) return "limbic";
  return "cortex";
}

const RADII: Record<BrainLayer, number> = {
  stem: 3,
  limbic: 9,
  cortex: 16,
};

const Y_FLATTEN = 0.7;

function fibonacciSphere(
  index: number,
  total: number,
  radius: number
): [number, number, number] {
  if (total === 0) return [0, 0, 0];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const y = total === 1 ? 0 : 1 - (index / (total - 1)) * 2;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const angle = goldenAngle * index;
  return [
    Math.cos(angle) * r * radius,
    y * radius * Y_FLATTEN,
    Math.sin(angle) * r * radius,
  ];
}

export interface BrainAnchorMap {
  anchors: Map<string, [number, number, number]>;
  layerByNote: Map<string, BrainLayer>;
  countByLayer: Record<BrainLayer, number>;
}

export function buildBrainAnchors(notes: Note[]): BrainAnchorMap {
  const layerByNote = new Map<string, BrainLayer>();
  const byLayer: Record<BrainLayer, string[]> = {
    stem: [],
    limbic: [],
    cortex: [],
  };
  for (const n of notes) {
    const layer = classifyBrainLayer(n);
    layerByNote.set(n.id, layer);
    byLayer[layer].push(n.id);
  }

  const anchors = new Map<string, [number, number, number]>();
  for (const layer of ["stem", "limbic", "cortex"] as BrainLayer[]) {
    const ids = byLayer[layer];
    for (let i = 0; i < ids.length; i++) {
      anchors.set(ids[i], fibonacciSphere(i, ids.length, RADII[layer]));
    }
  }

  return {
    anchors,
    layerByNote,
    countByLayer: {
      stem: byLayer.stem.length,
      limbic: byLayer.limbic.length,
      cortex: byLayer.cortex.length,
    },
  };
}
