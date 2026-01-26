'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/shared/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/select';
import type { ShipToSortBy, SortOrder } from '../types';

interface ShipToSearchBarProps {
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  isActiveFilter: boolean | undefined;
  onIsActiveFilterChange: (isActive: boolean | undefined) => void;
  sortBy: ShipToSortBy;
  onSortByChange: (sortBy: ShipToSortBy) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (sortOrder: SortOrder) => void;
}

/**
 * 納入先検索バー
 *
 * - キーワード検索（300ms debounce）
 * - 有効/無効フィルタ
 * - ソート切り替え
 */
export function ShipToSearchBar({
  keyword,
  onKeywordChange,
  isActiveFilter,
  onIsActiveFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: ShipToSearchBarProps) {
  const [inputValue, setInputValue] = useState(keyword);

  // debounce keyword input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      onKeywordChange(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, onKeywordChange]);

  const handleStatusChange = (value: string) => {
    if (value === 'all') {
      onIsActiveFilterChange(undefined);
    } else if (value === 'active') {
      onIsActiveFilterChange(true);
    } else {
      onIsActiveFilterChange(false);
    }
  };

  const statusValue = isActiveFilter === undefined ? 'all' : isActiveFilter ? 'active' : 'inactive';

  const handleSortChange = (value: string) => {
    const [field, order] = value.split('-') as [ShipToSortBy, SortOrder];
    onSortByChange(field);
    onSortOrderChange(order);
  };

  const sortValue = `${sortBy}-${sortOrder}`;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="コード、名称、カナで検索..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex gap-2">
        <Select value={statusValue} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="状態" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="active">有効</SelectItem>
            <SelectItem value="inactive">無効</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortValue} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="並び順" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="shipToCode-asc">コード (昇順)</SelectItem>
            <SelectItem value="shipToCode-desc">コード (降順)</SelectItem>
            <SelectItem value="shipToName-asc">名称 (昇順)</SelectItem>
            <SelectItem value="shipToName-desc">名称 (降順)</SelectItem>
            <SelectItem value="shipToNameKana-asc">カナ (昇順)</SelectItem>
            <SelectItem value="shipToNameKana-desc">カナ (降順)</SelectItem>
            <SelectItem value="prefecture-asc">都道府県 (昇順)</SelectItem>
            <SelectItem value="prefecture-desc">都道府県 (降順)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
