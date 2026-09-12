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

USB検出はWebアプリのAPIに統合されているため、別のブリッジプロセスは不要です。`npm run dev`でWebアプリを起動した検品PCに端末をUSB接続し、「新規検品登録」の「USB接続した端末情報を取得」ボタンを押します。取得できた項目はフォームに表示され、登録前に修正できます。取得できない項目は手入力できます。

> USB端末を検出するコマンドはWebアプリを実行しているPC上で動きます。そのため、検品画面は `localhost` のWebアプリから開いてください。

Androidを使う場合:

1. [Android SDK Platform-Tools](https://developer.android.com/tools/releases/platform-tools) を検品PCへインストールします。
2. `adb` をPATHへ追加するか、環境変数 `ADB_PATH` に実行ファイルのパスを指定します。
3. Android端末で開発者向けオプションとUSBデバッグを有効にします。
4. USB接続後、端末に表示されるデバッグ許可を承認します。
5. `adb devices` で状態が `device` になることを確認します。

iPhoneを使う場合:

1. `libimobiledevice` の `idevice_id`、`ideviceinfo`、`idevicediagnostics` をインストールし、PATHへ追加します。
2. USB接続後、iPhone側で「このコンピュータを信頼」を許可します。
3. 必要なら環境変数 `IDEVICE_ID_PATH`、`IDEVICEINFO_PATH`、`IDEVICEDIAGNOSTICS_PATH` に実行ファイルのパスを指定します。

OSや端末のプライバシー制限によりIMEI、バッテリー最大容量、充電回数を取得できない場合があります。バッテリー最大容量は、現在の充電残量ではなく、満充電容量と設計容量を取得できた場合だけ自動入力します。取得できない場合、該当欄は空欄のまま手入力してください。

## にこスマ参考買取価格の取得

次のコマンドで、設定した機種のA/B/Cグレード別参考買取価格を取得し、`PriceReference` テーブルへ履歴として保存します。

```bash
npm run scrape:prices
```

既定では iPhone 15 Pro、iPhone 14、Pixel 7 を対象にします。対象は `.env` の `PRICE_SCRAPE_URLS` にカンマ区切りで機種別買取ページを指定するか、コマンド引数で変更できます。

```bash
npm run scrape:prices -- https://www.nicosuma.com/sell/smartphone/iphone/iphone-15-pro
```

バッチは実行のたびに `robots.txt` を確認し、許可された公式商品ページだけを取得します。商品ページ間には最低2秒（既定3秒）の間隔を設け、1回20機種までに制限しています。同じURLの24時間以内のデータはDBキャッシュを利用します。検証などで明示的に再取得する場合だけ `--force` を付けてください。

```bash
npm run scrape:prices -- --force https://www.nicosuma.com/sell/smartphone/iphone/iphone-15-pro
```

価格とページ構造は変更される可能性があります。取得結果は参考値として扱い、サイトの利用条件とrobots.txtに変更がないか定期的に確認してください。

デモアカウント:

- メールアドレス: `staff@example.com`
- パスワード: `staff1234`

本番環境では `AUTH_SECRET` を十分に長いランダム値へ必ず変更してください。

## 実装済み機能

- Credentials 認証と STAFF / ADMIN ロール
- ADB / libimobiledeviceを利用したUSB端末情報の自動入力
- にこスマ公式ページからのグレード別参考買取価格バッチ
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
