import { UpperCosmos } from "./upper/UpperCosmos";
import { LowerCosmos } from "./lower/LowerCosmos";
import { Hud } from "./ui/Hud";
import { TimeSlider } from "./ui/TimeSlider";
import { ViewSelector } from "./ui/ViewSelector";
import { VaultButton } from "./ui/VaultButton";
import { ConnectionLegend } from "./ui/ConnectionLegend";
import { NoteInfoPanel } from "./ui/NoteInfoPanel";
import { LayoutSelector } from "./ui/LayoutSelector";
import { LowerEmptyState } from "./ui/LowerEmptyState";
import { useNotesStore } from "./store/notesStore";
import { usePlaybackDriver } from "./hooks/usePlaybackDriver";

export function App() {
  usePlaybackDriver();
  const hasNotes = useNotesStore((s) => s.notes.length > 0);
  return (
    <div className="app">
      <div className="upper-pane">
        <Hud />
        <ViewSelector />
        <UpperCosmos />
        <TimeSlider />
      </div>
      <div className="lower-pane">
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
