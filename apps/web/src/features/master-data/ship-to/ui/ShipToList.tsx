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
import { ShipToStatusBadge } from './ShipToStatusBadge';
import type { ShipToDto } from '../types';

interface ShipToListProps {
  items: ShipToDto[];
  isLoading: boolean;
  onRowClick: (shipTo: ShipToDto) => void;
}

/**
 * 納入先一覧テーブル
 *
 * - ローディング中はスケルトン表示
 * - 空の場合はメッセージ表示
 * - 行クリックで編集ダイアログを開く
 */
export function ShipToList({ items, isLoading, onRowClick }: ShipToListProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">コード</TableHead>
              <TableHead>名称</TableHead>
              <TableHead className="w-[100px]">都道府県</TableHead>
              <TableHead className="w-[120px]">担当者</TableHead>
              <TableHead className="w-[80px]">状態</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
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
              <TableHead className="w-[120px]">コード</TableHead>
              <TableHead>名称</TableHead>
              <TableHead className="w-[100px]">都道府県</TableHead>
              <TableHead className="w-[120px]">担当者</TableHead>
              <TableHead className="w-[80px]">状態</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                納入先が見つかりません
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
            <TableHead className="w-[120px]">コード</TableHead>
            <TableHead>名称</TableHead>
            <TableHead className="w-[100px]">都道府県</TableHead>
            <TableHead className="w-[120px]">担当者</TableHead>
            <TableHead className="w-[80px]">状態</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((shipTo) => (
            <TableRow
              key={shipTo.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onRowClick(shipTo)}
            >
              <TableCell className="font-mono text-sm">{shipTo.shipToCode}</TableCell>
              <TableCell className="font-medium">{shipTo.shipToName}</TableCell>
              <TableCell className="text-muted-foreground">{shipTo.prefecture ?? '-'}</TableCell>
              <TableCell className="text-muted-foreground">{shipTo.contactPerson ?? '-'}</TableCell>
              <TableCell>
                <ShipToStatusBadge isActive={shipTo.isActive} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
