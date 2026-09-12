中古スマートフォン検査・査定支援システム 開発仕様書（Codex実装用）

このドキュメントは、Codexがこのリポジトリで実装作業を行う際に参照する 詳細仕様書です。上から順にフェーズごとに実装を進めてください。不明点がある場合は、このドキュメントの 「前提・スコープ」に立ち返って判断してください。

1. プロジェクト概要
プロジェクト名: 中古スマートフォン検査・査定支援システム
想定クライアント: 株式会社Belong（中古スマホ買取・販売サービス「にこスマ」）
エンドユーザー: にこスマの検品担当スタッフ（将来的には利用顧客も一部利用）
課題: 中古スマートフォンの査定・検査（外観グレード判定、内部機能チェック、IMEI確認等）を すべて人手・目視で行っており、時間がかかる・担当者ごとに判定基準がぶれる・記録が手作業で ミスが起きやすい、という問題がある。
企画のゴール: 専用の検査機（ハードウェア）とAI画像解析を組み合わせて検査・査定を自動化し、 記録までを一気通貫で行う統合システムを提供する。
2. 前提・スコープ（重要）

大学の授業内課題として2名程度で実装するため、以下を前提とします。Codexはこの前提に従って 「実装可能な範囲」を作り込んでください。

対象は「クラウド／Webシステム側」のみ。実機の検査機（カメラ・照明ボックス・通信ケーブル等の ハードウェア）そのものは製作しません。ハードウェアから得られるはずのデータ（バッテリー状態・ 充電回数・IMEI等）は、①スタッフによる手入力、②ダミーのUSB取得APIをモックする、のどちらかで 代替します。
AI画像解析は「本格的なディープラーニングモデルの新規学習」までは行わず、画像処理（エッジ検出・ 輪郭抽出などのヒューリスティック）による疑似的な自動判定をMVP（最初に完成させる範囲）とします。 将来的にCNNベースのモデルに差し替えられるよう、インターフェースだけ分離しておいてください （詳細は8章）。
キャリアのネットワーク利用制限照会は外部の実APIに学生が接続するのは現実的でないため、 モック関数として実装し、後から本物のAPIに差し替えられる形にします。
上記の代替方針は発表時に「本来はハードウェア／実APIと連携する設計だが、開発期間の制約により ソフトウェア部分をモック・シミュレーションで実装した」と説明できるようにするためのものです。
3. 利用者（ロール）
ロール	説明
STAFF	検品担当スタッフ。検品の登録・実施・結果確認を行う主利用者
ADMIN	管理者。グレード判定の閾値設定やスタッフ管理を行う（MVPでは簡易実装でよい）
（発展）CUSTOMER	顧客向け事前スキャン機能の利用者。ログイン不要の簡易フォームのみ
4. 機能一覧
4.1 MVP（必須・最優先で実装する範囲）
スタッフのログイン／ログアウト（メール＋パスワード）
検品の新規登録（端末情報の入力：モデル名、ストレージ容量、IMEI、バッテリー状態、充電回数）
検品用画像のアップロード（複数枚・複数アングル：正面／背面／画面）
画像解析による傷候補の自動検出（エッジ・輪郭検出ベース）
検出結果にもとづくグレード（A/B/C）の自動判定
IMEIのLuhnアルゴリズムによる形式チェック
ネットワーク利用制限照会（モック実装）
検品結果の一覧・詳細・検索・フィルタ（グレード別、ステータス別、日付範囲）
ダッシュボード（検品件数、グレード分布、平均処理時間などの集計表示）
4.2 発展機能（余裕があれば実装する範囲）
顧客向け事前スキャン機能（ログイン不要、簡易グレード＋仮査定額の提示）
検品優先順位の自動設定（売上・需要データに応じた並び替え）
グレード判定ロジックの閾値を管理画面から変更できる機能
CSVエクスポート（検品結果一覧）
傷検出結果を元画像上にバウンディングボックスで可視化表示
5. システム構成
[ブラウザ (スタッフ)]
      │ HTTPS
      ▼
[Next.js アプリ (Webフロント + API Routes)]
      │
      ├─ 認証: NextAuth.js (Credentials Provider)
      ├─ DB: Prisma ORM → SQLite(開発) / PostgreSQL(本番想定)
      ├─ 画像保存: ローカルファイルシステム（開発）/ S3互換ストレージ(本番想定)
      └─ 画像解析モジュール: 疑似AI判定ロジック（8章）

将来的に実機の検査機と接続する場合は、検査機側から POST /api/inspections/:id/images と PATCH /api/inspections/:id（バッテリー状態等の反映） を呼び出す構成にすれば、そのまま流用できる設計にしてください。

6. 推奨技術スタック
分類	採用technology	補足
言語	TypeScript	フロント・バックエンド共通言語にして2人体制でも学習コストを抑える
フレームワーク	Next.js 14 (App Router)	1リポジトリでフロント＋APIが完結する
スタイリング	Tailwind CSS	見た目を素早く整えられる
DB	SQLite + Prisma ORM	開発時はファイルDBで環境構築が容易。本番はPostgreSQLへ切替可能
認証	NextAuth.js (Credentials Provider)	メール＋パスワードのシンプルな認証で十分
画像処理	sharp（Node.js）	リサイズ・グレースケール化・簡易エッジ検出に使用
テスト	Vitest（ユニット）／Playwright（余裕があれば）	
Lint/Format	ESLint + Prettier	
CI	GitHub Actions（任意）	push時にlint・buildを自動実行

この構成に強いこだわりが班にない場合は、この構成のまま実装を進めてください。

7. データベース設計（Prismaスキーマ想定）
prisma
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  role         Role     @default(STAFF)
  createdAt    DateTime @default(now())
  inspections  Inspection[]
}

enum Role {
  STAFF
  ADMIN
}

model Device {
  id         String   @id @default(cuid())
  model      String
  storageGb  Int
  imei       String
  createdAt  DateTime @default(now())
  inspections Inspection[]
}

model Inspection {
  id                 String    @id @default(cuid())
  device             Device    @relation(fields: [deviceId], references: [id])
  deviceId           String
  staff              User      @relation(fields: [staffId], references: [id])
  staffId            String
  status             Status    @default(PENDING)
  grade              Grade     @default(UNRATED)
  batteryHealth      Int?      // %
  chargeCycles       Int?
  imeiValid          Boolean?
  networkRestricted  NetworkStatus @default(UNKNOWN)
  notes              String?
  startedAt          DateTime  @default(now())
  completedAt        DateTime?
  images             InspectionImage[]
}

enum Status {
  PENDING
  IN_PROGRESS
  DONE
}

enum Grade {
  A
  B
  C
  UNRATED
}

enum NetworkStatus {
  OK
  RESTRICTED
  UNKNOWN
}

model InspectionImage {
  id               String     @id @default(cuid())
  inspection       Inspection @relation(fields: [inspectionId], references: [id])
  inspectionId     String
  angle            ImageAngle
  imageUrl         String
  detectedDefects  Json?      // [{ type, x, y, width, height, sizeMm, severity }]
  createdAt        DateTime   @default(now())
}

enum ImageAngle {
  FRONT
  BACK
  SCREEN
  OTHER
}
8. コアロジック仕様
8.1 IMEIのLuhnアルゴリズムチェック
ts
export function isValidImei(imei: string): boolean {
  const digits = imei.replace(/\D/g, "");
  if (digits.length !== 15) return false;

  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}
8.2 グレード判定ロジック（スライドの基準を数値化）

参考文献のグレード基準（Aグレード＝超美品、Bグレード＝美品、Cグレード＝良品）を以下のルールに 落とし込みます。判定は「検出された傷の個数・サイズ・種類」から算出します。

ts
type Defect = { type: "scratch" | "dent" | "crack"; sizeMm: number };

export function decideGrade(defects: Defect[]): "A" | "B" | "C" {
  const hasDentOrCrack = defects.some((d) => d.type === "dent" || d.type === "crack");
  const hasLargeScratch = defects.some((d) => d.sizeMm > 1);
  const smallScratchCount = defects.filter((d) => d.type === "scratch" && d.sizeMm <= 1).length;

  if (hasDentOrCrack || hasLargeScratch) return "C";
  if (defects.length === 0) return "A";
  if (smallScratchCount <= 5) return "B";
  return "C";
}

閾値（1mm, 5個など）は将来変更しやすいよう、定数として1箇所にまとめてください （例: src/lib/grading/thresholds.ts）。

8.3 画像解析モジュール（MVP実装方針）
アップロードされた画像を sharp でグレースケール化・リサイズする。
簡易エッジ検出（Sobelフィルタ等）で輪郭を抽出し、一定面積以上の領域を「傷候補」として バウンディングボックス（x, y, width, height）を記録する。
バウンディングボックスのサイズを画面上のmm換算（撮影距離が固定である前提で簡易換算）し、 Defect[] の配列を作る。
decideGrade() に渡してグレードを算出し、Inspection.grade を更新する。

この処理は src/lib/imageAnalysis/analyzeImage.ts のような1つの関数 （analyzeImage(imagePath: string): Promise<Defect[]>）に閉じ込め、実装を後から 本物のAI（CNNによる傷検出モデル等）に差し替えやすくしてください。

発展: 時間に余裕があれば、tensorflow.js の事前学習済み画像分類モデルを使い、 正常／傷ありの二値分類程度は学習・組み込みを検討してもよい（必須ではない）。

8.4 ネットワーク利用制限照会（モック）
ts
export async function checkNetworkRestriction(
  imei: string
): Promise<"OK" | "RESTRICTED" | "UNKNOWN"> {
  // TODO: 本番では実際のキャリア照会APIに差し替える
  // 開発中はIMEIの末尾の数字によって固定的に結果を返すダミー実装でよい
  const lastDigit = Number(imei.slice(-1));
  if (Number.isNaN(lastDigit)) return "UNKNOWN";
  return lastDigit % 5 === 0 ? "RESTRICTED" : "OK";
}
9. 画面一覧
パス	画面名	概要
/login	ログイン	メール＋パスワードでログイン
/dashboard	ダッシュボード	検品件数、グレード分布、平均処理時間などの集計表示
/inspections	検品一覧・検索	グレード／ステータス／日付でフィルタできる一覧
/inspections/new	新規検品登録	端末情報の入力フォーム＋画像アップロード
/inspections/[id]	検品詳細・結果	アップロード画像、検出された傷、グレード、IMEI／通信制限の結果、ステータス変更
/prescan（発展）	顧客向け事前スキャン	ログイン不要。写真から簡易グレード・仮査定額を表示
10. API設計
メソッド	パス	概要
POST	/api/auth/[...nextauth]	ログイン処理（NextAuth標準）
GET	/api/inspections	検品一覧取得（クエリでgrade/status/日付フィルタ）
POST	/api/inspections	新規検品登録（端末情報を作成）
GET	/api/inspections/:id	検品詳細取得
PATCH	/api/inspections/:id	ステータス・メモ等の更新
POST	/api/inspections/:id/images	画像アップロード
POST	/api/inspections/:id/analyze	画像解析実行→傷検出→グレード自動算出→DB反映
GET	/api/inspections/:id/imei-check	LuhnチェックとNW制限照会（モック）を実行し結果を返す
GET	/api/stats	ダッシュボード用の集計データ取得
POST	/api/prescan（発展）	顧客向け事前スキャンの簡易判定
11. 非機能要件
UIはすべて日本語。
レスポンシブ対応（PC想定がメイン、タブレットでも崩れない程度でよい）。
スタッフのみログイン可能（/prescan を除く）。ロールは STAFF / ADMIN の2種類のみで十分。
画像解析はMVPでは同期処理でよい（重い場合のみ非同期化を検討）。
パスワードは必ずハッシュ化して保存する（bcrypt等）。
12. 開発フェーズ（7週間想定・目安）
週	内容
Week1	環境構築、Prismaスキーマ定義、認証機能実装
Week2	検品新規登録画面・API実装
Week3	画像アップロード・保存機能
Week4	画像解析（傷検出）・グレード判定ロジック実装
Week5	IMEI Luhnチェック・ネットワーク制限照会（モック）実装
Week6	ダッシュボード・検索/履歴画面、UI仕上げ
Week7	結合テスト、バグ修正、発表資料・デモ準備

Codexはこのフェーズ順に沿って実装を進め、各フェーズの区切りでコミットを分けてください。

13. グレード判定基準（原典）

参考として、判定ロジックのもとになった基準を記載します。

Aグレード（超美品）: 見た目が新品に近く、目立つ傷がほぼない。コネクタ部分・背面ロゴにも 傷がない。
Bグレード（美品）: 1mm以下の小さな擦り傷が5つ以下程度ある。画面や背面ロゴに軽微な 使用感がある場合も含む。
Cグレード（良品）: 1mmを超える傷、凹み傷、画面の擦り傷のいずれかがある。
14. Codexへの実装指示（まとめ）
まず AGENTS.md と本ファイルを読み、前提・スコープ（2章）を理解する。
6章の技術スタックでNext.jsプロジェクトを初期化する。
7章のPrismaスキーマを作成し、マイグレーションを実行する。
12章のフェーズ順に、9章の画面・10章のAPIを実装する。
8章のロジック（Luhnチェック・グレード判定・画像解析・NW制限照会）は、それぞれ 独立した関数・モジュールとして実装し、ユニットテストを書く。
各フェーズ完了時に npm run lint と npm run test を通してからコミットする。