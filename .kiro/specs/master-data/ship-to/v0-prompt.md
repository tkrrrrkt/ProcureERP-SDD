# v0 Prompt: 納入先マスタ (Ship-To Master)

## 1. 概要

ProcurERP の「納入先マスタ」画面を生成してください。発注時に「実際にモノを届ける場所」を選択するための基盤マスタです。

**技術スタック**:
- React 18 + Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v3（**v4構文は使用禁止**）
- shadcn/ui コンポーネント

**重要な制約**:
- Domain API を直接呼ばない（BFF経由のみ）
- `packages/contracts/src/api` を参照しない
- すべてのI/Fは `contracts/bff` DTO に準拠
- モックデータは `MockBffClient` に分離

---

## 2. 画面一覧（Routes）

| Route | 画面名 | 目的 |
|-------|--------|------|
| `/master-data/ship-to` | 納入先一覧 | 納入先マスタの一覧表示・検索・フィルタリング |
| `/master-data/ship-to?dialog=create` | 新規登録ダイアログ | 納入先の新規登録 |
| `/master-data/ship-to?dialog=edit&id={id}` | 編集ダイアログ | 納入先の詳細表示・編集 |

※ ダイアログはURL状態で管理（ブラウザバック対応）

---

## 3. BFF Contracts（DTO定義）

### 3.1 基本型

```typescript
// Sort Options
export type ShipToSortBy =
  | 'shipToCode'
  | 'shipToName'
  | 'shipToNameKana'
  | 'prefecture'
  | 'isActive';

export type SortOrder = 'asc' | 'desc';

// ShipToDto
export interface ShipToDto {
  id: string;
  shipToCode: string;
  shipToName: string;
  shipToNameKana: string | null;
  customerSiteId: string | null; // 現在は未使用（将来拡張）
  postalCode: string | null;
  prefecture: string | null;
  city: string | null;
  address1: string | null;
  address2: string | null;
  phoneNumber: string | null;
  faxNumber: string | null;
  email: string | null;
  contactPerson: string | null;
  remarks: string | null;
  isActive: boolean;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string | null;
  updatedBy: string | null;
}
```

### 3.2 Request/Response DTO

```typescript
// List
export interface ListShipTosRequest {
  page?: number; // 1-based, default: 1
  pageSize?: number; // default: 20, max: 200
  sortBy?: ShipToSortBy; // default: 'shipToCode'
  sortOrder?: SortOrder; // default: 'asc'
  keyword?: string; // 部分一致: shipToCode, shipToName, shipToNameKana
  isActive?: boolean; // フィルタ
}

export interface ListShipTosResponse {
  items: ShipToDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Get
export interface GetShipToResponse {
  shipTo: ShipToDto;
}

// Create
export interface CreateShipToRequest {
  shipToCode: string; // 10桁英数字（必須）
  shipToName: string; // 必須
  shipToNameKana?: string;
  // customerSiteId は将来拡張（現在は入力不可）
  postalCode?: string;
  prefecture?: string;
  city?: string;
  address1?: string;
  address2?: string;
  phoneNumber?: string;
  faxNumber?: string;
  email?: string;
  contactPerson?: string;
  remarks?: string;
  isActive?: boolean; // default: true
}

export interface CreateShipToResponse {
  shipTo: ShipToDto;
}

// Update
export interface UpdateShipToRequest {
  // shipToCode は更新不可
  shipToName: string;
  shipToNameKana?: string;
  // customerSiteId は将来拡張
  postalCode?: string;
  prefecture?: string;
  city?: string;
  address1?: string;
  address2?: string;
  phoneNumber?: string;
  faxNumber?: string;
  email?: string;
  contactPerson?: string;
  remarks?: string;
  isActive: boolean;
  version: number; // 楽観ロック
}

export interface UpdateShipToResponse {
  shipTo: ShipToDto;
}

// Deactivate / Activate
export interface DeactivateShipToRequest {
  version: number;
}

export interface DeactivateShipToResponse {
  shipTo: ShipToDto;
}

export interface ActivateShipToRequest {
  version: number;
}

export interface ActivateShipToResponse {
  shipTo: ShipToDto;
}
```

---

## 4. BffClient Interface

```typescript
/**
 * BFF Client Interface for Ship-To Master
 */
export interface BffClient {
  /**
   * 納入先一覧取得
   * GET /api/bff/master-data/ship-to
   */
  listShipTos(request: ListShipTosRequest): Promise<ListShipTosResponse>;

  /**
   * 納入先詳細取得
   * GET /api/bff/master-data/ship-to/:id
   */
  getShipTo(id: string): Promise<GetShipToResponse>;

  /**
   * 納入先新規登録
   * POST /api/bff/master-data/ship-to
   */
  createShipTo(request: CreateShipToRequest): Promise<CreateShipToResponse>;

  /**
   * 納入先更新
   * PUT /api/bff/master-data/ship-to/:id
   */
  updateShipTo(id: string, request: UpdateShipToRequest): Promise<UpdateShipToResponse>;

  /**
   * 納入先無効化
   * PATCH /api/bff/master-data/ship-to/:id/deactivate
   */
  deactivateShipTo(id: string, request: DeactivateShipToRequest): Promise<DeactivateShipToResponse>;

  /**
   * 納入先再有効化
   * PATCH /api/bff/master-data/ship-to/:id/activate
   */
  activateShipTo(id: string, request: ActivateShipToRequest): Promise<ActivateShipToResponse>;
}
```

---

## 5. MockBffClient 実装

```typescript
import type {
  BffClient,
  ListShipTosRequest,
  ListShipTosResponse,
  GetShipToResponse,
  CreateShipToRequest,
  CreateShipToResponse,
  UpdateShipToRequest,
  UpdateShipToResponse,
  DeactivateShipToRequest,
  DeactivateShipToResponse,
  ActivateShipToRequest,
  ActivateShipToResponse,
  ShipToDto,
} from './BffClient';

// モックデータ
const mockShipTos: ShipToDto[] = [
  {
    id: '01234567-89ab-cdef-0123-456789abcdef',
    shipToCode: 'SHIPTO0001',
    shipToName: '東京本社倉庫',
    shipToNameKana: 'トウキョウホンシャソウコ',
    customerSiteId: null,
    postalCode: '100-0001',
    prefecture: '東京都',
    city: '千代田区',
    address1: '丸の内1-1-1',
    address2: '丸の内ビル10F',
    phoneNumber: '03-1234-5678',
    faxNumber: '03-1234-5679',
    email: 'tokyo@example.com',
    contactPerson: '山田太郎',
    remarks: '平日9:00-17:00受付',
    isActive: true,
    version: 1,
    createdAt: '2025-01-15T09:00:00.000Z',
    updatedAt: '2025-01-15T09:00:00.000Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: '11234567-89ab-cdef-0123-456789abcdef',
    shipToCode: 'SHIPTO0002',
    shipToName: '大阪支店倉庫',
    shipToNameKana: 'オオサカシテンソウコ',
    customerSiteId: null,
    postalCode: '530-0001',
    prefecture: '大阪府',
    city: '大阪市北区',
    address1: '梅田1-2-3',
    address2: null,
    phoneNumber: '06-1234-5678',
    faxNumber: null,
    email: 'osaka@example.com',
    contactPerson: '鈴木花子',
    remarks: null,
    isActive: true,
    version: 1,
    createdAt: '2025-01-16T10:00:00.000Z',
    updatedAt: '2025-01-16T10:00:00.000Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: '21234567-89ab-cdef-0123-456789abcdef',
    shipToCode: 'SHIPTO0003',
    shipToName: '福岡工場',
    shipToNameKana: 'フクオカコウジョウ',
    customerSiteId: null,
    postalCode: '812-0001',
    prefecture: '福岡県',
    city: '福岡市博多区',
    address1: '博多駅前4-5-6',
    address2: '博多ビル3F',
    phoneNumber: '092-123-4567',
    faxNumber: '092-123-4568',
    email: 'fukuoka@example.com',
    contactPerson: '田中一郎',
    remarks: '休日は守衛室へ連絡',
    isActive: false, // 無効
    version: 2,
    createdAt: '2025-01-10T08:00:00.000Z',
    updatedAt: '2025-01-20T14:00:00.000Z',
    createdBy: 'user-002',
    updatedBy: 'user-001',
  },
  {
    id: '31234567-89ab-cdef-0123-456789abcdef',
    shipToCode: 'SHIPTO0004',
    shipToName: '名古屋配送センター',
    shipToNameKana: 'ナゴヤハイソウセンター',
    customerSiteId: null,
    postalCode: '450-0001',
    prefecture: '愛知県',
    city: '名古屋市中村区',
    address1: '名駅1-1-1',
    address2: null,
    phoneNumber: '052-123-4567',
    faxNumber: null,
    email: null,
    contactPerson: '佐藤次郎',
    remarks: null,
    isActive: true,
    version: 1,
    createdAt: '2025-01-18T11:00:00.000Z',
    updatedAt: '2025-01-18T11:00:00.000Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: '41234567-89ab-cdef-0123-456789abcdef',
    shipToCode: 'SHIPTO0005',
    shipToName: '札幌営業所',
    shipToNameKana: 'サッポロエイギョウショ',
    customerSiteId: null,
    postalCode: '060-0001',
    prefecture: '北海道',
    city: '札幌市中央区',
    address1: '北1条西2丁目',
    address2: '札幌ビル5F',
    phoneNumber: '011-123-4567',
    faxNumber: '011-123-4568',
    email: 'sapporo@example.com',
    contactPerson: '高橋三郎',
    remarks: '冬季は積雪注意',
    isActive: true,
    version: 1,
    createdAt: '2025-01-19T12:00:00.000Z',
    updatedAt: '2025-01-19T12:00:00.000Z',
    createdBy: 'user-002',
    updatedBy: 'user-002',
  },
];

export class MockBffClient implements BffClient {
  private shipTos: ShipToDto[] = [...mockShipTos];
  private delay = 300; // ms

  private async wait(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delay));
  }

  async listShipTos(request: ListShipTosRequest): Promise<ListShipTosResponse> {
    await this.wait();

    let filtered = [...this.shipTos];

    // isActive フィルタ
    if (request.isActive !== undefined) {
      filtered = filtered.filter((s) => s.isActive === request.isActive);
    }

    // keyword 検索（部分一致）
    if (request.keyword) {
      const kw = request.keyword.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.shipToCode.toLowerCase().includes(kw) ||
          s.shipToName.toLowerCase().includes(kw) ||
          (s.shipToNameKana && s.shipToNameKana.toLowerCase().includes(kw))
      );
    }

    // ソート
    const sortBy = request.sortBy ?? 'shipToCode';
    const sortOrder = request.sortOrder ?? 'asc';
    filtered.sort((a, b) => {
      const aVal = a[sortBy] ?? '';
      const bVal = b[sortBy] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal), 'ja');
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    // ページネーション
    const page = request.page ?? 1;
    const pageSize = request.pageSize ?? 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return { items, page, pageSize, total, totalPages };
  }

  async getShipTo(id: string): Promise<GetShipToResponse> {
    await this.wait();
    const shipTo = this.shipTos.find((s) => s.id === id);
    if (!shipTo) {
      throw { code: 'SHIP_TO_NOT_FOUND', message: '納入先が見つかりません', status: 404 };
    }
    return { shipTo };
  }

  async createShipTo(request: CreateShipToRequest): Promise<CreateShipToResponse> {
    await this.wait();

    // コード重複チェック
    const exists = this.shipTos.some((s) => s.shipToCode === request.shipToCode);
    if (exists) {
      throw { code: 'SHIP_TO_CODE_DUPLICATE', message: '納入先コードが重複しています', status: 409 };
    }

    const now = new Date().toISOString();
    const newShipTo: ShipToDto = {
      id: crypto.randomUUID(),
      shipToCode: request.shipToCode.toUpperCase(),
      shipToName: request.shipToName,
      shipToNameKana: request.shipToNameKana ?? null,
      customerSiteId: null,
      postalCode: request.postalCode ?? null,
      prefecture: request.prefecture ?? null,
      city: request.city ?? null,
      address1: request.address1 ?? null,
      address2: request.address2 ?? null,
      phoneNumber: request.phoneNumber ?? null,
      faxNumber: request.faxNumber ?? null,
      email: request.email ?? null,
      contactPerson: request.contactPerson ?? null,
      remarks: request.remarks ?? null,
      isActive: request.isActive ?? true,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: 'mock-user',
      updatedBy: 'mock-user',
    };

    this.shipTos.unshift(newShipTo);
    return { shipTo: newShipTo };
  }

  async updateShipTo(id: string, request: UpdateShipToRequest): Promise<UpdateShipToResponse> {
    await this.wait();

    const index = this.shipTos.findIndex((s) => s.id === id);
    if (index === -1) {
      throw { code: 'SHIP_TO_NOT_FOUND', message: '納入先が見つかりません', status: 404 };
    }

    const current = this.shipTos[index];
    if (current.version !== request.version) {
      throw { code: 'CONCURRENT_UPDATE', message: '他のユーザーによって更新されました', status: 409 };
    }

    const updated: ShipToDto = {
      ...current,
      shipToName: request.shipToName,
      shipToNameKana: request.shipToNameKana ?? null,
      postalCode: request.postalCode ?? null,
      prefecture: request.prefecture ?? null,
      city: request.city ?? null,
      address1: request.address1 ?? null,
      address2: request.address2 ?? null,
      phoneNumber: request.phoneNumber ?? null,
      faxNumber: request.faxNumber ?? null,
      email: request.email ?? null,
      contactPerson: request.contactPerson ?? null,
      remarks: request.remarks ?? null,
      isActive: request.isActive,
      version: current.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'mock-user',
    };

    this.shipTos[index] = updated;
    return { shipTo: updated };
  }

  async deactivateShipTo(id: string, request: DeactivateShipToRequest): Promise<DeactivateShipToResponse> {
    await this.wait();

    const index = this.shipTos.findIndex((s) => s.id === id);
    if (index === -1) {
      throw { code: 'SHIP_TO_NOT_FOUND', message: '納入先が見つかりません', status: 404 };
    }

    const current = this.shipTos[index];
    if (current.version !== request.version) {
      throw { code: 'CONCURRENT_UPDATE', message: '他のユーザーによって更新されました', status: 409 };
    }

    const updated: ShipToDto = {
      ...current,
      isActive: false,
      version: current.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'mock-user',
    };

    this.shipTos[index] = updated;
    return { shipTo: updated };
  }

  async activateShipTo(id: string, request: ActivateShipToRequest): Promise<ActivateShipToResponse> {
    await this.wait();

    const index = this.shipTos.findIndex((s) => s.id === id);
    if (index === -1) {
      throw { code: 'SHIP_TO_NOT_FOUND', message: '納入先が見つかりません', status: 404 };
    }

    const current = this.shipTos[index];
    if (current.version !== request.version) {
      throw { code: 'CONCURRENT_UPDATE', message: '他のユーザーによって更新されました', status: 409 };
    }

    const updated: ShipToDto = {
      ...current,
      isActive: true,
      version: current.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'mock-user',
    };

    this.shipTos[index] = updated;
    return { shipTo: updated };
  }
}
```

---

## 6. エラーコード定義

```typescript
// エラーコード
export const ShipToErrorCode = {
  SHIP_TO_NOT_FOUND: 'SHIP_TO_NOT_FOUND',
  SHIP_TO_CODE_DUPLICATE: 'SHIP_TO_CODE_DUPLICATE',
  INVALID_SHIP_TO_CODE_FORMAT: 'INVALID_SHIP_TO_CODE_FORMAT',
  INVALID_SHIP_TO_CODE_LENGTH: 'INVALID_SHIP_TO_CODE_LENGTH',
  INVALID_SHIP_TO_CODE_CHARS: 'INVALID_SHIP_TO_CODE_CHARS',
  INVALID_EMAIL_FORMAT: 'INVALID_EMAIL_FORMAT',
  CONCURRENT_UPDATE: 'CONCURRENT_UPDATE',
} as const;

// HTTP ステータス
export const ShipToErrorHttpStatus = {
  SHIP_TO_NOT_FOUND: 404,
  SHIP_TO_CODE_DUPLICATE: 409,
  INVALID_SHIP_TO_CODE_FORMAT: 422,
  INVALID_SHIP_TO_CODE_LENGTH: 422,
  INVALID_SHIP_TO_CODE_CHARS: 422,
  INVALID_EMAIL_FORMAT: 422,
  CONCURRENT_UPDATE: 409,
} as const;

// デフォルトメッセージ（日本語）
export const ShipToErrorMessage = {
  SHIP_TO_NOT_FOUND: '指定された納入先が見つかりません',
  SHIP_TO_CODE_DUPLICATE: '納入先コードが既に使用されています',
  INVALID_SHIP_TO_CODE_FORMAT: '納入先コードの形式が不正です',
  INVALID_SHIP_TO_CODE_LENGTH: '納入先コードは10桁で入力してください',
  INVALID_SHIP_TO_CODE_CHARS: '納入先コードは英数字のみ使用できます',
  INVALID_EMAIL_FORMAT: 'メールアドレスの形式が不正です',
  CONCURRENT_UPDATE: '他のユーザーによって更新されました。再読み込みしてください',
} as const;
```

---

## 7. 画面仕様

### 7.1 一覧画面（ShipToListPage）

**レイアウト**:
```
┌─────────────────────────────────────────────────────────────┐
│ 納入先マスタ                                    [＋新規登録] │
├─────────────────────────────────────────────────────────────┤
│ [検索入力] [有効▼] [並び順▼]                                │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ コード     │ 名称         │ 都道府県  │ 連絡先    │状態│ │
│ ├───────────┼─────────────┼──────────┼──────────┼────┤ │
│ │ SHIPTO0001│ 東京本社倉庫 │ 東京都   │ 山田太郎 │有効│ │
│ │ SHIPTO0002│ 大阪支店倉庫 │ 大阪府   │ 鈴木花子 │有効│ │
│ │ SHIPTO0003│ 福岡工場     │ 福岡県   │ 田中一郎 │無効│ │
│ └─────────────────────────────────────────────────────────┘ │
│ ◀ 1 2 3 ... 10 ▶                                          │
└─────────────────────────────────────────────────────────────┘
```

**機能**:
- 検索: shipToCode / shipToName / shipToNameKana で部分一致（debounce 300ms）
- フィルタ: 有効/無効/すべて
- ソート: コード / 名称 / カナ / 都道府県 / 状態
- ページネーション: 20件/ページ
- 行クリック: 編集ダイアログを開く

**テーブル列**:
| 列 | フィールド | 幅 | 説明 |
|----|-----------|-----|------|
| コード | shipToCode | 120px | 固定幅 |
| 名称 | shipToName | flex | 可変幅 |
| 都道府県 | prefecture | 100px | 固定幅 |
| 連絡先 | contactPerson | 120px | 固定幅 |
| 状態 | isActive | 80px | Badge表示 |

### 7.2 新規登録ダイアログ（CreateShipToDialog）

**フォーム項目**:
| 項目 | フィールド | 必須 | 説明 |
|------|-----------|------|------|
| 納入先コード | shipToCode | ○ | 10桁英数字、大文字変換 |
| 名称 | shipToName | ○ | 最大100文字 |
| 名称カナ | shipToNameKana | - | 最大200文字 |
| 郵便番号 | postalCode | - | 例: 100-0001 |
| 都道府県 | prefecture | - | プルダウン選択 |
| 市区町村 | city | - | 最大50文字 |
| 住所1 | address1 | - | 最大100文字 |
| 住所2 | address2 | - | 最大100文字 |
| 電話番号 | phoneNumber | - | 例: 03-1234-5678 |
| FAX番号 | faxNumber | - | 例: 03-1234-5679 |
| メール | email | - | 形式検証あり |
| 担当者 | contactPerson | - | 最大50文字 |
| 備考 | remarks | - | 複数行テキスト |
| 有効 | isActive | - | デフォルト: true |

### 7.3 編集ダイアログ（EditShipToDialog）

- 新規登録と同じフォーム項目
- **納入先コードは編集不可**（表示のみ）
- 楽観ロック: version を hidden で保持
- 無効化/再有効化ボタン

---

## 8. エラー表示ポリシー

### 8.1 トースト通知（全体エラー）

```typescript
// 成功
toast({
  title: '保存しました',
  description: '納入先を登録しました',
  className: 'border-success bg-success/10',
});

// エラー
toast({
  variant: 'destructive',
  title: 'エラー',
  description: ShipToErrorMessage[error.code] ?? 'エラーが発生しました',
});
```

### 8.2 フィールドエラー

```tsx
<div className="space-y-2">
  <Label htmlFor="shipToCode">納入先コード *</Label>
  <Input
    id="shipToCode"
    {...register('shipToCode')}
    className={errors.shipToCode ? 'border-destructive' : ''}
  />
  {errors.shipToCode && (
    <p className="text-sm text-destructive">{errors.shipToCode.message}</p>
  )}
</div>
```

### 8.3 競合エラー（CONCURRENT_UPDATE）

```tsx
<AlertDialog>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>更新の競合</AlertDialogTitle>
      <AlertDialogDescription>
        他のユーザーによってこのデータが更新されました。
        最新のデータを読み込み直しますか？
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>キャンセル</AlertDialogCancel>
      <AlertDialogAction onClick={handleReload}>
        再読み込み
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## 9. デザインシステム準拠

### 9.1 カラー

- Primary: `bg-primary` (Professional Blue) - 保存ボタン
- Secondary: `bg-secondary` - キャンセルボタン
- Destructive: `bg-destructive` - 無効化確認
- Success: `border-success bg-success/10` - 成功トースト
- Muted: `text-muted-foreground` - 補助テキスト

### 9.2 コンポーネント

- Button: `variant="default"` (Primary), `variant="outline"`, `variant="destructive"`
- Badge: `variant="default"` (有効), `variant="secondary"` (無効)
- Table: shadcn/ui Table コンポーネント
- Dialog: shadcn/ui Dialog コンポーネント
- Input/Select/Textarea: shadcn/ui フォームコンポーネント

### 9.3 スペーシング

- カード内パディング: `p-6`
- フォーム項目間: `space-y-4`
- ボタン間: `gap-2`

---

## 10. ファイル構成（生成対象）

```
apps/web/src/features/master-data/ship-to/
├── ui/
│   ├── ShipToListPage.tsx      # 一覧ページ
│   ├── ShipToList.tsx          # テーブルコンポーネント
│   ├── ShipToSearchBar.tsx     # 検索バー
│   ├── ShipToDialog.tsx        # 新規登録/編集ダイアログ
│   └── ShipToStatusBadge.tsx   # 有効/無効バッジ
├── api/
│   ├── BffClient.ts            # インターフェース + 型エクスポート
│   ├── MockBffClient.ts        # モック実装
│   └── HttpBffClient.ts        # 本番実装（後で差し替え）
├── hooks/
│   ├── useShipToList.ts        # 一覧取得フック
│   └── useShipToForm.ts        # フォーム管理フック
└── types/
    └── index.ts                # 型定義（BffClient.tsから再エクスポート）
```

---

## 11. 補足（Tailwind CSS v3 制約）

v0 が生成したコードで以下が含まれている場合は修正が必要:

```css
/* 禁止: v4 構文 */
@import "tailwindcss";
@theme inline { ... }
@custom-variant dark (...);

/* 正しい: v3 構文 */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 12. 都道府県選択オプション

```typescript
export const prefectureOptions = [
  { value: '北海道', label: '北海道' },
  { value: '青森県', label: '青森県' },
  { value: '岩手県', label: '岩手県' },
  { value: '宮城県', label: '宮城県' },
  { value: '秋田県', label: '秋田県' },
  { value: '山形県', label: '山形県' },
  { value: '福島県', label: '福島県' },
  { value: '茨城県', label: '茨城県' },
  { value: '栃木県', label: '栃木県' },
  { value: '群馬県', label: '群馬県' },
  { value: '埼玉県', label: '埼玉県' },
  { value: '千葉県', label: '千葉県' },
  { value: '東京都', label: '東京都' },
  { value: '神奈川県', label: '神奈川県' },
  { value: '新潟県', label: '新潟県' },
  { value: '富山県', label: '富山県' },
  { value: '石川県', label: '石川県' },
  { value: '福井県', label: '福井県' },
  { value: '山梨県', label: '山梨県' },
  { value: '長野県', label: '長野県' },
  { value: '岐阜県', label: '岐阜県' },
  { value: '静岡県', label: '静岡県' },
  { value: '愛知県', label: '愛知県' },
  { value: '三重県', label: '三重県' },
  { value: '滋賀県', label: '滋賀県' },
  { value: '京都府', label: '京都府' },
  { value: '大阪府', label: '大阪府' },
  { value: '兵庫県', label: '兵庫県' },
  { value: '奈良県', label: '奈良県' },
  { value: '和歌山県', label: '和歌山県' },
  { value: '鳥取県', label: '鳥取県' },
  { value: '島根県', label: '島根県' },
  { value: '岡山県', label: '岡山県' },
  { value: '広島県', label: '広島県' },
  { value: '山口県', label: '山口県' },
  { value: '徳島県', label: '徳島県' },
  { value: '香川県', label: '香川県' },
  { value: '愛媛県', label: '愛媛県' },
  { value: '高知県', label: '高知県' },
  { value: '福岡県', label: '福岡県' },
  { value: '佐賀県', label: '佐賀県' },
  { value: '長崎県', label: '長崎県' },
  { value: '熊本県', label: '熊本県' },
  { value: '大分県', label: '大分県' },
  { value: '宮崎県', label: '宮崎県' },
  { value: '鹿児島県', label: '鹿児島県' },
  { value: '沖縄県', label: '沖縄県' },
];
```

---

以上の仕様に基づいて、納入先マスタのUIコンポーネントを生成してください。
