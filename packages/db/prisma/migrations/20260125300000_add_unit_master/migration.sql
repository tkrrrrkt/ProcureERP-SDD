-- CreateTable: uom_groups
CREATE TABLE "uom_groups" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "uom_group_code" VARCHAR(10) NOT NULL,
    "uom_group_name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "base_uom_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_login_account_id" TEXT,
    "updated_by_login_account_id" TEXT,

    CONSTRAINT "uom_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable: uoms
CREATE TABLE "uoms" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "uom_group_id" TEXT NOT NULL,
    "uom_code" VARCHAR(10) NOT NULL,
    "uom_name" VARCHAR(100) NOT NULL,
    "uom_symbol" VARCHAR(20),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_login_account_id" TEXT,
    "updated_by_login_account_id" TEXT,

    CONSTRAINT "uoms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: uom_groups
CREATE UNIQUE INDEX "uom_groups_tenant_id_uom_group_code_key" ON "uom_groups"("tenant_id", "uom_group_code");
CREATE INDEX "uom_groups_tenant_id_idx" ON "uom_groups"("tenant_id");
CREATE INDEX "uom_groups_tenant_id_uom_group_code_idx" ON "uom_groups"("tenant_id", "uom_group_code");
CREATE INDEX "uom_groups_tenant_id_is_active_idx" ON "uom_groups"("tenant_id", "is_active");

-- CreateIndex: uoms
CREATE UNIQUE INDEX "uoms_tenant_id_uom_code_key" ON "uoms"("tenant_id", "uom_code");
CREATE INDEX "uoms_tenant_id_idx" ON "uoms"("tenant_id");
CREATE INDEX "uoms_tenant_id_uom_group_id_idx" ON "uoms"("tenant_id", "uom_group_id");
CREATE INDEX "uoms_tenant_id_uom_code_idx" ON "uoms"("tenant_id", "uom_code");
CREATE INDEX "uoms_tenant_id_is_active_idx" ON "uoms"("tenant_id", "is_active");

-- AddForeignKey: Circular reference with DEFERRABLE INITIALLY DEFERRED
-- This allows inserting UomGroup and Uom in the same transaction
ALTER TABLE "uom_groups" ADD CONSTRAINT "uom_groups_base_uom_id_fkey"
    FOREIGN KEY ("base_uom_id") REFERENCES "uoms"("id")
    ON DELETE NO ACTION ON UPDATE NO ACTION
    DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "uoms" ADD CONSTRAINT "uoms_uom_group_id_fkey"
    FOREIGN KEY ("uom_group_id") REFERENCES "uom_groups"("id")
    ON DELETE NO ACTION ON UPDATE NO ACTION
    DEFERRABLE INITIALLY DEFERRED;

-- AddCheckConstraint: Code format validation (English uppercase + digits + -_)
ALTER TABLE "uom_groups" ADD CONSTRAINT "uom_groups_code_format_check"
    CHECK (uom_group_code ~ '^[A-Z0-9_-]{1,10}$');

ALTER TABLE "uoms" ADD CONSTRAINT "uoms_code_format_check"
    CHECK (uom_code ~ '^[A-Z0-9_-]{1,10}$');

-- Enable RLS
ALTER TABLE "uom_groups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "uoms" ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "tenant_isolation_uom_groups" ON "uom_groups"
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY "tenant_isolation_uoms" ON "uoms"
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true));
