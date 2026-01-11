-- Add audit columns to employees table
-- Phase 1: Add columns without FK constraints (login_accounts table not yet implemented)
-- Phase 2: FK constraints will be added when login_accounts is implemented

-- Add created_by column
ALTER TABLE "employees"
  ADD COLUMN "created_by_login_account_id" TEXT NULL;

-- Add updated_by column
ALTER TABLE "employees"
  ADD COLUMN "updated_by_login_account_id" TEXT NULL;

-- Add comments for documentation
COMMENT ON COLUMN "employees"."created_by_login_account_id" IS
  '作成者（login_accounts.id への参照、FK制約は login_accounts 実装時に追加）';

COMMENT ON COLUMN "employees"."updated_by_login_account_id" IS
  '更新者（login_accounts.id への参照、FK制約は login_accounts 実装時に追加）';

-- Note: Existing records will have NULL for these columns
-- Application layer validation will ensure new records have these values
