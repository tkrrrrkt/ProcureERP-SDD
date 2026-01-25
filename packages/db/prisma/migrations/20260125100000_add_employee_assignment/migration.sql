-- CreateTable: employee_assignments（社員所属履歴）
CREATE TABLE "employee_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "department_stable_id" UUID NOT NULL,
    "assignment_type" VARCHAR(20) NOT NULL,
    "allocation_ratio" DECIMAL(5,2),
    "title" VARCHAR(100),
    "effective_date" DATE NOT NULL,
    "expiry_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "created_by_login_account_id" UUID,
    "updated_by_login_account_id" UUID,

    CONSTRAINT "employee_assignments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ea_assignment_type_check" CHECK (assignment_type IN ('primary', 'secondary')),
    CONSTRAINT "ea_date_check" CHECK (expiry_date IS NULL OR expiry_date > effective_date),
    CONSTRAINT "ea_allocation_ratio_check" CHECK (allocation_ratio IS NULL OR (allocation_ratio >= 0 AND allocation_ratio <= 100))
);

-- CreateIndex
CREATE INDEX "idx_ea_tenant_employee" ON "employee_assignments"("tenant_id", "employee_id");
CREATE INDEX "idx_ea_tenant_stable" ON "employee_assignments"("tenant_id", "department_stable_id");
CREATE INDEX "idx_ea_tenant_employee_effective" ON "employee_assignments"("tenant_id", "employee_id", "effective_date");
CREATE INDEX "idx_ea_tenant_active" ON "employee_assignments"("tenant_id", "is_active") WHERE is_active = true;

-- AddForeignKey
ALTER TABLE "employee_assignments" ADD CONSTRAINT "employee_assignments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable RLS
ALTER TABLE "employee_assignments" ENABLE ROW LEVEL SECURITY;

-- CreatePolicy: tenant_isolation
CREATE POLICY "tenant_isolation" ON "employee_assignments"
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- Comments
COMMENT ON TABLE "employee_assignments" IS '社員所属履歴';
COMMENT ON COLUMN "employee_assignments"."department_stable_id" IS '部門stable_id（組織改編耐性）';
COMMENT ON COLUMN "employee_assignments"."assignment_type" IS '所属種別（primary:主務, secondary:兼務）';
COMMENT ON COLUMN "employee_assignments"."allocation_ratio" IS '按分率（%）';
