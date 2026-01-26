# Requirements Document

## Introduction

本ドキュメントは、ProcureERPにおける **カテゴリ・セグメントマスタ** 機能の要件を定義する。

カテゴリ・セグメントは、品目・取引先法人・仕入先拠点などのマスタデータを分類・グルーピング・分析するための柔軟な軸（Axis）と値（Segment）を管理する機能である。テナントごとに自由にカテゴリ軸を定義し、各マスタに対してセグメント値を割り当てることで、購買分析・仕入先評価・品目分類などの多角的な切り口を実現する。

---

## Requirements

### Requirement 1: カテゴリ軸（CategoryAxis）の管理

**Objective:** As a 調達部門マネージャー, I want 分析・分類のためのカテゴリ軸を自由に定義できる, so that 購買データを多角的に分析できる

#### Acceptance Criteria

1. When ユーザーがカテゴリ軸一覧画面を表示する, the CategoryAxis Service shall テナントに属する全カテゴリ軸を表示順（display_order昇順）で一覧表示する
2. When ユーザーがカテゴリ軸を新規登録する, the CategoryAxis Service shall 軸コード・軸名称・対象マスタ種別・階層有無を登録する
3. When ユーザーが重複する軸コードで登録を試みる, the CategoryAxis Service shall 「軸コードが既に使用されています」エラーを返す
4. When ユーザーが対象マスタ種別を選択する, the CategoryAxis Service shall ITEM / PARTY / SUPPLIER_SITE のいずれかを選択させる
5. If ユーザーが ITEM 以外の対象マスタ種別で階層有効を選択した場合, then the CategoryAxis Service shall 「階層機能は品目カテゴリのみ利用可能です」エラーを返す
6. When ユーザーがカテゴリ軸を更新する, the CategoryAxis Service shall 軸名称・説明・表示順を更新する
7. If 更新時にバージョン競合が発生した場合, then the CategoryAxis Service shall 「他のユーザーによって更新されています」エラーを返し再取得を促す
8. When ユーザーがカテゴリ軸を無効化する, the CategoryAxis Service shall is_active を false に設定し論理削除する
9. The CategoryAxis Service shall 軸コード・対象マスタ種別は登録後の変更を禁止する

---

### Requirement 2: カテゴリ軸の検索・フィルタ

**Objective:** As a 購買担当者, I want カテゴリ軸を条件で絞り込んで検索できる, so that 必要な軸を素早く見つけられる

#### Acceptance Criteria

1. When ユーザーが軸コードまたは軸名称で検索する, the CategoryAxis Service shall 部分一致でカテゴリ軸を検索する
2. When ユーザーが対象マスタ種別でフィルタする, the CategoryAxis Service shall 指定した種別（ITEM/PARTY/SUPPLIER_SITE）のカテゴリ軸のみ表示する
3. When ユーザーが有効フラグでフィルタする, the CategoryAxis Service shall 有効または無効のカテゴリ軸のみ表示する
4. The CategoryAxis Service shall デフォルトで有効なカテゴリ軸のみを表示する

---

### Requirement 3: セグメント（Segment）の管理

**Objective:** As a 調達部門マネージャー, I want カテゴリ軸に属するセグメント（値）を管理できる, so that 分類の選択肢を自由に定義できる

#### Acceptance Criteria

1. When ユーザーがセグメント一覧画面を表示する, the Segment Service shall 指定したカテゴリ軸に属するセグメントを表示順で一覧表示する
2. When ユーザーがセグメントを新規登録する, the Segment Service shall セグメントコード・セグメント名称・説明・表示順を登録する
3. When ユーザーが重複するセグメントコードで登録を試みる, the Segment Service shall 「同一カテゴリ軸内でセグメントコードが重複しています」エラーを返す
4. When ユーザーがセグメントを更新する, the Segment Service shall セグメント名称・説明・表示順を更新する
5. If 更新時にバージョン競合が発生した場合, then the Segment Service shall 「他のユーザーによって更新されています」エラーを返す
6. When ユーザーがセグメントを無効化する, the Segment Service shall is_active を false に設定し論理削除する
7. The Segment Service shall セグメントコードは登録後の変更を禁止する

---

### Requirement 4: セグメントの階層管理（品目カテゴリのみ）

**Objective:** As a 調達部門マネージャー, I want 品目カテゴリのセグメントを階層構造で管理できる, so that 大分類・中分類・小分類のような階層的な品目分類を表現できる

#### Acceptance Criteria

1. While カテゴリ軸の supports_hierarchy が true の場合, the Segment Service shall セグメントに親セグメントを設定できる
2. While カテゴリ軸の supports_hierarchy が false の場合, the Segment Service shall 親セグメントの設定を禁止する
3. When ユーザーが親セグメントを設定する, the Segment Service shall 同一カテゴリ軸内のセグメントのみを親として選択可能とする
4. If ユーザーが循環参照となる親セグメントを設定しようとした場合, then the Segment Service shall 「循環参照は設定できません」エラーを返す
5. When セグメントが登録・更新される, the Segment Service shall hierarchy_level と hierarchy_path を自動計算して設定する
6. The Segment Service shall 階層ツリー形式でセグメントを表示する機能を提供する

---

### Requirement 5: セグメント割当（SegmentAssignment）の管理

**Objective:** As a 購買担当者, I want 品目・取引先・仕入先拠点にセグメントを割り当てできる, so that 各マスタを分類・タグ付けできる

#### Acceptance Criteria

1. When ユーザーがエンティティにセグメントを割り当てる, the SegmentAssignment Service shall 対象エンティティ・カテゴリ軸・セグメントの組み合わせを登録する
2. When ユーザーが同一エンティティ×同一カテゴリ軸に重複して割当を試みる, the SegmentAssignment Service shall 既存の割当を更新する（1軸1値の制約）
3. If ユーザーがカテゴリ軸の対象マスタ種別と異なるエンティティ種別に割当を試みた場合, then the SegmentAssignment Service shall 「このカテゴリ軸は指定したマスタ種別には使用できません」エラーを返す
4. If ユーザーがカテゴリ軸に属さないセグメントを割当しようとした場合, then the SegmentAssignment Service shall 「セグメントがカテゴリ軸に属していません」エラーを返す
5. When ユーザーがセグメント割当を解除する, the SegmentAssignment Service shall 割当レコードを論理削除（is_active=false）する
6. The SegmentAssignment Service shall 割当先エンティティの存在検証をアプリ層で実施する

---

### Requirement 6: エンティティからのセグメント参照

**Objective:** As a 購買担当者, I want 品目・取引先・仕入先拠点の詳細画面から割り当てられたセグメントを確認・編集できる, so that マスタ管理時に分類情報を一元管理できる

#### Acceptance Criteria

1. When ユーザーがエンティティ詳細画面を表示する, the SegmentAssignment Service shall 当該エンティティに割り当てられた全セグメントをカテゴリ軸ごとに表示する
2. When ユーザーがエンティティ詳細画面からセグメントを追加する, the SegmentAssignment Service shall 当該エンティティ種別に対応するカテゴリ軸のみを選択可能とする
3. When ユーザーがエンティティ詳細画面からセグメントを変更する, the SegmentAssignment Service shall 同一カテゴリ軸内の別セグメントに割当を更新する
4. The SegmentAssignment Service shall 有効なカテゴリ軸・有効なセグメントのみを選択肢として表示する

---

### Requirement 7: セグメントによるフィルタリング

**Objective:** As a 購買担当者, I want 品目・取引先・仕入先拠点の一覧をセグメントでフィルタできる, so that 特定分類のマスタを素早く絞り込める

#### Acceptance Criteria

1. When ユーザーがエンティティ一覧でセグメントフィルタを適用する, the SegmentAssignment Service shall 指定したセグメントが割り当てられたエンティティのみを表示する
2. When ユーザーが複数のセグメントでフィルタする, the SegmentAssignment Service shall AND条件で絞り込みを実施する
3. When ユーザーが階層セグメントでフィルタする, the SegmentAssignment Service shall 親セグメントを選択した場合は子孫セグメントが割り当てられたエンティティも含める

---

### Requirement 8: データ整合性と監査

**Objective:** As a システム管理者, I want カテゴリ・セグメントデータの整合性と変更履歴を追跡できる, so that データの信頼性を担保できる

#### Acceptance Criteria

1. The CategoryAxis Service shall 全操作（登録・更新・無効化）に対して監査ログを記録する
2. The Segment Service shall 全操作（登録・更新・無効化）に対して監査ログを記録する
3. The SegmentAssignment Service shall 全操作（割当・変更・解除）に対して監査ログを記録する
4. The SegmentAssignment Service shall nightly batch で polymorphic 参照の整合性監査を実施する
5. If 整合性監査で不整合が検出された場合, then the System shall アラートを発報し運用ポリシーに従い対応する
6. The CategoryAxis Service shall テナント境界をRLSで厳格に担保する
7. The Segment Service shall テナント境界をRLSで厳格に担保する
8. The SegmentAssignment Service shall テナント境界をRLSで厳格に担保する

---

## Non-Functional Requirements

### NFR-1: パフォーマンス
- カテゴリ軸一覧の取得は2秒以内（P95）
- セグメント一覧（1軸あたり最大1000件想定）の取得は2秒以内（P95）
- セグメント割当の登録・更新は3秒以内（P95）

### NFR-2: スケーラビリティ
- 1テナントあたり最大100カテゴリ軸をサポート
- 1カテゴリ軸あたり最大1000セグメントをサポート
- 階層深度は最大5レベルまでをサポート

### NFR-3: 将来拡張
- トランザクション（PO_LINE等）への割当拡張を阻害しない設計とする
- entity_kind の enum は拡張可能な形式とする

---

## Out of Scope（MVP対象外）

- セグメント割当の一括インポート・エクスポート
- セグメントによる購買分析ダッシュボード
- セグメント間の排他・必須ルール定義
- 複数セグメント割当（1軸複数値）
