import { UpperCosmos } from "./upper/UpperCosmos";
import { LowerCosmos } from "./lower/LowerCosmos";
import { Hud } from "./ui/Hud";
import { TimeSlider } from "./ui/TimeSlider";
import { ViewSelector } from "./ui/ViewSelector";
import { PlanetScopeSelector } from "./ui/PlanetScopeSelector";
import { VaultButton } from "./ui/VaultButton";
import { ConnectionLegend } from "./ui/ConnectionLegend";
import { NoteInfoPanel } from "./ui/NoteInfoPanel";
import { LayoutSelector } from "./ui/LayoutSelector";
import { LowerEmptyState } from "./ui/LowerEmptyState";
import { useNotesStore } from "./store/notesStore";
import { useUiStore } from "./store/uiStore";
import { usePlaybackDriver } from "./hooks/usePlaybackDriver";

function LowerToggleBar() {
  const panelMode = useUiStore((s) => s.panelMode);
  const togglePanelMode = useUiStore((s) => s.togglePanelMode);
  const open = panelMode === "split";
  return (
    <button
      className="lower-toggle-bar"
      onClick={togglePanelMode}
      aria-expanded={open}
      title={open ? "閉じる" : "開く"}
    >
      <span className="title">
        心宙 <span className="en">Inner Cosmos</span>
      </span>
      <span className="chev">{open ? "▾" : "▴"}</span>
    </button>
  );
}

export function App() {
  usePlaybackDriver();
  const panelMode = useUiStore((s) => s.panelMode);
  const hasNotes = useNotesStore((s) => s.notes.length > 0);
  const isSplit = panelMode === "split";
  return (
    <div className={`app ${panelMode}`}>
      <div className="upper-pane">
        <div className="pane-title">
          天宙<span className="pane-title-en">Outer Cosmos</span>
        </div>
        <Hud />
        <ViewSelector />
        <PlanetScopeSelector />
        <UpperCosmos />
        <TimeSlider />
      </div>
      <div className="lower-pane">
        <LowerToggleBar />
        {isSplit && (
          <div className="lower-content">
            <VaultButton />
            {hasNotes && <LayoutSelector />}
            {hasNotes && <ConnectionLegend />}
            <LowerCosmos />
            {!hasNotes && <LowerEmptyState />}
            <NoteInfoPanel />
          </div>
        )}
      </div>
    </div>
  );
}
