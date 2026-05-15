import { useUiStore, type PlacementMode } from "../store/uiStore";

const OPTIONS: { value: PlacementMode; label: string; hint: string }[] = [
  { value: "static", label: "静的", hint: "節気銀河(現状)" },
  { value: "hybrid", label: "ハイブリッド", hint: "節気アンカー + 関連性引力" },
  { value: "physics", label: "連想", hint: "アンカー解除・関連性のみで自己組織化(Obsidianグラフ風)" },
  { value: "brain", label: "脳構造", hint: "本能/感性/知性の3層" },
];

export function LayoutSelector() {
  const mode = useUiStore((s) => s.placementMode);
  const setMode = useUiStore((s) => s.setPlacementMode);
  return (
    <div className="layout-selector">
      <div className="layout-label">配置モード</div>
      <div className="layout-buttons">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={mode === opt.value ? "active" : ""}
            onClick={() => setMode(opt.value)}
            title={opt.hint}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
