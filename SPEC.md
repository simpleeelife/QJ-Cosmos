# QJ Cosmos — 仕様

> 上下二つの宇宙(外側=天体 / 内側=ジャーナル)を、同じ時間軸で連動させる可視化ツール。

詳細仕様は本ファイルでなく、各ソースファイルのコメント・型定義・README/ANALYSIS_PROMPT を参照。

## アーキテクチャ概要

```
┌──────────────────────────────────────┐
│ 上: リアル宇宙ビュー(物理)         │
│   Earth/Moon/Sun(astronomy-engine) │
│   月相・二十四節気・潮汐             │
│   時間スライダー + 再生              │
├──────────────────────────────────────┤
│ 下: ジャーナル宇宙ビュー(意味)     │
│   .mdファイル → 星                  │
│   関連性の線(5+1種類)              │
│   配置モード(静的/ハイブリッド/連想/脳構造) │
└──────────────────────────────────────┘
   ↕ 時間軸で連動
```

## ディレクトリ構造

```
src/
  App.tsx                      # ルート
  store/                       # Zustand状態管理
    timeStore.ts               # 時間+視点+再生
    notesStore.ts              # ノート一覧
    uiStore.ts                 # ホバー/ピン/モード/線可視性
  hooks/
    usePlaybackDriver.ts
  astro/
    ephemeris.ts               # 天体計算ラッパー(astronomy-engine)
  upper/                       # 上画面 (リアル宇宙)
    UpperCosmos.tsx, Sun, Earth, Moon
    SekkiRing, OrbitRing
    CameraController
  lower/                       # 下画面 (ジャーナル宇宙)
    LowerCosmos.tsx
    NoteStar, SekkiSun, ConnectionLines, SekkiAnchorLines
    CameraFollower, PhysicsTicker
    notesLoader.ts             # vault読み込み + frontmatter解析
    sekkiData.ts               # 24節気の定数
    brainShape.ts              # 節気の脳形3D配置
    brainLayer.ts              # 本能/感性/知性の3層分類
    placement.ts               # 静的配置の補助計算
    connections.ts             # エッジ生成ロジック
    physics.ts                 # 物理シミュレーション
  ui/
    Hud, TimeSlider, ViewSelector
    VaultButton, ConnectionLegend, LayoutSelector
    NoteInfoPanel, LowerEmptyState
```

## 配置モード

| モード | 説明 |
|--|--|
| 静的 | 24節気をfibonacci螺旋で脳形に固定。ノートはその節気の太陽の周り |
| ハイブリッド | 節気アンカー + 関連性の引力で動的配置 |
| 連想 | アンカー解除、関連性のみで自己組織化(Obsidianグラフ風) |
| 脳構造 | 本能/感性/知性の3層に振り分け |

## 関連性の線(エッジ)

| 種類 | 色 | 条件 |
|--|--|--|
| 連続日(temporal) | 橙 | 日付±3日のチェーン |
| 同月相(lunar) | 青 | 同月相のチェーン |
| 同テーマ(theme) | 緑 | themes 2個以上一致 |
| 同夢モチーフ(dream) | 紫 | dream_motifs 1個以上一致 |
| 問い↔答え(question) | 金 | addresses が過去の open_questions ID 参照 |
| 節気→ノート(sekkiAnchor) | 節気色 | 各ノート→自分の節気の太陽 |

## 物理シミュレーション

毎フレーム(60fps):
- 全ペア間の斥力
- エッジのバネ引力(種別ごとに自然長と剛性)
- アンカー引力(hybrid/brain) または 中心引力(連想)
- 速度減衰 + クランプ

## frontmatter の活用

```yaml
date: YYYY-MM-DD                # 必須(またはファイル名 YYYYMMDD)
solar_term: ...                 # 任意(なければ日付から自動計算)
moon_phase: ...                 # 任意(なければ自動計算)
moon_age: ...                   # 任意(なければ自動計算)

# LLM解析で追記すると、追加の線が現れる(ANALYSIS_PROMPT.md参照)
themes: [...]
dream_motifs: [...]
open_questions:
  - { id: q-YYYYMMDD-N, text: ... }
addresses: [q-YYYYMMDD-N, ...]
```

## 関連ドキュメント

- `README.md` — ユーザー向け使い方
- `ANALYSIS_PROMPT.md` — LLM解析の仕様(任意)
- `DEPLOY.md` — Vercelデプロイ手順
