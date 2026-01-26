'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/components/table';
import { Skeleton } from '@/shared/ui/components/skeleton';
import { WarehouseStatusBadge, DefaultReceivingBadge } from './WarehouseStatusBadge';
import type { WarehouseDto } from '../types';

interface WarehouseListProps {
  items: WarehouseDto[];
  isLoading: boolean;
  onRowClick: (warehouse: WarehouseDto) => void;
}

/**
 * 倉庫一覧テーブル
 *
 * - ローディング中はスケルトン表示
 * - 空の場合はメッセージ表示
 * - 行クリックで編集ダイアログを開く
 * - 既定受入倉庫バッジ表示
 */
export function WarehouseList({ items, isLoading, onRowClick }: WarehouseListProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">コード</TableHead>
              <TableHead>名称</TableHead>
              <TableHead className="w-[100px]">都道府県</TableHead>
              <TableHead className="w-[80px]">既定</TableHead>
              <TableHead className="w-[80px]">状態</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                <TableCell><Skeleton className="h-5 w-12" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">コード</TableHead>
              <TableHead>名称</TableHead>
              <TableHead className="w-[100px]">都道府県</TableHead>
              <TableHead className="w-[80px]">既定</TableHead>
              <TableHead className="w-[80px]">状態</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                倉庫が見つかりません
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">コード</TableHead>
            <TableHead>名称</TableHead>
            <TableHead className="w-[100px]">都道府県</TableHead>
            <TableHead className="w-[80px]">既定</TableHead>
            <TableHead className="w-[80px]">状態</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((warehouse) => (
            <TableRow
              key={warehouse.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onRowClick(warehouse)}
            >
              <TableCell className="font-mono text-sm">{warehouse.warehouseCode}</TableCell>
              <TableCell className="font-medium">{warehouse.warehouseName}</TableCell>
              <TableCell className="text-muted-foreground">{warehouse.prefecture ?? '-'}</TableCell>
              <TableCell>
                <DefaultReceivingBadge isDefaultReceiving={warehouse.isDefaultReceiving} />
              </TableCell>
              <TableCell>
                <WarehouseStatusBadge isActive={warehouse.isActive} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
