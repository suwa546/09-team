# スマートフォン検品システム

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

## USB端末情報の自動取得

Webアプリとは別のPowerShellを開き、ローカル端末ブリッジを起動します。

```powershell
cd "C:\Users\hikar\OneDrive\デスクトップ\09-team"
npm run bridge
```

ブリッジは `127.0.0.1:4123` だけで待ち受けます。新規検品画面を開くとUSB端末を自動検出し、取得できた項目だけを入力欄へ反映します。ブリッジや端末が利用できない場合も、すべての項目を従来どおり手入力できます。

Androidを使う場合:

1. [Android SDK Platform-Tools](https://developer.android.com/tools/releases/platform-tools) を検品PCへインストールします。
2. `adb` をPATHへ追加するか、環境変数 `ADB_PATH` に実行ファイルのパスを指定します。
3. Android端末で開発者向けオプションとUSBデバッグを有効にします。
4. USB接続後、端末に表示されるデバッグ許可を承認します。
5. `adb devices` で状態が `device` になることを確認します。

iPhoneを使う場合:

1. `libimobiledevice` の `idevice_id` と `ideviceinfo` をインストールし、PATHへ追加します。
2. USB接続後、iPhone側で「このコンピュータを信頼」を許可します。
3. 必要なら環境変数 `IDEVICE_ID_PATH` と `IDEVICEINFO_PATH` に実行ファイルのパスを指定します。

OSや端末のプライバシー制限によりIMEI、バッテリー状態、充電回数を取得できない場合があります。その場合、該当欄は空欄のまま手入力してください。

デモアカウント:

- メールアドレス: `staff@example.com`
- パスワード: `staff1234`

本番環境では `AUTH_SECRET` を十分に長いランダム値へ必ず変更してください。

## 実装済み機能

- Credentials 認証と STAFF / ADMIN ロール
- ADB / libimobiledeviceを利用したUSB端末情報の自動入力
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
