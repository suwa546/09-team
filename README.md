# Inspect One

中古スマートフォンの検査・査定を支援する Next.js アプリです。端末情報と画像を一元管理し、傷候補の検出、グレード判定、IMEI・ネットワーク利用制限の確認までを行えます。

## セットアップ

Node.js 22.12 以降を使用してください。

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run db:seed
npm run dev
```

Windows PowerShell では `cp .env.example .env` の代わりに `Copy-Item .env.example .env` を使用できます。起動後、[http://localhost:3000](http://localhost:3000) を開いてください。

デモアカウント:

- メールアドレス: `staff@example.com`
- パスワード: `staff1234`

本番環境では `AUTH_SECRET` を十分に長いランダム値へ必ず変更してください。

## 実装済み機能

- Credentials 認証と STAFF / ADMIN ロール
- 検品の登録、一覧、検索、日付・状態・グレード絞り込み
- JPEG / PNG / WebP 画像の複数アングル登録
- Sharp と Sobel フィルタによる傷候補検出
- 閾値ベースの A / B / C グレード自動判定
- IMEI Luhn チェックとネットワーク利用制限モック
- 検品ステータス・メモ更新
- 件数、グレード分布、平均処理時間のダッシュボード

画像は開発用として `public/uploads` に保存します。本番では `saveInspectionImage` の実装を S3 互換ストレージへ差し替えてください。

## 品質チェック

```bash
npm run lint
npm run test
npm run build
```

主な仕様は [docs/SPEC.md](docs/SPEC.md) を参照してください。
