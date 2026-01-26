'use client';

import { Button } from '@/shared/ui/components/button';
import { Checkbox } from '@/shared/ui/components/checkbox';
import { Label } from '@/shared/ui/components/label';
import { Plus } from 'lucide-react';

interface CompanyBankAccountSearchBarProps {
  activeOnly: boolean;
  onActiveOnlyChange: (value: boolean) => void;
  onCreateClick: () => void;
}

/**
 * Company Bank Account Search Bar Component
 */
export function CompanyBankAccountSearchBar({
  activeOnly,
  onActiveOnlyChange,
  onCreateClick,
}: CompanyBankAccountSearchBarProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="activeOnly"
            checked={activeOnly}
            onCheckedChange={(checked) => onActiveOnlyChange(checked === true)}
          />
          <Label htmlFor="activeOnly" className="text-sm cursor-pointer">
            有効な口座のみ表示
          </Label>
        </div>
      </div>

      <Button onClick={onCreateClick}>
        <Plus className="h-4 w-4 mr-2" />
        新規登録
      </Button>
    </div>
  );
}
