export function LowerEmptyState() {
  return (
    <div className="lower-empty">
      <div className="lower-empty-inner">
        <h2>ジャーナル宇宙</h2>
        <p className="lead">
          左上の「<strong>Vault読み込み</strong>」を押して、
          <br />
          .md ファイルが入ったフォルダを選んでください。
        </p>
        <div className="hint-box">
          <div className="hint-title">読み込めるファイル</div>
          <ul>
            <li>
              ファイル名が <code>YYYYMMDD</code> で始まる .md
              <br />
              <span className="dim">例: 20260514_journal.md</span>
            </li>
            <li>
              または frontmatter に <code>date: YYYY-MM-DD</code> がある .md
            </li>
          </ul>
        </div>
        <div className="hint-box">
          <div className="hint-title">自動で計算されるもの</div>
          <ul>
            <li>その日の二十四節気・月相・月齢</li>
            <li>連続日のつながり線(時系列)</li>
            <li>同月相のつながり線(月のリズム)</li>
          </ul>
        </div>
        <div className="hint-box dim">
          <div className="hint-title">追加で見えるもの(高度)</div>
          <ul>
            <li>
              frontmatter に <code>themes</code> / <code>dream_motifs</code> /{" "}
              <code>open_questions</code> / <code>addresses</code>
              があると、テーマ・夢・問い↔答えの線が浮かびます
            </li>
            <li>(別途LLM解析でこれらを追記する想定)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
