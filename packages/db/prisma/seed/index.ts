/**
 * Prisma Seed Entry Point
 *
 * マスタデータの初期投入を行うシードスクリプトのエントリポイント
 * 実行: npx prisma db seed
 *
 * SSoT: packages/db/prisma/seed/index.ts
 */

import { PrismaClient } from '@prisma/client';
import { seedTaxBusinessCategories } from './tax-business-category.seed';

const prisma = new PrismaClient();

/**
 * 開発用デフォルトテナントID
 * 本番環境では環境変数または引数で指定する
 */
const DEFAULT_TENANT_ID = process.env.SEED_TENANT_ID || 'dev-tenant-001';
const DEFAULT_USER_ID = process.env.SEED_USER_ID || 'system';

async function main() {
  console.log('='.repeat(60));
  console.log('Starting database seed...');
  console.log(`Tenant ID: ${DEFAULT_TENANT_ID}`);
  console.log('='.repeat(60));

  // Tax Business Category シード
  await seedTaxBusinessCategories(prisma, DEFAULT_TENANT_ID, DEFAULT_USER_ID);

  console.log('='.repeat(60));
  console.log('Database seed completed successfully!');
  console.log('='.repeat(60));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
