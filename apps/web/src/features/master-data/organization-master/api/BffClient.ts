/**
 * BFF Client Interface for Organization Master
 *
 * contracts/bff の型を使用し、BFFエンドポイントへのアクセスを抽象化
 * SSoT: packages/contracts/src/bff/organization-master
 */

import type {
  // Version types
  ListVersionsRequest,
  ListVersionsResponse,
  GetVersionResponse,
  CreateVersionRequest,
  CreateVersionResponse,
  CopyVersionRequest,
  CopyVersionResponse,
  UpdateVersionRequest,
  UpdateVersionResponse,
  AsOfSearchRequest,
  AsOfSearchResponse,
  // Department types
  ListDepartmentsTreeRequest,
  ListDepartmentsTreeResponse,
  GetDepartmentResponse,
  CreateDepartmentRequest,
  CreateDepartmentResponse,
  UpdateDepartmentRequest,
  UpdateDepartmentResponse,
  MoveDepartmentRequest,
  MoveDepartmentResponse,
  DeactivateDepartmentResponse,
  ReactivateDepartmentResponse,
} from '@contracts/bff/organization-master';

/**
 * BFF Client Interface
 */
export interface BffClient {
  // ===========================================================================
  // Version Operations
  // ===========================================================================

  /**
   * バージョン一覧取得
   * GET /api/organization-master/versions
   */
  listVersions(request: ListVersionsRequest): Promise<ListVersionsResponse>;

  /**
   * バージョン詳細取得
   * GET /api/organization-master/versions/:versionId
   */
  getVersion(versionId: string): Promise<GetVersionResponse>;

  /**
   * バージョン新規作成
   * POST /api/organization-master/versions
   */
  createVersion(request: CreateVersionRequest): Promise<CreateVersionResponse>;

  /**
   * バージョンコピー
   * POST /api/organization-master/versions/:versionId/copy
   */
  copyVersion(
    sourceVersionId: string,
    request: CopyVersionRequest
  ): Promise<CopyVersionResponse>;

  /**
   * バージョン更新
   * PUT /api/organization-master/versions/:versionId
   */
  updateVersion(
    versionId: string,
    request: UpdateVersionRequest
  ): Promise<UpdateVersionResponse>;

  /**
   * as-of検索（指定日時点で有効なバージョンを取得）
   * GET /api/organization-master/versions/as-of
   */
  findEffectiveAsOf(request: AsOfSearchRequest): Promise<AsOfSearchResponse>;

  // ===========================================================================
  // Department Operations
  // ===========================================================================

  /**
   * 部門一覧取得（ツリー形式）
   * GET /api/organization-master/versions/:versionId/departments
   */
  listDepartmentsTree(
    versionId: string,
    request: ListDepartmentsTreeRequest
  ): Promise<ListDepartmentsTreeResponse>;

  /**
   * 部門詳細取得
   * GET /api/organization-master/departments/:departmentId
   */
  getDepartment(departmentId: string): Promise<GetDepartmentResponse>;

  /**
   * 部門新規作成
   * POST /api/organization-master/versions/:versionId/departments
   */
  createDepartment(
    versionId: string,
    request: CreateDepartmentRequest
  ): Promise<CreateDepartmentResponse>;

  /**
   * 部門更新
   * PUT /api/organization-master/departments/:departmentId
   */
  updateDepartment(
    departmentId: string,
    request: UpdateDepartmentRequest
  ): Promise<UpdateDepartmentResponse>;

  /**
   * 部門移動（ドラッグ＆ドロップ）
   * POST /api/organization-master/departments/:departmentId/move
   */
  moveDepartment(
    departmentId: string,
    request: MoveDepartmentRequest
  ): Promise<MoveDepartmentResponse>;

  /**
   * 部門無効化
   * POST /api/organization-master/departments/:departmentId/deactivate
   */
  deactivateDepartment(
    departmentId: string
  ): Promise<DeactivateDepartmentResponse>;

  /**
   * 部門有効化
   * POST /api/organization-master/departments/:departmentId/reactivate
   */
  reactivateDepartment(
    departmentId: string
  ): Promise<ReactivateDepartmentResponse>;
}
