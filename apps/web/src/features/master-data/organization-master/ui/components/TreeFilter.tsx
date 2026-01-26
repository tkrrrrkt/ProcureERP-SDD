/**
 * ツリーフィルタコンポーネント
 * 部門ツリーの検索・フィルタリング機能を提供
 */

'use client';

import { Input } from '@/shared/ui';
import { Checkbox } from '@/shared/ui';
import { Label } from '@/shared/ui';
import { Search } from 'lucide-react';

interface TreeFilterProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  showInactive: boolean;
  onShowInactiveChange: (value: boolean) => void;
}

export function TreeFilter({
  keyword,
  onKeywordChange,
  showInactive,
  onShowInactiveChange,
}: TreeFilterProps) {
  return (
    <div className="flex flex-col gap-3 p-4 border-b">
      {/* 検索入力 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="部門を検索..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* 無効部門表示チェックボックス */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="show-inactive"
          checked={showInactive}
          onCheckedChange={(checked) => onShowInactiveChange(checked === true)}
        />
        <Label
          htmlFor="show-inactive"
          className="text-sm cursor-pointer select-none"
        >
          無効化された部門も表示
        </Label>
      </div>
    </div>
  );
}
