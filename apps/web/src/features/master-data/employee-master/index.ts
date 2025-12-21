/**
 * Employee Master Feature
 * 社員マスタ機能のエントリーポイント
 */

// UI Components
export { EmployeeMasterPage } from './ui/EmployeeMasterPage';
export { EmployeeList } from './ui/EmployeeList';
export { EmployeeSearchBar } from './ui/EmployeeSearchBar';
export { EmployeeFormDialog } from './ui/EmployeeFormDialog';

// API Clients
export { MockBffClient } from './api/MockBffClient';
export { HttpBffClient } from './api/HttpBffClient';

// Types (re-exported from contracts)
export type {
  BffClient,
  EmployeeDto,
  EmployeeSortBy,
  SortOrder,
  ListEmployeesRequest,
  ListEmployeesResponse,
  GetEmployeeResponse,
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  UpdateEmployeeRequest,
  UpdateEmployeeResponse,
} from './api/BffClient';

// Utils
export { formatDate, toISODateString, isValidDate } from './lib/date-utils';
