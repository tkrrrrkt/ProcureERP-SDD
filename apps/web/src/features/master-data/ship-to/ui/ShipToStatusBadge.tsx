'use client';

import { Badge } from '@/shared/ui/components/badge';

interface ShipToStatusBadgeProps {
  isActive: boolean;
}

/**
 * 納入先有効/無効バッジ
 *
 * Design System準拠:
 * - 有効: bg-success (緑)
 * - 無効: variant="secondary" (グレー)
 */
export function ShipToStatusBadge({ isActive }: ShipToStatusBadgeProps) {
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
