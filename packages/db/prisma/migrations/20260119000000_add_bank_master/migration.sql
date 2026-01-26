-- CreateTable: banks（銀行マスタ）
CREATE TABLE "banks" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "bank_code" VARCHAR(4) NOT NULL,
    "bank_name" VARCHAR(100) NOT NULL,
    "bank_name_kana" VARCHAR(150),
    "swift_code" VARCHAR(11),
    "display_order" INTEGER NOT NULL DEFAULT 1000,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_login_account_id" TEXT,
    "updated_by_login_account_id" TEXT,

    CONSTRAINT "banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable: bank_branches（支店マスタ）
CREATE TABLE "bank_branches" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "bank_id" TEXT NOT NULL,
    "branch_code" VARCHAR(3) NOT NULL,
    "branch_name" VARCHAR(100) NOT NULL,
    "branch_name_kana" VARCHAR(150),
    "display_order" INTEGER NOT NULL DEFAULT 1000,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_login_account_id" TEXT,
    "updated_by_login_account_id" TEXT,

    CONSTRAINT "bank_branches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: banks
CREATE UNIQUE INDEX "banks_tenant_id_bank_code_key" ON "banks"("tenant_id", "bank_code");

CREATE INDEX "banks_tenant_id_bank_code_idx" ON "banks"("tenant_id", "bank_code");

CREATE INDEX "banks_tenant_id_display_order_idx" ON "banks"("tenant_id", "display_order");

CREATE INDEX "banks_tenant_id_is_active_idx" ON "banks"("tenant_id", "is_active");

CREATE INDEX "banks_tenant_id_bank_name_kana_idx" ON "banks"("tenant_id", "bank_name_kana");

-- CreateIndex: bank_branches
CREATE UNIQUE INDEX "bank_branches_tenant_id_bank_id_branch_code_key" ON "bank_branches"("tenant_id", "bank_id", "branch_code");

CREATE INDEX "bank_branches_tenant_id_bank_id_branch_code_idx" ON "bank_branches"("tenant_id", "bank_id", "branch_code");

CREATE INDEX "bank_branches_tenant_id_bank_id_display_order_idx" ON "bank_branches"("tenant_id", "bank_id", "display_order");

CREATE INDEX "bank_branches_tenant_id_bank_id_is_active_idx" ON "bank_branches"("tenant_id", "bank_id", "is_active");

CREATE INDEX "bank_branches_tenant_id_bank_id_branch_name_kana_idx" ON "bank_branches"("tenant_id", "bank_id", "branch_name_kana");

-- AddForeignKey: bank_branches -> banks
ALTER TABLE "bank_branches" ADD CONSTRAINT "bank_branches_bank_id_fkey"
    FOREIGN KEY ("bank_id") REFERENCES "banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RLS: Row Level Security for banks
ALTER TABLE "banks" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON "banks"
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

-- RLS: Row Level Security for bank_branches
ALTER TABLE "bank_branches" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON "bank_branches"
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

-- Comments
COMMENT ON TABLE "banks" IS '銀行マスタ';
COMMENT ON COLUMN "banks"."bank_code" IS '銀行コード（全銀協コード4桁）';
COMMENT ON COLUMN "banks"."bank_name" IS '銀行名';
COMMENT ON COLUMN "banks"."bank_name_kana" IS '銀行名カナ（半角カタカナ）';
COMMENT ON COLUMN "banks"."swift_code" IS 'SWIFTコード（将来対応用、8-11桁）';
COMMENT ON COLUMN "banks"."display_order" IS '表示順（小さい順に表示）';
COMMENT ON COLUMN "banks"."version" IS '楽観ロック用バージョン';

COMMENT ON TABLE "bank_branches" IS '支店マスタ';
COMMENT ON COLUMN "bank_branches"."branch_code" IS '支店コード（全銀協コード3桁）';
COMMENT ON COLUMN "bank_branches"."branch_name" IS '支店名';
COMMENT ON COLUMN "bank_branches"."branch_name_kana" IS '支店名カナ（半角カタカナ）';
COMMENT ON COLUMN "bank_branches"."display_order" IS '表示順（小さい順に表示）';
COMMENT ON COLUMN "bank_branches"."version" IS '楽観ロック用バージョン';
