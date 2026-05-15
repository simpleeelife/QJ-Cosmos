import { useNotesStore } from "../store/notesStore";

export function VaultButton() {
  const loading = useNotesStore((s) => s.loading);
  const vaultName = useNotesStore((s) => s.vaultName);
  const error = useNotesStore((s) => s.error);
  const skippedCount = useNotesStore((s) => s.skippedCount);
  const loadFromVault = useNotesStore((s) => s.loadFromVault);

  return (
    <div className="vault-button">
      <button onClick={loadFromVault} disabled={loading}>
        {loading
          ? "読み込み中..."
          : vaultName
          ? `${vaultName} ✓`
          : "Vault読み込み"}
      </button>
      {skippedCount > 0 && (
        <div className="info">{skippedCount}件スキップ(コンソール参照)</div>
      )}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
