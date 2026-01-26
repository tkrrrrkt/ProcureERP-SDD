/**
 * Ship-To Master Feature
 * 納入先マスタ機能のエントリーポイント
 */

// UI Components
export { ShipToListPage } from './ui/ShipToListPage';
export { ShipToList } from './ui/ShipToList';
export { ShipToSearchBar } from './ui/ShipToSearchBar';
export { ShipToDialog } from './ui/ShipToDialog';
export { ShipToStatusBadge } from './ui/ShipToStatusBadge';

// API Clients
export { MockBffClient, getMockBffClient } from './api/MockBffClient';
export { HttpBffClient, getHttpBffClient } from './api/HttpBffClient';

// Hooks
export { useShipToList, useShipTo } from './hooks/useShipToList';
export { useShipToForm } from './hooks/useShipToForm';

// Types (re-exported from contracts)
export type {
  BffClient,
  BffError,
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
} from './types';

export {
  ShipToErrorCode,
  ShipToErrorHttpStatus,
  ShipToErrorMessage,
  prefectureOptions,
} from './types';
