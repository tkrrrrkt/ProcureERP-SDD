'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/shared/ui/components/input';
import { Button } from '@/shared/ui/components/button';
import { Checkbox } from '@/shared/ui/components/checkbox';
import { Label } from '@/shared/ui/components/label';
import { Search, Plus } from 'lucide-react';

interface BankSearchBarProps {
  onSearch: (keyword: string) => void;
  onActiveFilterChange: (activeOnly: boolean) => void;
  onCreateClick: () => void;
  activeOnly?: boolean;
}

export function BankSearchBar({
  onSearch,
  onActiveFilterChange,
  onCreateClick,
  activeOnly = true,
}: BankSearchBarProps) {
  const [inputValue, setInputValue] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, onSearch]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="銀行コード・銀行名で検索..."
            value={inputValue}
            onChange={handleInputChange}
            className="pl-9"
          />
        </div>

        {/* Active Only Checkbox */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="activeOnly"
            checked={activeOnly}
            onCheckedChange={(checked) => onActiveFilterChange(checked === true)}
          />
          <Label htmlFor="activeOnly" className="text-sm cursor-pointer">
            有効のみ表示
          </Label>
        </div>
      </div>

      {/* Create Button */}
      <Button onClick={onCreateClick}>
        <Plus className="h-4 w-4 mr-2" />
        新規登録
      </Button>
    </div>
  );
}
