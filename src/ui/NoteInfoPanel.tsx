import { useMemo } from "react";
import { useNotesStore } from "../store/notesStore";
import { useUiStore } from "../store/uiStore";

const fmt = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "short",
});

export function NoteInfoPanel() {
  const notes = useNotesStore((s) => s.notes);
  const hovered = useUiStore((s) => s.hoveredNoteId);
  const pinned = useUiStore((s) => s.pinnedNoteId);
  const clearPin = useUiStore((s) => s.clearPin);

  const activeId = pinned ?? hovered;
  const note = useMemo(
    () => (activeId ? notes.find((n) => n.id === activeId) ?? null : null),
    [activeId, notes]
  );

  if (!note) return null;

  return (
    <div className={`note-info ${pinned ? "pinned" : ""}`}>
      <div className="header">
        <div className="filename">{note.filename}</div>
        {pinned && (
          <button className="close" onClick={clearPin} title="ピン解除">
            ×
          </button>
        )}
      </div>
      {note.date && <div className="date">{fmt.format(note.date)}</div>}

      <div className="meta-row">
        {note.sekki && <span className="chip sekki">{note.sekki}</span>}
        {note.moonPhase && <span className="chip moon">{note.moonPhase}</span>}
        {note.moonAge != null && (
          <span className="chip moon">月齢 {note.moonAge.toFixed(1)}</span>
        )}
      </div>

      {note.themes.length > 0 && (
        <Section label="テーマ" color="#73f280">
          <div className="chips">
            {note.themes.map((t) => (
              <span key={t} className="chip theme">{t}</span>
            ))}
          </div>
        </Section>
      )}

      {note.dreamMotifs.length > 0 && (
        <Section label="夢のモチーフ" color="#d966ff">
          <div className="chips">
            {note.dreamMotifs.map((t) => (
              <span key={t} className="chip dream">{t}</span>
            ))}
          </div>
        </Section>
      )}

      {note.openQuestions.length > 0 && (
        <Section label="閉じない問い" color="#ffd933">
          <ul className="questions">
            {note.openQuestions.map((q) => (
              <li key={q.id}>{q.text}</li>
            ))}
          </ul>
        </Section>
      )}

      {note.addresses.length > 0 && (
        <Section label="答えを示した過去の問い" color="#ffd933">
          <div className="chips">
            {note.addresses.map((id) => (
              <span key={id} className="chip address">{id}</span>
            ))}
          </div>
        </Section>
      )}

      {note.preview && (
        <Section label="本文" color="#888">
          <div className="preview">{note.preview}…</div>
        </Section>
      )}

      {!pinned && <div className="hint">クリックでピン留め</div>}
    </div>
  );
}

function Section({
  label,
  color,
  children,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="section">
      <div className="section-label" style={{ color }}>{label}</div>
      {children}
    </div>
  );
}
