/**
 * Tax Business Category Seed Data
 *
 * 税区分マスタの初期データを投入するシードスクリプト
 * テナントごとに6種類の税区分を作成する
 *
 * SSoT: packages/db/prisma/seed/tax-business-category.seed.ts
 */

import { PrismaClient } from '@prisma/client';

export interface TaxBusinessCategorySeedData {
  taxBusinessCategoryCode: string;
  taxBusinessCategoryName: string;
  description: string;
}

/**
 * 税区分マスターデータ定義
 * design.md で定義された6種類の税区分
 */
export const TAX_BUSINESS_CATEGORY_SEED_DATA: TaxBusinessCategorySeedData[] = [
  {
    taxBusinessCategoryCode: 'TAXABLE_SALES',
    taxBusinessCategoryName: '課税売上',
    description: '消費税が課される売上取引',
  },
  {
    taxBusinessCategoryCode: 'TAXABLE_PURCHASE',
    taxBusinessCategoryName: '課税仕入',
    description: '消費税が課される仕入取引',
  },
  {
    taxBusinessCategoryCode: 'COMMON_TAXABLE_PURCHASE',
    taxBusinessCategoryName: '共通課税仕入',
    description: '課税売上・非課税売上に共通する仕入',
  },
  {
    taxBusinessCategoryCode: 'NON_TAXABLE',
    taxBusinessCategoryName: '非課税取引',
    description: '消費税が課されない取引',
  },
  {
    taxBusinessCategoryCode: 'TAX_EXEMPT',
    taxBusinessCategoryName: '免税取引',
    description: '輸出等の免税取引',
  },
  {
    taxBusinessCategoryCode: 'OUT_OF_SCOPE',
    taxBusinessCategoryName: '対象外取引',
    description: '消費税の対象外となる取引',
  },
];

/**
 * 指定されたテナントに税区分シードデータを投入する
 *
 * @param prisma - PrismaClient インスタンス
 * @param tenantId - テナントID
 * @param createdByLoginAccountId - 作成者のログインアカウントID（省略可）
 */
export async function seedTaxBusinessCategories(
  prisma: PrismaClient,
  tenantId: string,
  createdByLoginAccountId?: string,
): Promise<void> {
  console.log(`[TaxBusinessCategory] Seeding for tenant: ${tenantId}`);

  for (const data of TAX_BUSINESS_CATEGORY_SEED_DATA) {
    await prisma.taxBusinessCategory.upsert({
      where: {
        tenantId_taxBusinessCategoryCode: {
          tenantId,
          taxBusinessCategoryCode: data.taxBusinessCategoryCode,
        },
      },
      update: {
        taxBusinessCategoryName: data.taxBusinessCategoryName,
        description: data.description,
        updatedByLoginAccountId: createdByLoginAccountId,
      },
      create: {
        tenantId,
        taxBusinessCategoryCode: data.taxBusinessCategoryCode,
        taxBusinessCategoryName: data.taxBusinessCategoryName,
        description: data.description,
        isActive: true,
        createdByLoginAccountId: createdByLoginAccountId,
        updatedByLoginAccountId: createdByLoginAccountId,
      },
    });
    console.log(`  - Created/Updated: ${data.taxBusinessCategoryCode}`);
  }

  console.log(`[TaxBusinessCategory] Completed for tenant: ${tenantId}`);
}
