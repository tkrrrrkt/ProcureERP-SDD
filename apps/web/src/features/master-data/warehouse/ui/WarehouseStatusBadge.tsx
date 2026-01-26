'use client';

import { Badge } from '@/shared/ui/components/badge';

interface WarehouseStatusBadgeProps {
  isActive: boolean;
}

/**
 * 倉庫有効/無効バッジ
 *
 * Design System準拠:
 * - 有効: bg-success (緑)
 * - 無効: variant="secondary" (グレー)
 */
export function WarehouseStatusBadge({ isActive }: WarehouseStatusBadgeProps) {
  if (isActive) {
    return (
      <Badge className="bg-success text-success-foreground hover:bg-success">
        有効
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="text-muted-foreground">
      無効
    </Badge>
  );
}

interface DefaultReceivingBadgeProps {
  isDefaultReceiving: boolean;
}

/**
 * 既定受入倉庫バッジ
 *
 * Design System準拠:
 * - 既定: variant="default" (primary color)
 * - 非既定: 表示なし
 */
export function DefaultReceivingBadge({ isDefaultReceiving }: DefaultReceivingBadgeProps) {
  if (!isDefaultReceiving) {
    return null;
  }

  return (
    <Badge variant="default" className="bg-primary text-primary-foreground">
      既定
    </Badge>
  );
}
