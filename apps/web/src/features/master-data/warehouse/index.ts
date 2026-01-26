/**
 * Warehouse Master Feature
 *
 * 倉庫マスタ機能の公開エクスポート
 */

// UI Components
export { WarehouseListPage } from './ui/WarehouseListPage';
export { WarehouseList } from './ui/WarehouseList';
export { WarehouseDialog } from './ui/WarehouseDialog';
export { WarehouseSearchBar } from './ui/WarehouseSearchBar';
export { WarehouseStatusBadge, DefaultReceivingBadge } from './ui/WarehouseStatusBadge';

// Hooks
export { useWarehouseList, useWarehouse } from './hooks/useWarehouseList';
export { useWarehouseForm } from './hooks/useWarehouseForm';

// API Clients
export type { BffClient } from './api/BffClient';
export { getMockBffClient } from './api/MockBffClient';
// Phase UI-BFF: export { getHttpBffClient } from './api/HttpBffClient';

// Types
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
  BffError,
} from './types';

export { WarehouseErrorCode, WarehouseErrorMessage, prefectureOptions } from './types';
