# ジャーナル解析プロンプト仕様(パターンB: クロス参照・2パス)

QJ Cosmosで「テーマ線・夢線・問い↔答え線」を表示するには、各 .md ファイルの frontmatter に解析結果を追記する必要があります。

このドキュメントは、別の Claude Code セッション(または任意のLLMワークフロー)で**自動解析を実行する際の仕様**です。

## 対象

```
<your-vault-path>/<your-journal-folder>/*.md
```

例:
- Obsidian vault の Fleeting Notes フォルダ
- 任意のジャーナル管理フォルダ
- ファイル名形式: `YYYYMMDD_*.md` または frontmatter に `date:` がある

## 抽出する4軸

各ファイルの frontmatter に以下を**追記**(既存項目は保持):

```yaml
themes: [テーマ1, テーマ2, テーマ3]      # その日の中心テーマ(2〜4個、名詞句、短く)
dream_motifs: [モチーフ1, モチーフ2]      # 夢の象徴(夢を見た日のみ。人物・場所・物・行為)

open_questions:                            # この日が立てた、まだ閉じていない問い
  - id: q-YYYYMMDD-N                       # ID形式: q-YYYYMMDD-N (1-indexed)
    text: 立てられた問いの文章?
  - id: q-YYYYMMDD-2
    text: 別の問いの文章?

addresses:                                 # 過去の問いに「答えらしきもの」を示した場合
  - q-YYYYMMDD-2                           # 過去の他ファイルで定義された問いID
  - q-YYYYMMDD-1

analyzed_at: YYYY-MM-DD                    # 解析実施日(冪等性判定用)
analysis_version: 1
```

## 2パス処理

### Pass 1: 各ファイルから3軸を抽出

- 1ファイルずつ独立に処理(themes / dream_motifs / open_questions)
- `open_questions[].id` は `q-YYYYMMDD-N` で振る(YYYYMMDDはファイル名から)
- 結果を frontmatter に書き込み

### Pass 2: 各ファイルが過去の問いに答えているか判定 → addresses

- ファイルを**日付順**(古い→新しい)に処理
- 各ファイルについて:
  - インプット: そのノートの全文 + **そのノート日付より前**に立てられた全問い(id + text のリスト)
  - LLMに「このノートが答えを示している過去の問いはどれか?」を判定
  - 結果のIDリストを `addresses` フィールドに書き込み
- 「答え」の基準: 完全な解答である必要はなく、**問いに対する展開・別角度からの探求・部分的な気づき** も含む。逆に「単なる関連話題」は除外

## 抽出プロンプト方針

### Pass 1 プロンプト例

> 内省ジャーナルを読み、その日の魂の動きを3軸で抽出する。
> - **themes**: その日の中心にあったテーマ・問題意識・関心。名詞句で短く。要約ではなく「何が動いていたか」
> - **dream_motifs**: 夢に出てきた象徴。夢の言及がない日は空配列
> - **open_questions**: その日が立てた、答えに到達していない問い。文末「?」で
>
> 書き手の言葉の温度を残し、抽象化しすぎない。

### Pass 2 プロンプト例

> 今日書かれたジャーナル(添付)が、過去に立てた以下の問いに対して「答えらしきもの・展開・気づき」を示している場合、該当するIDをリストする。
>
> 過去の問いリスト:
> - q-YYYYMMDD-N: ...
> - ...
>
> 判定基準:
> - 完全な解答でなくても、問いに対する**展開・別角度からの探求・部分的な気づき**ならOK
> - 単なる関連話題(例: 同じキーワードが出てきただけ)は除外
> - 厳しめに判定。確信が持てないものは入れない

## ルール

1. **既存frontmatterは保持**(date, type 等の元の項目には触れない)
2. **追記のみ**: themes / dream_motifs / open_questions / addresses / analyzed_at / analysis_version
3. **冪等性**:
   - Pass 1: `analyzed_at` あり = スキップ可
   - Pass 2: 過去の問いリストが変わっていなければ再実行不要
4. **YAML配列形式**: open_questions はブロック形式(idとtextを保つため)、themes/dream_motifs/addresses はインライン `[a, b, c]` でOK

## コスト見積もり(Anthropic Claude APIの場合)

- **Pass 1**: ファイル数 × ~3K tokens
- **Pass 2**: ファイル数 × (~3K + 過去問い累積 1K-5K)
- 100ファイル前後で:
  - **Claude Sonnet 4.6 ($3/M input)**: 約 $2-3
  - **Claude Haiku 4.5 ($0.8/M input)**: 約 $0.7

精度優先なら Sonnet 推奨。

## QJ Cosmos 側で表示される線

これらのフィールドが入ると、QJ Cosmos の下画面で以下の線が現れます:

- **緑線(同テーマ)**: themes 2個以上一致
- **紫線(同夢モチーフ)**: dream_motifs 1個以上一致
- **金線(問い↔答え)**: addresses が過去の open_questions ID を参照
