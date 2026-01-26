-- CreateTable: organization_versions（組織バージョン）
CREATE TABLE "organization_versions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "version_code" TEXT NOT NULL,
    "version_name" TEXT NOT NULL,
    "effective_date" DATE NOT NULL,
    "expiry_date" DATE,
    "base_version_id" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "organization_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: departments（部門マスタ）
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "version_id" TEXT NOT NULL,
    "stable_id" TEXT NOT NULL,
    "department_code" TEXT NOT NULL,
    "department_name" TEXT NOT NULL,
    "department_name_short" TEXT,
    "parent_id" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "hierarchy_level" INTEGER NOT NULL DEFAULT 1,
    "hierarchy_path" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "postal_code" TEXT,
    "address_line1" TEXT,
    "address_line2" TEXT,
    "phone_number" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: organization_versions
CREATE UNIQUE INDEX "organization_versions_tenant_id_version_code_key" ON "organization_versions"("tenant_id", "version_code");

CREATE INDEX "organization_versions_tenant_id_idx" ON "organization_versions"("tenant_id");

CREATE INDEX "organization_versions_tenant_id_effective_date_idx" ON "organization_versions"("tenant_id", "effective_date");

-- CreateIndex: departments
CREATE UNIQUE INDEX "departments_tenant_id_version_id_department_code_key" ON "departments"("tenant_id", "version_id", "department_code");

CREATE UNIQUE INDEX "departments_tenant_id_stable_id_key" ON "departments"("tenant_id", "stable_id");

CREATE INDEX "departments_tenant_id_version_id_idx" ON "departments"("tenant_id", "version_id");

CREATE INDEX "departments_tenant_id_version_id_parent_id_idx" ON "departments"("tenant_id", "version_id", "parent_id");

CREATE INDEX "departments_tenant_id_stable_id_idx" ON "departments"("tenant_id", "stable_id");

CREATE INDEX "departments_tenant_id_hierarchy_path_idx" ON "departments"("tenant_id", "hierarchy_path");

-- AddForeignKey: organization_versions self-reference (base_version_id)
ALTER TABLE "organization_versions" ADD CONSTRAINT "organization_versions_base_version_id_fkey"
    FOREIGN KEY ("base_version_id") REFERENCES "organization_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: departments -> organization_versions
ALTER TABLE "departments" ADD CONSTRAINT "departments_version_id_fkey"
    FOREIGN KEY ("version_id") REFERENCES "organization_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: departments self-reference (parent_id)
ALTER TABLE "departments" ADD CONSTRAINT "departments_parent_id_fkey"
    FOREIGN KEY ("parent_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RLS: Row Level Security for organization_versions
ALTER TABLE "organization_versions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON "organization_versions"
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

-- RLS: Row Level Security for departments
ALTER TABLE "departments" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON "departments"
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

-- Comments
COMMENT ON TABLE "organization_versions" IS '組織バージョン（組織構造のスナップショット）';
COMMENT ON COLUMN "organization_versions"."version_code" IS 'バージョンコード（例: 2025-04）';
COMMENT ON COLUMN "organization_versions"."effective_date" IS '有効開始日';
COMMENT ON COLUMN "organization_versions"."expiry_date" IS '有効終了日（NULL=無期限）';
COMMENT ON COLUMN "organization_versions"."base_version_id" IS 'コピー元バージョンID';

COMMENT ON TABLE "departments" IS '部門マスタ';
COMMENT ON COLUMN "departments"."stable_id" IS '版非依存の追跡キー（組織改編を跨いで同一部門を識別）';
COMMENT ON COLUMN "departments"."hierarchy_path" IS '階層パス（例: /ROOT/SALES_HQ/TEAM1）';
COMMENT ON COLUMN "departments"."hierarchy_level" IS '階層レベル（ルート=1）';
COMMENT ON COLUMN "departments"."postal_code" IS '郵便番号';
COMMENT ON COLUMN "departments"."address_line1" IS '住所1（都道府県・市区町村）';
COMMENT ON COLUMN "departments"."address_line2" IS '住所2（建物名等）';
COMMENT ON COLUMN "departments"."phone_number" IS '電話番号';
