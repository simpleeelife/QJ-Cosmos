# デプロイ手順 (Vercel)

## 前提

- ビルド済み: `npm run build` で `dist/` が生成される(Vite静的ビルド)
- バックエンド不要: 完全クライアントサイドアプリ

## 方法A: Vercel CLI(最速)

```bash
# 1. Vercel CLI インストール(初回のみ)
npm i -g vercel

# 2. プロジェクトディレクトリで
cd F:/1_WORK/app/qj-cosmos
vercel

# 3. プロンプトに従う:
#   - Set up and deploy? → Y
#   - Which scope? → 自分のアカウント
#   - Link to existing project? → N
#   - Project name? → qj-cosmos
#   - Directory? → ./
#   - Override settings? → N (Vite を自動検出)

# 4. プレビューURLが表示される
# 5. 本番デプロイ:
vercel --prod
```

## 方法B: GitHub + Vercel 連携(継続的デプロイ)

```bash
# 1. GitHub に push
git init
git add .
git commit -m "QJ Cosmos demo"
git remote add origin https://github.com/USERNAME/qj-cosmos.git
git push -u origin main

# 2. Vercel ダッシュボードで:
#   - "New Project" → GitHubリポジトリを選択
#   - Framework Preset: Vite (自動検出)
#   - そのまま Deploy
```

以降、git push の度に自動デプロイされる。

## カスタムドメイン

Vercel ダッシュボード → Project → Settings → Domains で:
- `cosmos.q-avatar.jp` などを追加
- DNS設定(CNAME を Vercel に向ける)
- HTTPS 自動

## File System Access API の HTTPS要件

- File System Access API は **HTTPS環境必須**(localhost除く)
- Vercel は自動でHTTPS提供 ✓

## ブラウザ対応

| ブラウザ | 動作 |
|--|--|
| Chrome 86+ | ✅ |
| Edge 86+ | ✅ |
| Firefox | ❌(File System Access API 未対応) |
| Safari | ❌(同上) |

ユーザーには Chrome/Edge推奨を README で案内済み。

## 環境変数

なし(完全クライアントサイド)。

## ビルドサイズ

- index.html: 0.4 KB
- CSS: 7.6 KB
- JS: 1.1 MB(gzip 323 KB)— Three.js本体が大きい。許容範囲

## 静的ホスティングの代替案

Vercel以外でも動く(完全静的なため):
- Netlify: `netlify deploy --prod --dir=dist`
- Cloudflare Pages
- GitHub Pages
- 自前サーバ(nginx で `dist/` を配信)
