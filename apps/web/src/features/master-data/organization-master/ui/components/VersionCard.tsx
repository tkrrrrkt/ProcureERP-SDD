/**
 * バージョンカードコンポーネント
 * 個別バージョンの表示
 */

'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/shared/ui';
import { Badge } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { Copy } from 'lucide-react';
import { formatDate } from '../../lib/date-utils';
import type { VersionSummaryDto } from '@contracts/bff/organization-master';

interface VersionCardProps {
  version: VersionSummaryDto;
  isSelected: boolean;
  onSelect: (versionId: string) => void;
  onCopy: (versionId: string) => void;
}

export function VersionCard({
  version,
  isSelected,
  onSelect,
  onCopy,
}: VersionCardProps) {
  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy(version.id);
  };

  return (
    <Card
      className={cn(
        'w-[90%] cursor-pointer transition-all hover:bg-muted/50 hover:shadow-sm',
        isSelected && 'ring-2 ring-primary bg-primary/5'
      )}
      onClick={() => onSelect(version.id)}
    >
      <CardContent className="px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            {/* バージョンコードとバッジ */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">
                {version.versionCode}
              </span>
              {version.isCurrentlyEffective && (
                <Badge className="bg-success text-success-foreground text-xs px-1.5 py-0">
                  有効
                </Badge>
              )}
            </div>

            {/* バージョン名と期間 */}
            <h3 className="font-medium text-sm truncate">
              {version.versionName}
            </h3>
            <div className="text-xs text-muted-foreground">
              {formatDate(version.effectiveDate)}
              {version.expiryDate && ` 〜 ${formatDate(version.expiryDate)}`}
            </div>
          </div>

          {/* コピーボタン */}
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 shrink-0"
            onClick={handleCopyClick}
            title="このバージョンをコピー"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
