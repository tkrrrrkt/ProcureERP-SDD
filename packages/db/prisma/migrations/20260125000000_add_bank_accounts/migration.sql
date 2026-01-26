-- CreateEnum: AccountCategory
CREATE TYPE "AccountCategory" AS ENUM ('bank', 'post_office', 'ja_bank');

-- CreateEnum: AccountType
CREATE TYPE "AccountType" AS ENUM ('ordinary', 'current', 'savings', 'other');

-- CreateEnum: TransferFeeBearer
CREATE TYPE "TransferFeeBearer" AS ENUM ('sender', 'recipient');

-- CreateEnum: CompanyAccountCategory
CREATE TYPE "CompanyAccountCategory" AS ENUM ('bank', 'post_office');

-- CreateEnum: CompanyAccountType
CREATE TYPE "CompanyAccountType" AS ENUM ('ordinary', 'current', 'savings');

-- CreateTable: payee_bank_accounts
CREATE TABLE "payee_bank_accounts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "payee_id" TEXT NOT NULL,
    "account_category" "AccountCategory" NOT NULL,
    "bank_id" TEXT,
    "bank_branch_id" TEXT,
    "post_office_symbol" VARCHAR(5),
    "post_office_number" VARCHAR(8),
    "account_type" "AccountType" NOT NULL,
    "account_no" VARCHAR(7),
    "account_holder_name" VARCHAR(100) NOT NULL,
    "account_holder_name_kana" VARCHAR(150),
    "transfer_fee_bearer" "TransferFeeBearer" NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_login_account_id" TEXT,
    "updated_by_login_account_id" TEXT,

    CONSTRAINT "payee_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable: company_bank_accounts
CREATE TABLE "company_bank_accounts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "account_code" VARCHAR(10) NOT NULL,
    "account_name" VARCHAR(100) NOT NULL,
    "account_category" "CompanyAccountCategory" NOT NULL,
    "bank_id" TEXT,
    "bank_branch_id" TEXT,
    "post_office_symbol" VARCHAR(5),
    "post_office_number" VARCHAR(8),
    "account_type" "CompanyAccountType" NOT NULL,
    "account_no" VARCHAR(7),
    "account_holder_name" VARCHAR(100) NOT NULL,
    "account_holder_name_kana" VARCHAR(150),
    "consignor_code" VARCHAR(10),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_login_account_id" TEXT,
    "updated_by_login_account_id" TEXT,

    CONSTRAINT "company_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: payee_bank_accounts
CREATE INDEX "payee_bank_accounts_tenant_id_payee_id_idx" ON "payee_bank_accounts"("tenant_id", "payee_id");
CREATE INDEX "payee_bank_accounts_tenant_id_payee_id_is_default_idx" ON "payee_bank_accounts"("tenant_id", "payee_id", "is_default");
CREATE INDEX "payee_bank_accounts_tenant_id_payee_id_is_active_idx" ON "payee_bank_accounts"("tenant_id", "payee_id", "is_active");

-- CreateIndex: company_bank_accounts
CREATE UNIQUE INDEX "company_bank_accounts_tenant_id_account_code_key" ON "company_bank_accounts"("tenant_id", "account_code");
CREATE INDEX "company_bank_accounts_tenant_id_account_code_idx" ON "company_bank_accounts"("tenant_id", "account_code");
CREATE INDEX "company_bank_accounts_tenant_id_is_default_idx" ON "company_bank_accounts"("tenant_id", "is_default");
CREATE INDEX "company_bank_accounts_tenant_id_is_active_idx" ON "company_bank_accounts"("tenant_id", "is_active");

-- AddForeignKey: payee_bank_accounts -> banks
ALTER TABLE "payee_bank_accounts" ADD CONSTRAINT "payee_bank_accounts_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "banks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: payee_bank_accounts -> bank_branches
ALTER TABLE "payee_bank_accounts" ADD CONSTRAINT "payee_bank_accounts_bank_branch_id_fkey" FOREIGN KEY ("bank_branch_id") REFERENCES "bank_branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: company_bank_accounts -> banks
ALTER TABLE "company_bank_accounts" ADD CONSTRAINT "company_bank_accounts_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "banks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: company_bank_accounts -> bank_branches
ALTER TABLE "company_bank_accounts" ADD CONSTRAINT "company_bank_accounts_bank_branch_id_fkey" FOREIGN KEY ("bank_branch_id") REFERENCES "bank_branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RLS Policy: payee_bank_accounts
ALTER TABLE "payee_bank_accounts" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payee_bank_accounts_tenant_isolation" ON "payee_bank_accounts"
    USING (tenant_id = current_setting('app.tenant_id', true))
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

-- RLS Policy: company_bank_accounts
ALTER TABLE "company_bank_accounts" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_bank_accounts_tenant_isolation" ON "company_bank_accounts"
    USING (tenant_id = current_setting('app.tenant_id', true))
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true));
