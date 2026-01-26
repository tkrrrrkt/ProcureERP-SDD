/**
 * Unit Master BFF Contracts - UI Local Types
 *
 * packages/contracts/src/bff/unit-master から Re-export
 * UI層での型安全性を保証
 */

export type {
  // Sort Options
  UomGroupSortBy,
  UomSortBy,
  SortOrder,

  // UomGroup DTOs
  UomSummaryDto,
  UomGroupDto,
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

  // Uom DTOs
  UomDto,
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

  // Suggest DTOs
  SuggestUomsRequest,
  SuggestUomsResponse,

  // Error Codes
  UnitMasterErrorCode,
} from '@contracts/bff/unit-master';

// Error Code Alias for UI
export type UnitMasterBffErrorCode = UnitMasterErrorCode;
