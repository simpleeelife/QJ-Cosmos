import { useTimeStore, type Viewpoint } from "../store/timeStore";

const OPTIONS: { value: Viewpoint; label: string }[] = [
  { value: "free", label: "自由" },
  { value: "fromEarth", label: "地球→月" },
  { value: "fromMoon", label: "月→地球" },
  { value: "fromSun", label: "太陽→地球" },
];

export function ViewSelector() {
  const viewpoint = useTimeStore((s) => s.viewpoint);
  const setViewpoint = useTimeStore((s) => s.setViewpoint);
  return (
    <div className="view-selector">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          className={viewpoint === opt.value ? "active" : ""}
          onClick={() => setViewpoint(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
