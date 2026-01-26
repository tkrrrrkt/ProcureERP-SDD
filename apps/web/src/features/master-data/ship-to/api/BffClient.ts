/**
 * BFF Client Interface for Ship-To Master
 *
 * contracts/bff の型を使用し、BFFエンドポイントへのアクセスを抽象化
 */

// contracts/bff から型を再エクスポート
export type {
  ShipToDto,
  ShipToSortBy,
  SortOrder,
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
} from '@contracts/bff/ship-to';

// contracts/bff/errors からエラー型を再エクスポート
export {
  ShipToErrorCode,
  ShipToErrorHttpStatus,
  ShipToErrorMessage,
} from '@contracts/bff/errors/ship-to-error';

import type {
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
} from '@contracts/bff/ship-to';

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
