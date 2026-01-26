/**
 * Organization Master - Version Hooks
 *
 * TanStack Query v5 hooks for version operations
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
  ListVersionsRequest,
  ListVersionsResponse,
  GetVersionResponse,
  CreateVersionRequest,
  CreateVersionResponse,
  CopyVersionRequest,
  CopyVersionResponse,
  UpdateVersionRequest,
  UpdateVersionResponse,
} from '@contracts/bff/organization-master';

// =============================================================================
// Query Keys
// =============================================================================

export const versionKeys = {
  all: ['organization-master', 'versions'] as const,
  lists: () => [...versionKeys.all, 'list'] as const,
  list: (filters: ListVersionsRequest) =>
    [...versionKeys.lists(), filters] as const,
  details: () => [...versionKeys.all, 'detail'] as const,
  detail: (id: string) => [...versionKeys.details(), id] as const,
};

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * バージョン一覧取得
 */
export function useVersionList(
  request: ListVersionsRequest = {}
): UseQueryResult<ListVersionsResponse, Error> {
  const client = getSharedBffClient();

  return useQuery({
    queryKey: versionKeys.list(request),
    queryFn: () => client.listVersions(request),
  });
}

/**
 * バージョン詳細取得
 */
export function useVersionDetail(
  versionId: string
): UseQueryResult<GetVersionResponse, Error> {
  const client = getSharedBffClient();

  return useQuery({
    queryKey: versionKeys.detail(versionId),
    queryFn: () => client.getVersion(versionId),
    enabled: !!versionId,
  });
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * バージョン新規作成
 */
export function useCreateVersion(): UseMutationResult<
  CreateVersionResponse,
  Error,
  CreateVersionRequest
> {
  const queryClient = useQueryClient();
  const client = getSharedBffClient();

  return useMutation({
    mutationFn: (request: CreateVersionRequest) =>
      client.createVersion(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: versionKeys.lists() });
      toast.success(`バージョン「${data.version.versionName}」を作成しました`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/**
 * バージョンコピー
 */
export function useCopyVersion(): UseMutationResult<
  CopyVersionResponse,
  Error,
  { sourceVersionId: string; request: CopyVersionRequest }
> {
  const queryClient = useQueryClient();
  const client = getSharedBffClient();

  return useMutation({
    mutationFn: ({ sourceVersionId, request }) =>
      client.copyVersion(sourceVersionId, request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: versionKeys.lists() });
      toast.success(`バージョン「${data.version.versionName}」をコピーしました`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/**
 * バージョン更新
 */
export function useUpdateVersion(): UseMutationResult<
  UpdateVersionResponse,
  Error,
  { versionId: string; request: UpdateVersionRequest }
> {
  const queryClient = useQueryClient();
  const client = getSharedBffClient();

  return useMutation({
    mutationFn: ({ versionId, request }) =>
      client.updateVersion(versionId, request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: versionKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: versionKeys.detail(data.version.id),
      });
      toast.success('バージョンを更新しました');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
