# Implementation Plan

> CCSDD / SDD 前提：**contracts-first**（bff → api → shared）を最優先し、境界違反を guard で止める。
> UI は最後。v0 は **Phase 1（統制テスト）→ Phase 2（本実装）** の二段階で扱う。

---

## 0. Design Completeness Gate（Blocking）

> Implementation MUST NOT start until all items below are checked.
> These checks are used to prevent "empty design sections" from being silently interpreted by implementers/AI.

- [x] 0.1 Designの「BFF Specification（apps/bff）」が埋まっている
  - BFF endpoints（UIが叩く）が記載されている
  - Request/Response DTO（packages/contracts/src/bff）が列挙されている
  - **Paging/Sorting正規化（必須）が明記されている**
  - 変換（api DTO → bff DTO）の方針が記載されている
  - エラー整形方針（**contracts/bff/errors** に準拠）が記載されている
  - tenant_id/user_id の取り回し（解決・伝搬ルール）が記載されている

- [x] 0.2 Designの「Service Specification（Domain / apps/api）」が埋まっている
  - Usecase（Create/Update/Inactivate等）が列挙されている
  - 主要ビジネスルールの所在（Domainに置く／置かない）が記載されている
  - トランザクション境界が記載されている
  - 監査ログ記録ポイントが記載されている

- [x] 0.3 Designの「Repository Specification（apps/api）」が埋まっている
  - 取得・更新メソッド一覧が記載されている（tenant_id必須）
  - where句二重ガードの方針（tenant_id常時指定）が記載されている
  - RLS前提（set_config前提）が記載されている

- [x] 0.4 Designの「Contracts Summary（This Feature）」が埋まっている
  - packages/contracts/src/bff 側の追加・変更DTOが列挙されている
  - packages/contracts/src/api 側の追加・変更DTOが列挙されている
  - **Enum / Error の配置ルールが明記されている**
  - 「UIは packages/contracts/src/api を参照しない」ルールが明記されている

- [x] 0.5 Requirements Traceability（必要な場合）が更新されている
  - 主要Requirementが、BFF/API/Repo/Flows等の設計要素に紐づいている

- [ ] 0.6 v0生成物の受入・移植ルールが確認されている
  - v0生成物は必ず `apps/web/_v0_drop/<context>/<feature>/src` に一次格納されている
  - v0出力はそのまま `apps/web/src` に配置されていない

- [ ] 0.7 Structure / Boundary Guard がパスしている
  - `npx tsx scripts/structure-guards.ts` が成功している

---

## 1. Scaffold / Structure Setup

- [ ] 1.1 Feature骨格生成
  - scaffold-feature スクリプトで骨格を生成
  - apps/web/src/features/master-data/category-segment が作成されること
  - apps/bff/src/modules/master-data/category-segment が作成されること
  - apps/api/src/modules/master-data/category-segment が作成されること
  - apps/web/_v0_drop/master-data/category-segment が作成されること
  - _Requirements: 全般_

---

## 2. Contracts（bff → api → errors）

- [x] 2.1 (P) BFF Contracts の定義
  - CategoryAxis の一覧・詳細・登録・更新用 DTO を定義
  - Segment の一覧・詳細・登録・更新用 DTO を定義
  - SegmentAssignment の一覧・Upsert・削除用 DTO を定義
  - エンティティ別セグメント取得用 DTO を定義
  - ListResponse に page/pageSize/total/totalPages を含める
  - 階層ツリー表示用の viewMode パラメータを含める
  - _Requirements: 1.1, 2.1, 3.1, 4.6, 5.1, 6.1_

- [x] 2.2 (P) API Contracts の定義
  - CategoryAxis の一覧・詳細・登録・更新用 API DTO を定義
  - Segment の一覧・詳細・登録・更新用 API DTO を定義
  - SegmentAssignment の一覧・Upsert・削除用 API DTO を定義
  - TargetEntityKind 列挙型を定義（ITEM/PARTY/SUPPLIER_SITE）
  - API側は offset/limit 形式で定義
  - _Requirements: 1.1, 2.1, 3.1, 4.6, 5.1, 6.1_

- [x] 2.3 (P) Error Contracts の定義
  - CategorySegmentErrorCode を定義
  - カテゴリ軸関連エラー（AXIS_CODE_DUPLICATE, HIERARCHY_NOT_SUPPORTED 等）
  - セグメント関連エラー（SEGMENT_CODE_DUPLICATE, CIRCULAR_REFERENCE, HIERARCHY_DEPTH_EXCEEDED 等）
  - 割当関連エラー（INVALID_ENTITY_KIND, SEGMENT_NOT_IN_AXIS, ENTITY_NOT_FOUND 等）
  - 共通エラー（INVALID_CODE_LENGTH, CONCURRENT_UPDATE）
  - HTTP Status Code マッピングとデフォルトメッセージを定義
  - errors/index.ts に export を追加
  - _Requirements: 1.3, 1.5, 1.7, 3.3, 3.5, 4.4, 5.3, 5.4_

---

## 3. Database / Migration

- [x] 3.1 Prisma スキーマ定義
  - CategoryAxis モデルを定義（tenant_id, axis_code, axis_name, target_entity_kind, supports_hierarchy, display_order, description, is_active, version, 監査列）
  - Segment モデルを定義（tenant_id, category_axis_id, segment_code, segment_name, parent_segment_id, hierarchy_level, hierarchy_path, display_order, description, is_active, version, 監査列）
  - SegmentAssignment モデルを定義（tenant_id, entity_kind, entity_id, category_axis_id, segment_id, is_active, version, 監査列）
  - CategoryAxis と Segment のリレーションを定義
  - Segment の自己参照リレーション（親子階層）を定義
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 3.2 インデックスと制約の定義
  - CategoryAxis: UNIQUE(tenant_id, axis_code) を定義
  - CategoryAxis: supports_hierarchy と target_entity_kind の CHECK 制約（アプリ層で担保）
  - Segment: UNIQUE(tenant_id, category_axis_id, segment_code) を定義
  - Segment: hierarchy_path の部分一致検索用インデックスを定義
  - SegmentAssignment: UNIQUE(tenant_id, entity_kind, entity_id, category_axis_id) を定義（1軸1値）
  - tenant_id + is_active 等の検索用インデックスを定義
  - _Requirements: 1.2, 3.2, 5.2, 8.6, 8.7, 8.8_

- [ ] 3.3 Migration の実行
  - Prisma migrate を実行してテーブルを作成
  - RLS ポリシーを設定（tenant_id による分離）
  - Migration が正常に適用されることを確認
  - _Requirements: 8.6, 8.7, 8.8_

---

## 4. Domain API - 共通ユーティリティ

- [x] 4.1 normalizeCode ユーティリティの実装
  - 前後空白の除去（trim）
  - 全角から半角への変換
  - 英字の大文字統一
  - 最大10桁の長さチェック
  - 英数字のみのパターンチェック
  - 違反時に INVALID_CODE_LENGTH エラーを throw
  - _Requirements: 1.3, 3.3_

- [x] 4.2 EntityValidatorService の実装
  - entity_kind に応じたエンティティ存在検証を提供
  - PARTY の場合は PartyRepository を呼び出し
  - SUPPLIER_SITE の場合は SupplierSiteRepository を呼び出し
  - ITEM の場合は将来実装（一時的にエラー）
  - 存在しない場合は ENTITY_NOT_FOUND エラーを throw
  - apps/api/src/common/validators に配置
  - _Requirements: 5.6_

---

## 5. Domain API - CategoryAxis

- [x] 5.1 CategoryAxisRepository の実装
  - findById: ID によるカテゴリ軸取得（tenant_id 必須）
  - findByCode: 軸コードによる検索（重複チェック用）
  - list: 一覧取得（キーワード検索、対象マスタ種別フィルタ、有効フラグフィルタ、ページング、ソート）
  - create: カテゴリ軸の新規作成（監査列設定）
  - update: カテゴリ軸の更新（楽観ロック対応）
  - 全メソッドで tenant_id を WHERE 句に含める（double-guard）
  - _Requirements: 1.1, 1.6, 2.1, 2.2, 2.3, 2.4, 8.1, 8.6_

- [x] 5.2 CategoryAxisService の実装
  - 一覧取得（表示順昇順、有効フラグによるデフォルトフィルタ）
  - 詳細取得（存在チェック → CATEGORY_AXIS_NOT_FOUND）
  - 新規登録（軸コード正規化、重複チェック、supports_hierarchy と target_entity_kind の整合性検証）
  - 更新（軸コード・対象マスタ種別の変更禁止、名称・説明・表示順の更新、楽観ロック）
  - 無効化（is_active を false に設定する論理削除）
  - 監査列（created_by/updated_by）への user_id 設定
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 8.1_

- [x] 5.3 CategoryAxisController の実装
  - GET /category-axes: 一覧取得エンドポイント
  - GET /category-axes/:id: 詳細取得エンドポイント
  - POST /category-axes: 新規登録エンドポイント
  - PUT /category-axes/:id: 更新エンドポイント
  - tenant_id / user_id を Header から取得
  - エラーを適切な HTTP ステータスで返却
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

---

## 6. Domain API - Segment

- [x] 6.1 SegmentRepository の実装
  - findById: ID によるセグメント取得
  - findByCode: カテゴリ軸内でのセグメントコード検索
  - list: フラット形式での一覧取得（ページング、ソート、フィルタ）
  - listTree: 階層ツリー形式での一覧取得
  - create: セグメントの新規作成（監査列設定）
  - update: セグメントの更新（楽観ロック対応）
  - findAncestors: 指定セグメントの祖先を取得（循環参照検出用）
  - findDescendantIds: 指定セグメントの子孫 ID を取得（階層フィルタ用、hierarchy_path LIKE 検索）
  - _Requirements: 3.1, 4.1, 4.6, 7.3, 8.2, 8.7_

- [x] 6.2 SegmentService の実装
  - 一覧取得（フラット/ツリー形式の切り替え対応）
  - 詳細取得（存在チェック → SEGMENT_NOT_FOUND）
  - 新規登録:
    - セグメントコード正規化・重複チェック
    - 親セグメント指定時の検証（存在チェック、同一軸チェック、循環参照チェック、階層深度チェック）
    - hierarchy_level / hierarchy_path の自動計算
  - 更新（セグメントコード変更禁止、名称・説明・表示順・親セグメントの更新、楽観ロック）
  - 無効化（is_active を false に設定する論理削除）
  - 監査列への user_id 設定
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 8.2_

- [x] 6.3 SegmentController の実装
  - GET /segments: 一覧取得エンドポイント（categoryAxisId 必須、viewMode=tree 対応）
  - GET /segments/:id: 詳細取得エンドポイント
  - POST /segments: 新規登録エンドポイント
  - PUT /segments/:id: 更新エンドポイント
  - tenant_id / user_id を Header から取得
  - _Requirements: 3.1, 3.4, 3.6, 4.1, 4.6_

---

## 7. Domain API - SegmentAssignment

- [x] 7.1 SegmentAssignmentRepository の実装
  - findById: ID による割当取得
  - findByEntityAndAxis: エンティティ × カテゴリ軸による検索（1軸1値 Upsert 用）
  - listByEntity: エンティティに対する全割当を取得
  - listBySegment: セグメントに対する全割当を取得
  - listBySegmentWithDescendants: 子孫セグメントを含む割当を取得（階層フィルタ用）
  - upsert: 割当の登録または更新（1軸1値）
  - delete: 割当の論理削除（is_active = false）
  - _Requirements: 5.1, 5.2, 5.5, 6.1, 7.1, 7.2, 7.3, 8.3, 8.8_

- [x] 7.2 SegmentAssignmentService の実装
  - エンティティ別割当一覧取得（カテゴリ軸ごとに整理して返却）
  - Upsert:
    - entity_kind と CategoryAxis.target_entity_kind の一致検証
    - segment.category_axis_id と categoryAxisId の一致検証
    - EntityValidatorService によるエンティティ存在検証
    - 既存割当の検索 → 存在すれば更新、なければ新規作成
  - 割当解除（論理削除）
  - セグメントによるフィルタリング（階層セグメント選択時は子孫も含める）
  - 監査列への user_id 設定
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 8.3_

- [x] 7.3 SegmentAssignmentController の実装
  - GET /assignments: 割当一覧取得エンドポイント（entityKind + entityId 必須）
  - POST /assignments: 割当 Upsert エンドポイント
  - DELETE /assignments/:id: 割当解除エンドポイント
  - GET /entities/:entityKind/:entityId/segments: エンティティ別セグメント取得エンドポイント
  - _Requirements: 5.1, 5.5, 6.1_

---

## 8. BFF

- [x] 8.1 BFF Mapper の実装
  - CategoryAxis の API DTO → BFF DTO 変換（構造同一のため実質パススルー）
  - Segment の API DTO → BFF DTO 変換
  - SegmentAssignment の API DTO → BFF DTO 変換
  - ListResponse に page/pageSize/totalPages を追加
  - _Requirements: 1.1, 3.1, 5.1, 6.1_

- [x] 8.2 BFF Service の実装
  - Paging 正規化（page/pageSize → offset/limit 変換）
  - デフォルト値設定（page=1, pageSize=50, sortBy=displayOrder, sortOrder=asc）
  - pageSize 上限クランプ（≤200）
  - sortBy ホワイトリスト検証
  - keyword 正規化（trim、空→undefined）
  - Domain API クライアント経由での API 呼び出し
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 8.3 BFF Controller の実装
  - カテゴリ軸の CRUD エンドポイント
  - セグメントの CRUD エンドポイント
  - セグメント割当の Upsert / 解除 / 取得エンドポイント
  - エンティティ別セグメント取得エンドポイント
  - Pass-through Error Policy（Domain API エラーをそのまま返却）
  - tenant_id / user_id を Clerk トークンから解決
  - _Requirements: 1.1, 2.1, 3.1, 4.6, 5.1, 6.1_

---

## 9. Domain API Module 統合

- [x] 9.1 CategorySegmentModule の作成
  - CategoryAxisController, CategoryAxisService, CategoryAxisRepository を登録
  - SegmentController, SegmentService, SegmentRepository を登録
  - SegmentAssignmentController, SegmentAssignmentService, SegmentAssignmentRepository を登録
  - EntityValidatorService を共通モジュールからインポート
  - AppModule に CategorySegmentModule を登録
  - _Requirements: 全般_

- [x] 9.2 BFF Module 統合
  - BFF Controller と Service を登録
  - Domain API クライアントを設定
  - AppModule に CategorySegmentBffModule を登録
  - _Requirements: 全般_

---

## 10. UI - Phase 1（v0 統制テスト）

- [x] 10.1 MockBffClient の実装
  - カテゴリ軸の一覧・詳細・登録・更新のモック実装
  - セグメントの一覧・詳細・登録・更新のモック実装
  - 階層ツリー形式のモックデータ
  - セグメント割当の Upsert / 解除 / 取得のモック実装
  - エラーケースのモック（重複、循環参照、階層深度超過）
  - _Requirements: 1.1, 3.1, 4.6, 5.1, 6.1_

- [ ] 10.2 カテゴリ軸管理画面の実装
  - カテゴリ軸一覧画面（検索・フィルタ・ページング）
  - カテゴリ軸登録ダイアログ（軸コード、軸名称、対象マスタ種別、階層有無）
  - カテゴリ軸編集ダイアログ（名称・説明・表示順のみ変更可）
  - 無効化確認ダイアログ
  - エラー表示（重複エラー、階層非対応エラー）
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.1, 2.2, 2.3, 2.4_

- [ ] 10.3 セグメント管理画面の実装
  - セグメント一覧画面（フラット表示 / 階層ツリー表示の切り替え）
  - セグメント登録ダイアログ（コード、名称、親セグメント選択）
  - 親セグメント選択 UI（同一軸内のセグメントのみ選択可、階層有効時のみ表示）
  - セグメント編集ダイアログ（名称・説明・親セグメント・表示順の変更）
  - エラー表示（重複エラー、循環参照エラー、階層深度超過エラー）
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 10.4 セグメント割当 UI の実装
  - エンティティ詳細画面内のセグメント表示セクション
  - カテゴリ軸ごとのセグメント表示（軸名称 + セグメント名称）
  - セグメント追加/変更ダイアログ（対象マスタ種別に対応する軸のみ表示）
  - セグメント解除機能
  - 有効な軸・有効なセグメントのみ選択可能
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4_

---

## 11. UI - Phase 2（本実装）

- [ ] 11.1 HttpBffClient の実装
  - MockBffClient と同一インターフェースで実 BFF 接続
  - API エンドポイントへの fetch 実装
  - エラーハンドリング（Pass-through エラーの表示）
  - _Requirements: 全般_

- [ ] 11.2 BffClient 差し替えと統合テスト
  - MockBffClient から HttpBffClient への切り替え
  - 実 BFF 接続での動作確認
  - カテゴリ軸 CRUD の動作確認
  - セグメント CRUD（階層含む）の動作確認
  - セグメント割当 Upsert / 解除の動作確認
  - _Requirements: 全般_

- [ ] 11.3 v0 Drop から features への移植
  - _v0_drop から apps/web/src/features/master-data/category-segment へ移植
  - 境界ガードの確認（UI は BFF のみ呼び出し、api contracts 参照なし）
  - structure-guards スクリプトの実行と確認
  - _Requirements: 全般_

---

## 12. テスト

- [ ] 12.1 (P) Domain API ユニットテスト
  - normalizeCode のテスト（正規化パターン、エラーケース）
  - CategoryAxisService のテスト（CRUD、バリデーション、エラー）
  - SegmentService のテスト（CRUD、階層計算、循環参照検出、深度制約）
  - SegmentAssignmentService のテスト（Upsert、entity_kind 検証、エンティティ存在検証）
  - _Requirements: 1.3, 1.5, 1.7, 3.3, 3.5, 4.4, 4.5, 5.3, 5.4, 5.6_

- [ ] 12.2 (P) Integration テスト
  - カテゴリ軸 → セグメント → 割当の一連フロー
  - 階層セグメント作成と hierarchy_path 検証
  - 1軸1値 Upsert の動作確認
  - 楽観ロックによる競合検出
  - 階層フィルタリング（親選択時に子孫を含める）
  - _Requirements: 4.5, 5.2, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3_

---

## Requirements Coverage

| Requirement | Tasks |
| ----------- | ----- |
| 1.1-1.9 | 2.1, 2.2, 2.3, 5.1, 5.2, 5.3, 8.3, 10.2 |
| 2.1-2.4 | 2.1, 5.1, 5.2, 8.2, 10.2 |
| 3.1-3.7 | 2.1, 2.2, 2.3, 6.1, 6.2, 6.3, 8.3, 10.3 |
| 4.1-4.6 | 2.1, 6.1, 6.2, 6.3, 10.3, 12.1, 12.2 |
| 5.1-5.6 | 2.1, 2.2, 2.3, 4.2, 7.1, 7.2, 7.3, 8.3, 10.4, 12.1 |
| 6.1-6.4 | 2.1, 7.2, 7.3, 8.3, 10.4 |
| 7.1-7.3 | 7.1, 7.2, 12.2 |
| 8.1-8.8 | 3.1, 3.2, 3.3, 5.1, 5.2, 6.1, 6.2, 7.1, 7.2 |
