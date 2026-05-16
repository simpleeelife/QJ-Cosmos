import { useTimeStore, type PlanetScope } from "../store/timeStore";

const OPTIONS: { value: PlanetScope; label: string }[] = [
  { value: "inner", label: "内惑星" },
  { value: "all", label: "全惑星" },
];

export function PlanetScopeSelector() {
  const scope = useTimeStore((s) => s.planetScope);
  const setScope = useTimeStore((s) => s.setPlanetScope);
  return (
    <div className="planet-scope-selector">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          className={scope === opt.value ? "active" : ""}
          onClick={() => setScope(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
