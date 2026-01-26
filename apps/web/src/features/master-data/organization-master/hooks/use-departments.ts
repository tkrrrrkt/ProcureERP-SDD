/**
 * Organization Master - Department Hooks
 *
 * TanStack Query v5 hooks for department operations
 */

'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSharedBffClient } from '../api/client';
import { getErrorMessage } from '../lib/types';
import type {
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
// Query Keys
// =============================================================================

export const departmentKeys = {
  all: ['organization-master', 'departments'] as const,
  trees: () => [...departmentKeys.all, 'tree'] as const,
  tree: (versionId: string, filters: ListDepartmentsTreeRequest) =>
    [...departmentKeys.trees(), versionId, filters] as const,
  details: () => [...departmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...departmentKeys.details(), id] as const,
};

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * 部門ツリー取得
 */
export function useDepartmentTree(
  versionId: string,
  request: ListDepartmentsTreeRequest = {}
): UseQueryResult<ListDepartmentsTreeResponse, Error> {
  const client = getSharedBffClient();

  return useQuery({
    queryKey: departmentKeys.tree(versionId, request),
    queryFn: () => client.listDepartmentsTree(versionId, request),
    enabled: !!versionId,
  });
}

/**
 * 部門詳細取得
 */
export function useDepartmentDetail(
  departmentId: string
): UseQueryResult<GetDepartmentResponse, Error> {
  const client = getSharedBffClient();

  return useQuery({
    queryKey: departmentKeys.detail(departmentId),
    queryFn: () => client.getDepartment(departmentId),
    enabled: !!departmentId,
  });
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * 部門新規作成
 */
export function useCreateDepartment(): UseMutationResult<
  CreateDepartmentResponse,
  Error,
  { versionId: string; request: CreateDepartmentRequest }
> {
  const queryClient = useQueryClient();
  const client = getSharedBffClient();

  return useMutation({
    mutationFn: ({ versionId, request }) =>
      client.createDepartment(versionId, request),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: departmentKeys.trees(),
      });
      toast.success(
        `部門「${data.department.departmentName}」を作成しました`
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/**
 * 部門更新
 */
export function useUpdateDepartment(): UseMutationResult<
  UpdateDepartmentResponse,
  Error,
  { departmentId: string; request: UpdateDepartmentRequest }
> {
  const queryClient = useQueryClient();
  const client = getSharedBffClient();

  return useMutation({
    mutationFn: ({ departmentId, request }) =>
      client.updateDepartment(departmentId, request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: departmentKeys.trees(),
      });
      queryClient.invalidateQueries({
        queryKey: departmentKeys.detail(data.department.id),
      });
      toast.success('部門を更新しました');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/**
 * 部門移動（ドラッグ＆ドロップ）
 */
export function useMoveDepartment(): UseMutationResult<
  MoveDepartmentResponse,
  Error,
  { departmentId: string; request: MoveDepartmentRequest }
> {
  const queryClient = useQueryClient();
  const client = getSharedBffClient();

  return useMutation({
    mutationFn: ({ departmentId, request }) =>
      client.moveDepartment(departmentId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: departmentKeys.trees(),
      });
      toast.success('部門を移動しました');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/**
 * 部門無効化
 */
export function useDeactivateDepartment(): UseMutationResult<
  DeactivateDepartmentResponse,
  Error,
  string
> {
  const queryClient = useQueryClient();
  const client = getSharedBffClient();

  return useMutation({
    mutationFn: (departmentId: string) =>
      client.deactivateDepartment(departmentId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: departmentKeys.trees(),
      });
      queryClient.invalidateQueries({
        queryKey: departmentKeys.detail(data.department.id),
      });
      toast.success(
        `部門「${data.department.departmentName}」を無効化しました`
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/**
 * 部門有効化
 */
export function useReactivateDepartment(): UseMutationResult<
  ReactivateDepartmentResponse,
  Error,
  string
> {
  const queryClient = useQueryClient();
  const client = getSharedBffClient();

  return useMutation({
    mutationFn: (departmentId: string) =>
      client.reactivateDepartment(departmentId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: departmentKeys.trees(),
      });
      queryClient.invalidateQueries({
        queryKey: departmentKeys.detail(data.department.id),
      });
      toast.success(
        `部門「${data.department.departmentName}」を有効化しました`
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
