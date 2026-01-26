-- CreateTable: item_attributes
CREATE TABLE "item_attributes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "item_attribute_code" VARCHAR(20) NOT NULL,
    "item_attribute_name" VARCHAR(100) NOT NULL,
    "value_type" VARCHAR(20) NOT NULL DEFAULT 'SELECT',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_login_account_id" TEXT,
    "updated_by_login_account_id" TEXT,

    CONSTRAINT "item_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable: item_attribute_values
CREATE TABLE "item_attribute_values" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "item_attribute_id" TEXT NOT NULL,
    "value_code" VARCHAR(30) NOT NULL,
    "value_name" VARCHAR(100) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_login_account_id" TEXT,
    "updated_by_login_account_id" TEXT,

    CONSTRAINT "item_attribute_values_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: item_attributes
CREATE UNIQUE INDEX "item_attributes_tenant_id_item_attribute_code_key" ON "item_attributes"("tenant_id", "item_attribute_code");
CREATE INDEX "item_attributes_tenant_id_item_attribute_code_idx" ON "item_attributes"("tenant_id", "item_attribute_code");
CREATE INDEX "item_attributes_tenant_id_sort_order_idx" ON "item_attributes"("tenant_id", "sort_order");
CREATE INDEX "item_attributes_tenant_id_is_active_idx" ON "item_attributes"("tenant_id", "is_active");

-- CreateIndex: item_attribute_values
CREATE UNIQUE INDEX "item_attribute_values_tenant_id_item_attribute_id_value_code_key" ON "item_attribute_values"("tenant_id", "item_attribute_id", "value_code");
CREATE INDEX "item_attribute_values_tenant_id_item_attribute_id_idx" ON "item_attribute_values"("tenant_id", "item_attribute_id");
CREATE INDEX "item_attribute_values_tenant_id_item_attribute_id_sort_order_idx" ON "item_attribute_values"("tenant_id", "item_attribute_id", "sort_order");
CREATE INDEX "item_attribute_values_tenant_id_item_attribute_id_is_active_idx" ON "item_attribute_values"("tenant_id", "item_attribute_id", "is_active");

-- AddForeignKey: item_attribute_values -> item_attributes
ALTER TABLE "item_attribute_values" ADD CONSTRAINT "item_attribute_values_item_attribute_id_fkey"
    FOREIGN KEY ("item_attribute_id") REFERENCES "item_attributes"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddCheckConstraint: Code format validation (English uppercase + digits + -_)
ALTER TABLE "item_attributes" ADD CONSTRAINT "item_attributes_code_format_check"
    CHECK (item_attribute_code ~ '^[A-Z0-9_-]{1,20}$');

ALTER TABLE "item_attribute_values" ADD CONSTRAINT "item_attribute_values_code_format_check"
    CHECK (value_code ~ '^[A-Z0-9_-]{1,30}$');

-- Enable RLS
ALTER TABLE "item_attributes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "item_attribute_values" ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "tenant_isolation_item_attributes" ON "item_attributes"
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY "tenant_isolation_item_attribute_values" ON "item_attribute_values"
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true));
