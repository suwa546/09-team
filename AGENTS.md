<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


---

# プロジェクト固有の指示（中古スマホ検査・査定システム）

作業を始める前に必ず `docs/SPEC.md` を読み込み、そこに書かれた前提・スコープ・仕様に従ってください。
またdocs/PHASE2_UPDATES.mdも必ず参照すること

## プロジェクト概要

中古スマートフォンの検査・査定を支援するWebシステム（想定クライアント: 株式会社Belong「にこスマ」）。
詳細な機能仕様・画面設計・DB設計・API設計・コアロジックはすべて `docs/SPEC.md` に記載されています。

## セットアップ・実行コマンド

- Lint: `npm run lint`
- テスト: `npm run test`
- Prismaマイグレーション: `npx prisma migrate dev`

## コーディング規約

- コアロジック（Luhnチェック、グレード判定、画像解析、NW制限照会）はそれぞれ独立した関数として実装する
- コミットメッセージは `feat:`, `fix:`, `docs:`, `test:`, `chore:` などのプレフィックスを付ける
- 1つのPull Requestは1機能・1トピックに絞る
- 判定ロジックの閾値はハードコードせず、1箇所の定数ファイルにまとめる

## 実装の進め方

1. `docs/SPEC.md` の「12. 開発フェーズ」の順番(Week1〜Week7)に沿って実装する
2. 各フェーズが完了したらユニットテストを書き、`npm run test`が通ることを確認してから次に進む
3. 迷ったら`docs/SPEC.md`の「2. 前提・スコープ」に立ち返る
