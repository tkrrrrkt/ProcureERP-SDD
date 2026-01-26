/**
 * Mock BFF Client for Ship-To Master
 *
 * Phase UI-MOCK: モックデータで画面が動く状態を作る
 * 後で HttpBffClient に差し替え
 */

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

// モックデータ（DTO準拠）
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
    isActive: false,
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
  private delay = 300;

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
    const exists = this.shipTos.some((s) => s.shipToCode === request.shipToCode.toUpperCase());
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

// シングルトンインスタンス
let mockBffClientInstance: MockBffClient | null = null;

export function getMockBffClient(): MockBffClient {
  if (!mockBffClientInstance) {
    mockBffClientInstance = new MockBffClient();
  }
  return mockBffClientInstance;
}
