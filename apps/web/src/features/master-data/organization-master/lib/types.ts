/**
 * Organization Master Feature - UI Types
 *
 * BFF Contracts からの型を再エクスポートし、UI固有の型を定義
 * SSoT: packages/contracts/src/bff/organization-master
 */

// =============================================================================
// Re-export from BFF Contracts (SSoT)
// =============================================================================
export type {
  // Sort Types
  VersionSortBy,
  DepartmentSortBy,
  SortOrder,
  // Version DTOs
  VersionSummaryDto,
  VersionDetailDto,
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
  // Department DTOs
  DepartmentTreeNodeDto,
  DepartmentDetailDto,
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

// =============================================================================
// BFF Error Types
// =============================================================================

/**
 * BFFエラーコード（Organization Master用）
 */
export type BffErrorCode =
  | 'VERSION_NOT_FOUND'
  | 'VERSION_CODE_DUPLICATE'
  | 'DEPARTMENT_NOT_FOUND'
  | 'DEPARTMENT_CODE_DUPLICATE'
  | 'CIRCULAR_REFERENCE_DETECTED'
  | 'PARENT_DEPARTMENT_NOT_FOUND'
  | 'DEPARTMENT_HAS_CHILDREN'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * BFFエラーレスポンス形式
 */
export interface BffError {
  code: BffErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * エラーコードに対応するUIメッセージ
 */
export const ERROR_MESSAGES: Record<BffErrorCode, string> = {
  VERSION_NOT_FOUND: 'バージョンが見つかりません',
  VERSION_CODE_DUPLICATE: '同じバージョンコードが既に存在します',
  DEPARTMENT_NOT_FOUND: '部門が見つかりません',
  DEPARTMENT_CODE_DUPLICATE: '同じ部門コードが既に存在します',
  CIRCULAR_REFERENCE_DETECTED: '循環参照が検出されました',
  PARENT_DEPARTMENT_NOT_FOUND: '親部門が見つかりません',
  DEPARTMENT_HAS_CHILDREN: '子部門が存在するため削除できません',
  VALIDATION_ERROR: '入力内容に問題があります',
  UNKNOWN_ERROR: '予期しないエラーが発生しました',
};

/**
 * BFFエラーからUIメッセージを取得
 */
export function getErrorMessage(error: BffError | unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const bffError = error as BffError;
    return ERROR_MESSAGES[bffError.code] ?? ERROR_MESSAGES.UNKNOWN_ERROR;
  }
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

// =============================================================================
// UI State Types
// =============================================================================

/**
 * 詳細パネルの表示状態
 */
export type DetailPanelType = 'version' | 'department' | null;

/**
 * 詳細パネルの状態管理
 */
export interface DetailPanelState {
  type: DetailPanelType;
  id: string | null;
  isEditing: boolean;
}

/**
 * バージョンダイアログの状態
 */
export interface VersionDialogState {
  isOpen: boolean;
  mode: 'create' | 'copy';
  sourceId?: string;
}

/**
 * 部門ダイアログの状態
 */
export interface DepartmentDialogState {
  isOpen: boolean;
  parentId: string | null;
  parentName: string | null;
}

/**
 * @deprecated Use VersionDialogState or DepartmentDialogState instead
 */
export interface DialogState {
  isOpen: boolean;
  mode: 'create' | 'copy';
  sourceId?: string;
  parentId?: string;
  parentName?: string;
}
