import { useMemo } from "react";
import { useTimeStore, SPEED_OPTIONS } from "../store/timeStore";

const DAY_MS = 24 * 60 * 60 * 1000;
const RANGE_DAYS = 365 * 2;

export function TimeSlider() {
  const date = useTimeStore((s) => s.currentDate);
  const isPlaying = useTimeStore((s) => s.isPlaying);
  const speed = useTimeStore((s) => s.speedDaysPerSec);
  const setFromTimestamp = useTimeStore((s) => s.setFromTimestamp);
  const resetToNow = useTimeStore((s) => s.resetToNow);
  const togglePlay = useTimeStore((s) => s.togglePlay);
  const setSpeed = useTimeStore((s) => s.setSpeed);

  const { min, max } = useMemo(() => {
    const now = Date.now();
    return { min: now - RANGE_DAYS * DAY_MS, max: now + RANGE_DAYS * DAY_MS };
  }, []);

  const offsetDays = Math.round((date.getTime() - Date.now()) / DAY_MS);

  return (
    <div className="time-slider">
      <button
        className="play"
        onClick={togglePlay}
        title={isPlaying ? "停止" : "再生"}
      >
        {isPlaying ? "⏸" : "▶"}
      </button>
      <button onClick={() => setFromTimestamp(date.getTime() - 30 * DAY_MS)} title="-1ヶ月">‹‹</button>
      <button onClick={() => setFromTimestamp(date.getTime() - DAY_MS)} title="-1日">‹</button>
      <input
        type="range"
        min={min}
        max={max}
        step={DAY_MS}
        value={Math.min(Math.max(date.getTime(), min), max)}
        onChange={(e) => setFromTimestamp(Number(e.target.value))}
      />
      <button onClick={() => setFromTimestamp(date.getTime() + DAY_MS)} title="+1日">›</button>
      <button onClick={() => setFromTimestamp(date.getTime() + 30 * DAY_MS)} title="+1ヶ月">››</button>
      <button onClick={resetToNow} title="現在時刻">今</button>
      <select
        className="speed"
        value={speed}
        onChange={(e) => setSpeed(Number(e.target.value))}
        title="再生速度"
      >
        {SPEED_OPTIONS.map((opt) => (
          <option key={opt.daysPerSec} value={opt.daysPerSec}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="label">
        {offsetDays === 0 ? "today" : offsetDays > 0 ? `+${offsetDays}d` : `${offsetDays}d`}
      </span>
    </div>
  );
}
