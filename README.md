# QJ Cosmos

> 上下二つの宇宙(外側=天体 / 内側=自分のジャーナル)を、同じ時間軸で連動させる可視化ツール。

## このアプリでできること

- **上画面**: 太陽・地球・月の3D空間。二十四節気・月相・潮汐がリアルタイムに動く
- **下画面**: ローカルの `.md` ファイル(Obsidianのノートなど)を**星として宇宙に配置**し、関連性を線で繋ぐ
- 上の時間スライダーを動かすと、下のノートで**同じ時期に書かれた星が光る** → 思考の軌跡が宇宙に現れる

## 使い方

1. ブラウザで開く(Chrome / Edge 推奨)
2. 下画面左上の「**Vault読み込み**」ボタンを押す
3. `.md` ファイルが入ったフォルダを選択(Obsidianのvault、または任意のmarkdownフォルダ)
4. ブラウザがアクセス許可を求めるので「許可」
5. ノートが**星として宇宙に浮かぶ**

### 必要なファイル形式

- ファイル名が **`YYYYMMDD`** で始まる `.md`(例: `20260514_journal.md`)
- または frontmatter に `date: YYYY-MM-DD` がある `.md`

日付さえあれば、その日の二十四節気・月相・月齢が自動計算されます。

### 自動で見えるもの(デモ)

- 連続日のつながり線(時系列)
- 同月相のつながり線(月のリズム)
- 節気→ノートのつながり線(太陽系の構造)

### 高度な使い方

frontmatter に以下を追記すると、より豊かな関連性の線が現れます:

```yaml
themes: [創造, 喪失への怖れ, 父との時間]
dream_motifs: [父, 旅, 少女]
open_questions:
  - id: q-20260211-1
    text: 人間らしさは未来に何を残すか?
addresses:
  - q-20260108-2
```

これらは、Claude Codeなどで自動解析して追記する想定です。詳細は `ANALYSIS_PROMPT.md` を参照。

## 配置モード

| モード | 説明 |
|--|--|
| **静的** | 24節気の太陽の周りにノートが固定配置 |
| **ハイブリッド** | 節気アンカー + 関連性引力で動的に。**最も詩的** |
| **連想** | アンカー解除、関連性のみで自己組織化(Obsidianグラフ風) |
| **脳構造** | 本能/感性/知性の3層に振り分け |

## 操作

- **ドラッグ**: カメラ回転
- **ホイール**: ズーム
- **星にカーソル**: 情報パネル表示
- **星をクリック**: ピン留め + カメラズームイン
- **右上のレジェンド**: 線種をクリックでON/OFF
- **時間スライダー**: ▶ で自動再生(速度切替可)

## 技術スタック

- React 18 + Vite + TypeScript
- Three.js + React Three Fiber + drei
- astronomy-engine(NASA/JPL精度の天体計算)
- Zustand(状態管理)
- js-yaml(frontmatter解析)
- File System Access API(Chrome/Edge専用)

## ローカル開発

```bash
npm install
npm run dev
# http://localhost:5173/ で開く
```

## デプロイ(Vercel)

```bash
# Vercel CLI を使う場合
npm i -g vercel
vercel

# または GitHub にプッシュして Vercel と連携(自動ビルド)
```

ビルドは `npm run build` → `dist/` に静的ファイルが生成。バックエンド不要(完全クライアントサイド)。

## プライバシー

- すべてブラウザ内で処理されます
- ノートの中身は**サーバーに送信されません**
- File System Access API でローカルファイルを読むのみ

## 制約

- File System Access API は **Chrome / Edge のみ**(Firefox 未対応)
- HTTPS 環境必須(localhost を除く)

## ライセンス

MIT License (see LICENSE)

## 関連ドキュメント

- `SPEC.md` — 詳細仕様(Obsidian vault に保存)
- `ANALYSIS_PROMPT.md` — LLM解析の仕様(Pass 1 / Pass 2)
