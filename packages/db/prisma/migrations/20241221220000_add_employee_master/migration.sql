-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "employee_code" TEXT NOT NULL,
    "employee_name" TEXT NOT NULL,
    "employee_kana_name" TEXT NOT NULL,
    "email" TEXT,
    "join_date" TIMESTAMP(3) NOT NULL,
    "retire_date" TIMESTAMP(3),
    "remarks" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_tenant_id_employee_code_key" ON "employees"("tenant_id", "employee_code");

-- CreateIndex
CREATE INDEX "employees_tenant_id_employee_code_idx" ON "employees"("tenant_id", "employee_code");

-- CreateIndex
CREATE INDEX "employees_tenant_id_is_active_idx" ON "employees"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "employees_tenant_id_join_date_idx" ON "employees"("tenant_id", "join_date");

-- Enable Row Level Security
ALTER TABLE "employees" ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy: Tenant Isolation
CREATE POLICY "tenant_isolation" ON "employees"
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

