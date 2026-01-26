/**
 * BFF Client Interface for Warehouse Master
 *
 * contracts/bff の型を使用し、BFFエンドポイントへのアクセスを抽象化
 */

// contracts/bff から型を再エクスポート
export type {
  WarehouseDto,
  WarehouseSortBy,
  SortOrder,
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
} from '@contracts/bff/warehouse';

// contracts/bff/errors からエラー型を再エクスポート
export {
  WarehouseErrorCode,
  WarehouseErrorMessage,
} from '@contracts/bff/errors/warehouse-error';

import type {
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
} from '@contracts/bff/warehouse';

/**
 * BFF Error Interface
 */
export interface BffError {
  code: string;
  message: string;
  status: number;
}

/**
 * BFF Client Interface
 */
export interface BffClient {
  /**
   * 倉庫一覧取得
   * GET /api/bff/master-data/warehouses
   */
  listWarehouses(request: ListWarehousesRequest): Promise<ListWarehousesResponse>;

  /**
   * 倉庫詳細取得
   * GET /api/bff/master-data/warehouses/:id
   */
  getWarehouse(id: string): Promise<GetWarehouseResponse>;

  /**
   * 倉庫新規登録
   * POST /api/bff/master-data/warehouses
   */
  createWarehouse(request: CreateWarehouseRequest): Promise<CreateWarehouseResponse>;

  /**
   * 倉庫更新
   * PUT /api/bff/master-data/warehouses/:id
   */
  updateWarehouse(id: string, request: UpdateWarehouseRequest): Promise<UpdateWarehouseResponse>;

  /**
   * 倉庫無効化
   * POST /api/bff/master-data/warehouses/:id/deactivate
   */
  deactivateWarehouse(id: string, request: DeactivateWarehouseRequest): Promise<DeactivateWarehouseResponse>;

  /**
   * 倉庫再有効化
   * POST /api/bff/master-data/warehouses/:id/activate
   */
  activateWarehouse(id: string, request: ActivateWarehouseRequest): Promise<ActivateWarehouseResponse>;

  /**
   * 既定受入倉庫設定
   * POST /api/bff/master-data/warehouses/:id/set-default-receiving
   */
  setDefaultReceivingWarehouse(
    id: string,
    request: SetDefaultReceivingWarehouseRequest
  ): Promise<SetDefaultReceivingWarehouseResponse>;
}
