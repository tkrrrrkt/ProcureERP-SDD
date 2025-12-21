'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/components/button';
import { Input } from '@/shared/ui/components/input';
import { Search, Plus } from 'lucide-react';

interface EmployeeSearchBarProps {
  onSearch: (keyword: string) => void;
  onCreateClick: () => void;
}

export function EmployeeSearchBar({ onSearch, onCreateClick }: EmployeeSearchBarProps) {
  const [searchValue, setSearchValue] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, onSearch]);

  return (
    <div className="flex items-center gap-4">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="社員コード・氏名・カナ名で検索"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* New Employee Button */}
      <Button onClick={onCreateClick} className="gap-2">
        <Plus className="h-4 w-4" />
        新規登録
      </Button>
    </div>
  );
}
