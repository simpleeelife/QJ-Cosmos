import { useMemo } from "react";
import { useTimeStore } from "../store/timeStore";
import { getSnapshot } from "../astro/ephemeris";

const fmt = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "short",
});

export function Hud() {
  const date = useTimeStore((s) => s.currentDate);
  const snap = useMemo(() => getSnapshot(date), [date]);
  return (
    <div className="hud">
      <div className="date">{fmt.format(date)}</div>
      <div className="row"><span>節気</span><span>{snap.sekki.name}</span></div>
      <div className="row"><span>月相</span><span>{snap.moonPhaseName}</span></div>
      <div className="row"><span>輝面比</span><span>{(snap.moonIlluminatedFraction * 100).toFixed(0)}%</span></div>
      <div className="row"><span>潮</span><span>{snap.tide}</span></div>
    </div>
  );
}
