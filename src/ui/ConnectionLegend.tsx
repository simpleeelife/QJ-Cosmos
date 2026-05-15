import { useUiStore, type LineKind } from "../store/uiStore";

const ITEMS: { kind: LineKind; color: string; label: string }[] = [
  { kind: "temporal",    color: "#ff8c33", label: "連続日" },
  { kind: "lunar",       color: "#59a6ff", label: "同月相" },
  { kind: "theme",       color: "#4dff73", label: "同テーマ" },
  { kind: "dream",       color: "#d966ff", label: "同夢モチーフ" },
  { kind: "question",    color: "#ffd933", label: "問い ↔ 答え" },
  { kind: "sekkiAnchor", color: "#aaccff", label: "節気 → ノート" },
];

export function ConnectionLegend() {
  const visibility = useUiStore((s) => s.lineVisibility);
  const toggle = useUiStore((s) => s.toggleLineKind);
  return (
    <div className="connection-legend">
      {ITEMS.map((item) => {
        const visible = visibility[item.kind];
        return (
          <button
            key={item.kind}
            className={`legend-item ${visible ? "" : "hidden"}`}
            onClick={() => toggle(item.kind)}
            title={visible ? "クリックで非表示" : "クリックで表示"}
          >
            <span
              className="swatch"
              style={{
                backgroundColor: visible ? item.color : "transparent",
                borderColor: item.color,
              }}
            />
            <span className="legend-label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
