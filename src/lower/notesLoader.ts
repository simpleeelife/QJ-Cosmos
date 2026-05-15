import yaml from "js-yaml";
import { getSnapshot } from "../astro/ephemeris";

export interface OpenQuestion {
  id: string;
  text: string;
}

export interface Note {
  id: string;
  filename: string;
  date: Date | null;
  contentLength: number;
  tags: string[];
  preview: string;
  sekki: string | null;
  moonPhase: string | null;
  moonAge: number | null;
  themes: string[];
  dreamMotifs: string[];
  openQuestions: OpenQuestion[];
  addresses: string[];
  analyzedAt: string | null;
}

export interface LoadResult {
  notes: Note[];
  skipped: string[];
}

declare global {
  interface Window {
    showDirectoryPicker(options?: {
      mode?: "read" | "readwrite";
    }): Promise<FileSystemDirectoryHandle>;
  }
}

const SKIP_DIRS = new Set([
  ".obsidian",
  ".trash",
  ".git",
  "node_modules",
  ".DS_Store",
]);

export async function pickAndLoadVault(): Promise<LoadResult> {
  if (typeof window.showDirectoryPicker !== "function") {
    throw new Error(
      "このブラウザはFile System Access APIに未対応です(Chrome/Edge推奨)"
    );
  }
  const handle = await window.showDirectoryPicker({ mode: "read" });
  const notes: Note[] = [];
  const skipped: string[] = [];
  await collectMarkdown(handle, "", notes, skipped);
  notes.sort((a, b) => {
    const ta = a.date?.getTime() ?? 0;
    const tb = b.date?.getTime() ?? 0;
    return ta - tb;
  });
  return { notes, skipped };
}

async function collectMarkdown(
  dir: FileSystemDirectoryHandle,
  prefix: string,
  out: Note[],
  skipped: string[]
): Promise<void> {
  let entries: AsyncIterableIterator<[string, FileSystemHandle]>;
  try {
    entries = (
      dir as unknown as {
        entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
      }
    ).entries();
  } catch {
    skipped.push(prefix + "/ (entries unreadable)");
    return;
  }

  while (true) {
    let next: IteratorResult<[string, FileSystemHandle]>;
    try {
      next = await entries.next();
    } catch {
      skipped.push(prefix + "/ (iteration failed)");
      return;
    }
    if (next.done) return;
    const [name, child] = next.value;
    if (name.startsWith(".") || SKIP_DIRS.has(name)) continue;

    const path = prefix ? `${prefix}/${name}` : name;
    if (child.kind === "file" && name.toLowerCase().endsWith(".md")) {
      try {
        const file = await (child as FileSystemFileHandle).getFile();
        const content = await file.text();
        const fm = parseFrontmatter(content);
        const date =
          parseDateFromFilename(name) ?? parseDateFromFrontmatter(fm);

        // frontmatter優先、なければ日付から自動計算
        const fmSekki = normalizeSekki(getString(fm, "solar_term"));
        const fmMoonPhase = getString(fm, "moon_phase");
        const fmMoonAge = getNumber(fm, "moon_age");
        const derived = date ? deriveAstroFromDate(date) : null;

        out.push({
          id: path,
          filename: name,
          date,
          contentLength: content.length,
          tags: extractTags(content),
          preview: stripFrontmatter(content).slice(0, 200),
          sekki: fmSekki ?? derived?.sekki ?? null,
          moonPhase: fmMoonPhase ?? derived?.moonPhase ?? null,
          moonAge: fmMoonAge ?? derived?.moonAge ?? null,
          themes: getStringArray(fm, "themes"),
          dreamMotifs: getStringArray(fm, "dream_motifs"),
          openQuestions: parseOpenQuestions(fm),
          addresses: getStringArray(fm, "addresses"),
          analyzedAt: getString(fm, "analyzed_at"),
        });
      } catch {
        skipped.push(path);
      }
    } else if (child.kind === "directory") {
      try {
        await collectMarkdown(
          child as FileSystemDirectoryHandle,
          path,
          out,
          skipped
        );
      } catch {
        skipped.push(path + "/");
      }
    }
  }
}

function parseDateFromFilename(name: string): Date | null {
  const m = name.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return new Date(y, mo - 1, d, 12, 0, 0);
}

function extractTags(content: string): string[] {
  const set = new Set<string>();
  const re = /(?:^|\s)#([\p{L}\d_\-/]+)/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    set.add(m[1]);
  }
  return Array.from(set);
}

function parseFrontmatter(content: string): Record<string, unknown> {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  try {
    const loaded = yaml.load(m[1]);
    return loaded && typeof loaded === "object" && !Array.isArray(loaded)
      ? (loaded as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function stripFrontmatter(content: string): string {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

function parseDateFromFrontmatter(
  fm: Record<string, unknown>
): Date | null {
  const d = fm.date;
  if (d instanceof Date) return d;
  if (typeof d !== "string") return null;
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0);
}

const SEKKI_NAMES = new Set([
  "立春", "雨水", "啓蟄", "春分", "清明", "穀雨",
  "立夏", "小満", "芒種", "夏至", "小暑", "大暑",
  "立秋", "処暑", "白露", "秋分", "寒露", "霜降",
  "立冬", "小雪", "大雪", "冬至", "小寒", "大寒",
]);

function deriveAstroFromDate(date: Date): {
  sekki: string;
  moonPhase: string;
  moonAge: number;
} {
  const snap = getSnapshot(date);
  // moon_age 概算: 月相角(0-360°)を朔望月29.5306日に換算
  const moonAge = (snap.moonPhaseAngle / 360) * 29.5306;
  return {
    sekki: snap.sekki.name,
    moonPhase: snap.moonPhaseName,
    moonAge,
  };
}

function normalizeSekki(raw: string | null): string | null {
  if (!raw) return null;
  const stripped = raw.replace(/期$/, "").trim();
  return SEKKI_NAMES.has(stripped) ? stripped : null;
}

function getString(fm: Record<string, unknown>, key: string): string | null {
  const v = fm[key];
  return typeof v === "string" ? v : null;
}

function getNumber(fm: Record<string, unknown>, key: string): number | null {
  const v = fm[key];
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function getStringArray(
  fm: Record<string, unknown>,
  key: string
): string[] {
  const v = fm[key];
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((s) => s.trim());
}

function parseOpenQuestions(fm: Record<string, unknown>): OpenQuestion[] {
  const v = fm.open_questions;
  if (!Array.isArray(v)) return [];
  const out: OpenQuestion[] = [];
  for (const item of v) {
    if (typeof item === "string") {
      // 旧形式("問い文字列のみ")への暫定対応 — id仮生成
      out.push({ id: `legacy-${out.length}`, text: item });
    } else if (item && typeof item === "object") {
      const obj = item as Record<string, unknown>;
      const id = typeof obj.id === "string" ? obj.id : null;
      const text = typeof obj.text === "string" ? obj.text : null;
      if (id && text) out.push({ id, text });
    }
  }
  return out;
}
