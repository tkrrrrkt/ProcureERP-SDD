/**
 * Mock BFF Client for Warehouse Master
 *
 * Phase UI-MOCK: モックデータで画面が動く状態を作る
 * 後で HttpBffClient に差し替え
 */

import type {
  BffClient,
  ListWarehousesRequest,
  ListWarehousesResponse,
  GetWarehouseResponse,
  CreateWarehouseRequest,
  CreateWarehouseResponse,
  UpdateWarehouseRequest,
  UpdateWarehouseResponse,
  DeactivateWarehouseRequest,
  DeactivateWarehouseResponse,
  ActivateWarehouseRequest,
  ActivateWarehouseResponse,
  SetDefaultReceivingWarehouseRequest,
  SetDefaultReceivingWarehouseResponse,
  WarehouseDto,
} from './BffClient';

// モックデータ（DTO準拠）
const mockWarehouses: WarehouseDto[] = [
  {
    id: '01234567-89ab-cdef-0123-456789abcdef',
    warehouseCode: 'WH001',
    warehouseName: '東京本社倉庫',
    warehouseNameKana: 'トウキョウホンシャソウコ',
    warehouseGroupId: null,
    postalCode: '100-0001',
    prefecture: '東京都',
    city: '千代田区',
    address1: '丸の内1-1-1',
    address2: '丸の内ビル B1F',
    phoneNumber: '03-1234-5678',
    isDefaultReceiving: true,
    displayOrder: 100,
    notes: '本社ビル地下倉庫。平日9:00-17:00受付',
    isActive: true,
    version: 1,
    createdAt: '2025-01-15T09:00:00.000Z',
    updatedAt: '2025-01-15T09:00:00.000Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: '11234567-89ab-cdef-0123-456789abcdef',
    warehouseCode: 'WH002',
    warehouseName: '大阪物流センター',
    warehouseNameKana: 'オオサカブツリュウセンター',
    warehouseGroupId: null,
    postalCode: '530-0001',
    prefecture: '大阪府',
    city: '大阪市北区',
    address1: '梅田1-2-3',
    address2: null,
    phoneNumber: '06-1234-5678',
    isDefaultReceiving: false,
    displayOrder: 200,
    notes: '西日本エリアの物流拠点',
    isActive: true,
    version: 1,
    createdAt: '2025-01-16T10:00:00.000Z',
    updatedAt: '2025-01-16T10:00:00.000Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: '21234567-89ab-cdef-0123-456789abcdef',
    warehouseCode: 'WH003',
    warehouseName: '福岡営業所倉庫',
    warehouseNameKana: 'フクオカエイギョウショソウコ',
    warehouseGroupId: null,
    postalCode: '812-0001',
    prefecture: '福岡県',
    city: '福岡市博多区',
    address1: '博多駅前4-5-6',
    address2: '博多ビル3F',
    phoneNumber: '092-123-4567',
    isDefaultReceiving: false,
    displayOrder: 300,
    notes: '九州エリアの営業拠点併設倉庫',
    isActive: false,
    version: 2,
    createdAt: '2025-01-10T08:00:00.000Z',
    updatedAt: '2025-01-20T14:00:00.000Z',
    createdBy: 'user-002',
    updatedBy: 'user-001',
  },
  {
    id: '31234567-89ab-cdef-0123-456789abcdef',
    warehouseCode: 'WH004',
    warehouseName: '名古屋配送センター',
    warehouseNameKana: 'ナゴヤハイソウセンター',
    warehouseGroupId: null,
    postalCode: '450-0001',
    prefecture: '愛知県',
    city: '名古屋市中村区',
    address1: '名駅1-1-1',
    address2: null,
    phoneNumber: '052-123-4567',
    isDefaultReceiving: false,
    displayOrder: 400,
    notes: null,
    isActive: true,
    version: 1,
    createdAt: '2025-01-18T11:00:00.000Z',
    updatedAt: '2025-01-18T11:00:00.000Z',
    createdBy: 'user-001',
    updatedBy: 'user-001',
  },
  {
    id: '41234567-89ab-cdef-0123-456789abcdef',
    warehouseCode: 'WH005',
    warehouseName: '札幌倉庫',
    warehouseNameKana: 'サッポロソウコ',
    warehouseGroupId: null,
    postalCode: '060-0001',
    prefecture: '北海道',
    city: '札幌市中央区',
    address1: '北1条西2丁目',
    address2: '札幌ビル5F',
    phoneNumber: '011-123-4567',
    isDefaultReceiving: false,
    displayOrder: 500,
    notes: '冬季は積雪により配送遅延の可能性あり',
    isActive: true,
    version: 1,
    createdAt: '2025-01-19T12:00:00.000Z',
    updatedAt: '2025-01-19T12:00:00.000Z',
    createdBy: 'user-002',
    updatedBy: 'user-002',
  },
];

export class MockBffClient implements BffClient {
  private warehouses: WarehouseDto[] = [...mockWarehouses];
  private delay = 300;

  private async wait(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delay));
  }

  async listWarehouses(request: ListWarehousesRequest): Promise<ListWarehousesResponse> {
    await this.wait();

    let filtered = [...this.warehouses];

    // isActive フィルタ
    if (request.isActive !== undefined) {
      filtered = filtered.filter((w) => w.isActive === request.isActive);
    }

    // keyword 検索（部分一致）
    if (request.keyword) {
      const kw = request.keyword.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.warehouseCode.toLowerCase().includes(kw) ||
          w.warehouseName.toLowerCase().includes(kw) ||
          (w.warehouseNameKana && w.warehouseNameKana.toLowerCase().includes(kw))
      );
    }

    // ソート
    const sortBy = request.sortBy ?? 'displayOrder';
    const sortOrder = request.sortOrder ?? 'asc';
    filtered.sort((a, b) => {
      const aVal = a[sortBy] ?? '';
      const bVal = b[sortBy] ?? '';
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
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

  async getWarehouse(id: string): Promise<GetWarehouseResponse> {
    await this.wait();
    const warehouse = this.warehouses.find((w) => w.id === id);
    if (!warehouse) {
      throw { code: 'WAREHOUSE_NOT_FOUND', message: '倉庫が見つかりません', status: 404 };
    }
    return { warehouse };
  }

  async createWarehouse(request: CreateWarehouseRequest): Promise<CreateWarehouseResponse> {
    await this.wait();

    // コード重複チェック
    const exists = this.warehouses.some(
      (w) => w.warehouseCode.toUpperCase() === request.warehouseCode.toUpperCase()
    );
    if (exists) {
      throw {
        code: 'WAREHOUSE_CODE_DUPLICATE',
        message: '倉庫コードが重複しています',
        status: 409,
      };
    }

    // コードバリデーション
    if (!/^[A-Za-z0-9]+$/.test(request.warehouseCode)) {
      throw {
        code: 'INVALID_WAREHOUSE_CODE_CHARS',
        message: '倉庫コードは半角英数字のみ使用可能です',
        status: 422,
      };
    }
    if (request.warehouseCode.length > 10) {
      throw {
        code: 'INVALID_WAREHOUSE_CODE_LENGTH',
        message: '倉庫コードは10文字以内である必要があります',
        status: 422,
      };
    }

    const now = new Date().toISOString();
    const newWarehouse: WarehouseDto = {
      id: crypto.randomUUID(),
      warehouseCode: request.warehouseCode.toUpperCase(),
      warehouseName: request.warehouseName,
      warehouseNameKana: request.warehouseNameKana ?? null,
      warehouseGroupId: request.warehouseGroupId ?? null,
      postalCode: request.postalCode ?? null,
      prefecture: request.prefecture ?? null,
      city: request.city ?? null,
      address1: request.address1 ?? null,
      address2: request.address2 ?? null,
      phoneNumber: request.phoneNumber ?? null,
      isDefaultReceiving: request.isDefaultReceiving ?? false,
      displayOrder: request.displayOrder ?? 1000,
      notes: request.notes ?? null,
      isActive: request.isActive ?? true,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: 'mock-user',
      updatedBy: 'mock-user',
    };

    // 既定受入倉庫設定時は既存の既定を解除
    if (newWarehouse.isDefaultReceiving) {
      this.warehouses.forEach((w) => {
        if (w.isDefaultReceiving) {
          w.isDefaultReceiving = false;
          w.version += 1;
          w.updatedAt = now;
        }
      });
    }

    this.warehouses.unshift(newWarehouse);
    return { warehouse: newWarehouse };
  }

  async updateWarehouse(
    id: string,
    request: UpdateWarehouseRequest
  ): Promise<UpdateWarehouseResponse> {
    await this.wait();

    const index = this.warehouses.findIndex((w) => w.id === id);
    if (index === -1) {
      throw { code: 'WAREHOUSE_NOT_FOUND', message: '倉庫が見つかりません', status: 404 };
    }

    const current = this.warehouses[index];
    if (current.version !== request.version) {
      throw {
        code: 'CONCURRENT_UPDATE',
        message: '他のユーザーによって更新されました',
        status: 409,
      };
    }

    const now = new Date().toISOString();

    // 既定受入倉庫設定時は既存の既定を解除
    if (request.isDefaultReceiving && !current.isDefaultReceiving) {
      this.warehouses.forEach((w) => {
        if (w.isDefaultReceiving && w.id !== id) {
          w.isDefaultReceiving = false;
          w.version += 1;
          w.updatedAt = now;
        }
      });
    }

    const updated: WarehouseDto = {
      ...current,
      warehouseName: request.warehouseName,
      warehouseNameKana: request.warehouseNameKana ?? null,
      warehouseGroupId: request.warehouseGroupId ?? null,
      postalCode: request.postalCode ?? null,
      prefecture: request.prefecture ?? null,
      city: request.city ?? null,
      address1: request.address1 ?? null,
      address2: request.address2 ?? null,
      phoneNumber: request.phoneNumber ?? null,
      isDefaultReceiving: request.isDefaultReceiving,
      displayOrder: request.displayOrder,
      notes: request.notes ?? null,
      isActive: request.isActive,
      version: current.version + 1,
      updatedAt: now,
      updatedBy: 'mock-user',
    };

    this.warehouses[index] = updated;
    return { warehouse: updated };
  }

  async deactivateWarehouse(
    id: string,
    request: DeactivateWarehouseRequest
  ): Promise<DeactivateWarehouseResponse> {
    await this.wait();

    const index = this.warehouses.findIndex((w) => w.id === id);
    if (index === -1) {
      throw { code: 'WAREHOUSE_NOT_FOUND', message: '倉庫が見つかりません', status: 404 };
    }

    const current = this.warehouses[index];
    if (current.version !== request.version) {
      throw {
        code: 'CONCURRENT_UPDATE',
        message: '他のユーザーによって更新されました',
        status: 409,
      };
    }

    // 既定受入倉庫は無効化不可
    if (current.isDefaultReceiving) {
      throw {
        code: 'CANNOT_DEACTIVATE_DEFAULT_RECEIVING',
        message: '既定受入倉庫を無効化することはできません。先に別の倉庫を既定に設定してください',
        status: 422,
      };
    }

    const updated: WarehouseDto = {
      ...current,
      isActive: false,
      version: current.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'mock-user',
    };

    this.warehouses[index] = updated;
    return { warehouse: updated };
  }

  async activateWarehouse(
    id: string,
    request: ActivateWarehouseRequest
  ): Promise<ActivateWarehouseResponse> {
    await this.wait();

    const index = this.warehouses.findIndex((w) => w.id === id);
    if (index === -1) {
      throw { code: 'WAREHOUSE_NOT_FOUND', message: '倉庫が見つかりません', status: 404 };
    }

    const current = this.warehouses[index];
    if (current.version !== request.version) {
      throw {
        code: 'CONCURRENT_UPDATE',
        message: '他のユーザーによって更新されました',
        status: 409,
      };
    }

    const updated: WarehouseDto = {
      ...current,
      isActive: true,
      version: current.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'mock-user',
    };

    this.warehouses[index] = updated;
    return { warehouse: updated };
  }

  async setDefaultReceivingWarehouse(
    id: string,
    request: SetDefaultReceivingWarehouseRequest
  ): Promise<SetDefaultReceivingWarehouseResponse> {
    await this.wait();

    const index = this.warehouses.findIndex((w) => w.id === id);
    if (index === -1) {
      throw { code: 'WAREHOUSE_NOT_FOUND', message: '倉庫が見つかりません', status: 404 };
    }

    const current = this.warehouses[index];
    if (current.version !== request.version) {
      throw {
        code: 'CONCURRENT_UPDATE',
        message: '他のユーザーによって更新されました',
        status: 409,
      };
    }

    // 既に既定の場合
    if (current.isDefaultReceiving) {
      throw {
        code: 'DEFAULT_RECEIVING_ALREADY_SET',
        message: 'この倉庫は既に既定受入倉庫です',
        status: 409,
      };
    }

    const now = new Date().toISOString();

    // 既存の既定倉庫を探す
    let previousDefault: WarehouseDto | null = null;
    const prevIndex = this.warehouses.findIndex(
      (w) => w.isDefaultReceiving && w.isActive
    );
    if (prevIndex !== -1) {
      const prev = this.warehouses[prevIndex];
      previousDefault = { ...prev };
      this.warehouses[prevIndex] = {
        ...prev,
        isDefaultReceiving: false,
        version: prev.version + 1,
        updatedAt: now,
        updatedBy: 'mock-user',
      };
    }

    // 新しい既定倉庫を設定
    const updated: WarehouseDto = {
      ...current,
      isDefaultReceiving: true,
      version: current.version + 1,
      updatedAt: now,
      updatedBy: 'mock-user',
    };

    this.warehouses[index] = updated;
    return { warehouse: updated, previousDefault };
  }
}

// シングルトンインスタンス
let mockBffClientInstance: MockBffClient | null = null;

export function getMockBffClient(): MockBffClient {
  if (!mockBffClientInstance) {
    mockBffClientInstance = new MockBffClient();
  }
  return mockBffClientInstance;
}
