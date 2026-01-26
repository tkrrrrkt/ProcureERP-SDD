import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TaxBusinessCategory } from '@prisma/client';

/**
 * Tax Business Category Repository
 *
 * DBアクセス層（tenant_id double-guard）
 * 税区分一覧取得（ドロップダウン用）
 */
@Injectable()
export class TaxBusinessCategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 有効な税区分一覧取得
   */
  async findManyActive(params: {
    tenantId: string;
  }): Promise<TaxBusinessCategory[]> {
    const { tenantId } = params;

    return this.prisma.taxBusinessCategory.findMany({
      where: {
        tenantId, // tenant_id guard
        isActive: true,
      },
      orderBy: {
        taxBusinessCategoryCode: 'asc',
      },
    });
  }

  /**
   * 税区分詳細取得（ID指定）
   */
  async findById(params: {
    tenantId: string;
    taxBusinessCategoryId: string;
  }): Promise<TaxBusinessCategory | null> {
    const { tenantId, taxBusinessCategoryId } = params;

    return this.prisma.taxBusinessCategory.findFirst({
      where: {
        id: taxBusinessCategoryId,
        tenantId, // tenant_id guard
      },
    });
  }
}
