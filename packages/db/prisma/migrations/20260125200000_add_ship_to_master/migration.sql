-- CreateTable
CREATE TABLE "ship_tos" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "ship_to_code" VARCHAR(10) NOT NULL,
    "ship_to_name" VARCHAR(100) NOT NULL,
    "ship_to_name_kana" VARCHAR(200),
    "customer_site_id" TEXT,
    "postal_code" VARCHAR(10),
    "prefecture" VARCHAR(20),
    "city" VARCHAR(50),
    "address_1" VARCHAR(100),
    "address_2" VARCHAR(100),
    "phone_number" VARCHAR(20),
    "fax_number" VARCHAR(20),
    "email" VARCHAR(254),
    "contact_person" VARCHAR(50),
    "remarks" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_login_account_id" TEXT,
    "updated_by_login_account_id" TEXT,

    CONSTRAINT "ship_tos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ship_tos_tenant_id_ship_to_code_idx" ON "ship_tos"("tenant_id", "ship_to_code");

-- CreateIndex
CREATE INDEX "ship_tos_tenant_id_ship_to_name_idx" ON "ship_tos"("tenant_id", "ship_to_name");

-- CreateIndex
CREATE INDEX "ship_tos_tenant_id_is_active_idx" ON "ship_tos"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "ship_tos_tenant_id_customer_site_id_idx" ON "ship_tos"("tenant_id", "customer_site_id");

-- CreateIndex
CREATE UNIQUE INDEX "ship_tos_tenant_id_ship_to_code_key" ON "ship_tos"("tenant_id", "ship_to_code");

-- RLS Policy (Enable Row Level Security)
ALTER TABLE "ship_tos" ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Tenant Isolation
CREATE POLICY "tenant_isolation" ON "ship_tos"
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::text);
