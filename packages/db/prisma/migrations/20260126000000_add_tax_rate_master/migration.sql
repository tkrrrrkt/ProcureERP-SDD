-- CreateTable: tax_rates（税率マスタ）
CREATE TABLE "tax_rates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "tax_rate_code" TEXT NOT NULL,
    "rate_percent" DECIMAL(5,2) NOT NULL,
    "valid_from" DATE NOT NULL,
    "valid_to" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_login_account_id" TEXT,
    "updated_by_login_account_id" TEXT,

    CONSTRAINT "tax_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable: tax_business_categories（税区分マスタ）
CREATE TABLE "tax_business_categories" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "tax_business_category_code" TEXT NOT NULL,
    "tax_business_category_name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_login_account_id" TEXT,
    "updated_by_login_account_id" TEXT,

    CONSTRAINT "tax_business_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: tax_rates
CREATE UNIQUE INDEX "tax_rates_tenant_id_tax_rate_code_key" ON "tax_rates"("tenant_id", "tax_rate_code");

CREATE INDEX "tax_rates_tenant_id_tax_rate_code_idx" ON "tax_rates"("tenant_id", "tax_rate_code");

CREATE INDEX "tax_rates_tenant_id_is_active_idx" ON "tax_rates"("tenant_id", "is_active");

CREATE INDEX "tax_rates_tenant_id_valid_from_idx" ON "tax_rates"("tenant_id", "valid_from");

-- CreateIndex: tax_business_categories
CREATE UNIQUE INDEX "tax_business_categories_tenant_id_tax_business_category_code_key" ON "tax_business_categories"("tenant_id", "tax_business_category_code");

CREATE INDEX "tax_business_categories_tenant_id_tax_business_category_code_idx" ON "tax_business_categories"("tenant_id", "tax_business_category_code");

CREATE INDEX "tax_business_categories_tenant_id_is_active_idx" ON "tax_business_categories"("tenant_id", "is_active");

-- RLS: Row Level Security for tax_rates
ALTER TABLE "tax_rates" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON "tax_rates"
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

-- RLS: Row Level Security for tax_business_categories
ALTER TABLE "tax_business_categories" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON "tax_business_categories"
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

-- Comments
COMMENT ON TABLE "tax_rates" IS '税率マスタ';
COMMENT ON COLUMN "tax_rates"."tax_rate_code" IS '税率コード（テナント内でユニーク）';
COMMENT ON COLUMN "tax_rates"."rate_percent" IS '税率（%）、作成後変更不可';
COMMENT ON COLUMN "tax_rates"."valid_from" IS '適用開始日';
COMMENT ON COLUMN "tax_rates"."valid_to" IS '適用終了日（NULL=無期限）';
COMMENT ON COLUMN "tax_rates"."version" IS '楽観ロック用バージョン';

COMMENT ON TABLE "tax_business_categories" IS '税区分マスタ（シードデータで初期投入）';
COMMENT ON COLUMN "tax_business_categories"."tax_business_category_code" IS '税区分コード';
COMMENT ON COLUMN "tax_business_categories"."tax_business_category_name" IS '税区分名';
COMMENT ON COLUMN "tax_business_categories"."description" IS '説明';
COMMENT ON COLUMN "tax_business_categories"."version" IS '楽観ロック用バージョン';
