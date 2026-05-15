import { useEffect } from "react";
import { useTimeStore } from "../store/timeStore";

const DAY_MS = 24 * 60 * 60 * 1000;

export function usePlaybackDriver() {
  const isPlaying = useTimeStore((s) => s.isPlaying);
  const speed = useTimeStore((s) => s.speedDaysPerSec);

  useEffect(() => {
    if (!isPlaying) return;
    let rafId = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const advanceMs = dt * speed * DAY_MS;
      const cur = useTimeStore.getState().currentDate.getTime();
      useTimeStore.getState().setFromTimestamp(cur + advanceMs);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, speed]);
}
