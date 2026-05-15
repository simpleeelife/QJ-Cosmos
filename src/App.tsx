import { UpperCosmos } from "./upper/UpperCosmos";
import { LowerCosmos } from "./lower/LowerCosmos";
import { Hud } from "./ui/Hud";
import { TimeSlider } from "./ui/TimeSlider";
import { ViewSelector } from "./ui/ViewSelector";
import { VaultButton } from "./ui/VaultButton";
import { useState } from "react";
import { ConnectionLegend } from "./ui/ConnectionLegend";
import { NoteInfoPanel } from "./ui/NoteInfoPanel";
import { LayoutSelector } from "./ui/LayoutSelector";
import { LowerEmptyState } from "./ui/LowerEmptyState";
import { useNotesStore } from "./store/notesStore";
import { usePlaybackDriver } from "./hooks/usePlaybackDriver";

function MobileNotice() {
  const [open, setOpen] = useState(false);
  return (
    <div className={`mobile-notice ${open ? "open" : ""}`}>
      <button
        className="mobile-notice-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="title">心宙 — Inner Cosmos</span>
        <span className="chev">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="mobile-notice-body">
          <p>
            ローカルの <code>.md</code> ファイル(Obsidianのジャーナルなど)を3D空間に星として配置し、
            連続日・節気・テーマ・夢などの関連性を線で可視化します。
          </p>
          <p className="dim">
            File System Access API を使うため、PC版(Chrome / Edge)でのみご利用いただけます。
          </p>
        </div>
      )}
    </div>
  );
}

export function App() {
  usePlaybackDriver();
  const hasNotes = useNotesStore((s) => s.notes.length > 0);
  return (
    <div className="app">
      <div className="upper-pane">
        <div className="pane-title">
          天宙<span className="pane-title-en">Outer Cosmos</span>
        </div>
        <Hud />
        <ViewSelector />
        <UpperCosmos />
        <TimeSlider />
        <MobileNotice />
      </div>
      <div className="lower-pane">
        <div className="pane-title">
          心宙<span className="pane-title-en">Inner Cosmos</span>
        </div>
        <VaultButton />
        {hasNotes && <LayoutSelector />}
        {hasNotes && <ConnectionLegend />}
        <LowerCosmos />
        {!hasNotes && <LowerEmptyState />}
        <NoteInfoPanel />
      </div>
    </div>
  );
}
