import type {
  // UomGroup
  ListUomGroupsRequest,
  ListUomGroupsResponse,
  GetUomGroupResponse,
  CreateUomGroupRequest,
  CreateUomGroupResponse,
  UpdateUomGroupRequest,
  UpdateUomGroupResponse,
  ActivateUomGroupRequest,
  ActivateUomGroupResponse,
  DeactivateUomGroupRequest,
  DeactivateUomGroupResponse,
  // Uom
  ListUomsRequest,
  ListUomsResponse,
  GetUomResponse,
  CreateUomRequest,
  CreateUomResponse,
  UpdateUomRequest,
  UpdateUomResponse,
  ActivateUomRequest,
  ActivateUomResponse,
  DeactivateUomRequest,
  DeactivateUomResponse,
  // Suggest
  SuggestUomsRequest,
  SuggestUomsResponse,
} from '../types/bff-contracts';

/**
 * Unit Master BFF Client Interface
 *
 * UI ↔ BFF の通信インターフェース
 * MockBffClient / HttpBffClient で実装
 */
export interface BffClient {
  // ==========================================================================
  // UomGroup Endpoints (6)
  // ==========================================================================

  /** 単位グループ一覧取得 */
  listUomGroups(request: ListUomGroupsRequest): Promise<ListUomGroupsResponse>;

  /** 単位グループ詳細取得 */
  getUomGroup(id: string): Promise<GetUomGroupResponse>;

  /** 単位グループ新規登録（基準単位も同時作成） */
  createUomGroup(request: CreateUomGroupRequest): Promise<CreateUomGroupResponse>;

  /** 単位グループ更新 */
  updateUomGroup(id: string, request: UpdateUomGroupRequest): Promise<UpdateUomGroupResponse>;

  /** 単位グループ有効化 */
  activateUomGroup(id: string, request: ActivateUomGroupRequest): Promise<ActivateUomGroupResponse>;

  /** 単位グループ無効化 */
  deactivateUomGroup(
    id: string,
    request: DeactivateUomGroupRequest,
  ): Promise<DeactivateUomGroupResponse>;

  // ==========================================================================
  // Uom Endpoints (7)
  // ==========================================================================

  /** 単位一覧取得 */
  listUoms(request: ListUomsRequest): Promise<ListUomsResponse>;

  /** 単位詳細取得 */
  getUom(id: string): Promise<GetUomResponse>;

  /** 単位新規登録 */
  createUom(request: CreateUomRequest): Promise<CreateUomResponse>;

  /** 単位更新 */
  updateUom(id: string, request: UpdateUomRequest): Promise<UpdateUomResponse>;

  /** 単位有効化 */
  activateUom(id: string, request: ActivateUomRequest): Promise<ActivateUomResponse>;

  /** 単位無効化 */
  deactivateUom(id: string, request: DeactivateUomRequest): Promise<DeactivateUomResponse>;

  /** 単位サジェスト */
  suggestUoms(request: SuggestUomsRequest): Promise<SuggestUomsResponse>;
}
