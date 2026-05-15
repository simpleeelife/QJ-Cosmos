import { create } from "zustand";

export type Viewpoint = "free" | "fromEarth" | "fromMoon" | "fromSun";

export const SPEED_OPTIONS: { label: string; daysPerSec: number }[] = [
  { label: "1日/秒", daysPerSec: 1 },
  { label: "1週/秒", daysPerSec: 7 },
  { label: "1月/秒", daysPerSec: 30 },
  { label: "3月/秒", daysPerSec: 90 },
  { label: "1年/秒", daysPerSec: 365 },
];

interface TimeState {
  currentDate: Date;
  viewpoint: Viewpoint;
  isPlaying: boolean;
  speedDaysPerSec: number;
  setCurrentDate: (d: Date) => void;
  setFromTimestamp: (ms: number) => void;
  resetToNow: () => void;
  setViewpoint: (v: Viewpoint) => void;
  togglePlay: () => void;
  setSpeed: (daysPerSec: number) => void;
}

export const useTimeStore = create<TimeState>((set) => ({
  currentDate: new Date(),
  viewpoint: "free",
  isPlaying: false,
  speedDaysPerSec: 7,
  setCurrentDate: (d) => set({ currentDate: d }),
  setFromTimestamp: (ms) => set({ currentDate: new Date(ms) }),
  resetToNow: () => set({ currentDate: new Date() }),
  setViewpoint: (v) => set({ viewpoint: v }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setSpeed: (daysPerSec) => set({ speedDaysPerSec: daysPerSec }),
}));
