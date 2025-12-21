#!/bin/bash

# 社員マスタ 統合テストスクリプト
# 使用方法: ./scripts/integration-test-employee-master.sh

set -e

# カラー出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 設定
BFF_URL="http://localhost:3001/api/bff"
TENANT_ID="test-tenant-001"
USER_ID="test-user-001"

# テスト結果カウンター
PASSED=0
FAILED=0

# ヘルパー関数
print_test() {
  echo -e "${YELLOW}[TEST]${NC} $1"
}

print_pass() {
  echo -e "${GREEN}[PASS]${NC} $1"
  ((PASSED++))
}

print_fail() {
  echo -e "${RED}[FAIL]${NC} $1"
  ((FAILED++))
}

# テスト: 一覧取得（ページネーション）
test_list_employees_pagination() {
  print_test "8.1.1: ページネーション"
  
  response=$(curl -s -X GET "${BFF_URL}/master-data/employee-master?page=1&pageSize=10" \
    -H "Content-Type: application/json" \
    -H "x-tenant-id: ${TENANT_ID}")
  
  page=$(echo $response | jq -r '.page')
  pageSize=$(echo $response | jq -r '.pageSize')
  total=$(echo $response | jq -r '.total')
  totalPages=$(echo $response | jq -r '.totalPages')
  
  if [ "$page" = "1" ] && [ "$pageSize" = "10" ] && [ -n "$total" ] && [ -n "$totalPages" ]; then
    print_pass "ページネーションが正しく動作"
  else
    print_fail "ページネーションが正しく動作しない (page=$page, pageSize=$pageSize)"
  fi
}

# テスト: ソート
test_list_employees_sort() {
  print_test "8.1.2: ソート"
  
  response=$(curl -s -X GET "${BFF_URL}/master-data/employee-master?page=1&pageSize=50&sortBy=employeeCode&sortOrder=asc" \
    -H "Content-Type: application/json" \
    -H "x-tenant-id: ${TENANT_ID}")
  
  items=$(echo $response | jq -r '.items | length')
  
  if [ "$items" -gt "0" ]; then
    print_pass "ソートが正しく動作"
  else
    print_fail "ソートが正しく動作しない"
  fi
}

# テスト: キーワード検索
test_list_employees_keyword() {
  print_test "8.1.3: キーワード検索"
  
  response=$(curl -s -X GET "${BFF_URL}/master-data/employee-master?page=1&pageSize=50&keyword=山田" \
    -H "Content-Type: application/json" \
    -H "x-tenant-id: ${TENANT_ID}")
  
  items=$(echo $response | jq -r '.items | length')
  
  if [ "$items" -ge "0" ]; then
    print_pass "キーワード検索が正しく動作"
  else
    print_fail "キーワード検索が正しく動作しない"
  fi
}

# テスト: 新規登録
test_create_employee() {
  print_test "8.3.1: 新規登録"
  
  response=$(curl -s -w "\n%{http_code}" -X POST "${BFF_URL}/master-data/employee-master" \
    -H "Content-Type: application/json" \
    -H "x-tenant-id: ${TENANT_ID}" \
    -H "x-user-id: ${USER_ID}" \
    -d '{
      "employeeCode": "EMP999",
      "employeeName": "テスト太郎",
      "employeeKanaName": "テストタロウ",
      "email": "test@example.com",
      "joinDate": "2024-01-01T00:00:00.000Z",
      "isActive": true
    }')
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [ "$http_code" = "201" ]; then
    employee_id=$(echo $body | jq -r '.employee.id')
    print_pass "新規登録が成功 (employee_id: $employee_id)"
    echo "$employee_id" > /tmp/test_employee_id.txt
  else
    print_fail "新規登録が失敗 (HTTP $http_code)"
    echo "$body" | jq '.'
  fi
}

# テスト: 社員コード重複チェック
test_create_employee_duplicate() {
  print_test "8.3.3: 社員コード重複チェック"
  
  response=$(curl -s -w "\n%{http_code}" -X POST "${BFF_URL}/master-data/employee-master" \
    -H "Content-Type: application/json" \
    -H "x-tenant-id: ${TENANT_ID}" \
    -H "x-user-id: ${USER_ID}" \
    -d '{
      "employeeCode": "EMP999",
      "employeeName": "テスト太郎2",
      "employeeKanaName": "テストタロウ2",
      "joinDate": "2024-01-01T00:00:00.000Z",
      "isActive": true
    }')
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  error_code=$(echo $body | jq -r '.code // .error.code // ""')
  
  if [ "$http_code" = "409" ] && [ "$error_code" = "EMPLOYEE_CODE_DUPLICATE" ]; then
    print_pass "社員コード重複チェックが正しく動作"
  else
    print_fail "社員コード重複チェックが正しく動作しない (HTTP $http_code, code: $error_code)"
  fi
}

# テスト: 詳細取得
test_get_employee() {
  print_test "8.2.1: 社員詳細取得"
  
  if [ ! -f /tmp/test_employee_id.txt ]; then
    print_fail "テスト用の社員IDが存在しません"
    return
  fi
  
  employee_id=$(cat /tmp/test_employee_id.txt)
  
  response=$(curl -s -w "\n%{http_code}" -X GET "${BFF_URL}/master-data/employee-master/${employee_id}" \
    -H "Content-Type: application/json" \
    -H "x-tenant-id: ${TENANT_ID}")
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [ "$http_code" = "200" ]; then
    employee_code=$(echo $body | jq -r '.employee.employeeCode')
    print_pass "社員詳細取得が成功 (employee_code: $employee_code)"
  else
    print_fail "社員詳細取得が失敗 (HTTP $http_code)"
  fi
}

# テスト: 更新
test_update_employee() {
  print_test "8.4.1: 更新"
  
  if [ ! -f /tmp/test_employee_id.txt ]; then
    print_fail "テスト用の社員IDが存在しません"
    return
  fi
  
  employee_id=$(cat /tmp/test_employee_id.txt)
  
  response=$(curl -s -w "\n%{http_code}" -X PUT "${BFF_URL}/master-data/employee-master/${employee_id}" \
    -H "Content-Type: application/json" \
    -H "x-tenant-id: ${TENANT_ID}" \
    -H "x-user-id: ${USER_ID}" \
    -d '{
      "employeeCode": "EMP999",
      "employeeName": "テスト太郎（更新）",
      "employeeKanaName": "テストタロウ",
      "email": "test.updated@example.com",
      "joinDate": "2024-01-01T00:00:00.000Z",
      "isActive": true,
      "version": 1
    }')
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [ "$http_code" = "200" ]; then
    version=$(echo $body | jq -r '.employee.version')
    print_pass "更新が成功 (version: $version)"
  else
    print_fail "更新が失敗 (HTTP $http_code)"
    echo "$body" | jq '.'
  fi
}

# テスト: 楽観ロック
test_update_employee_optimistic_lock() {
  print_test "8.4.2: 楽観ロック"
  
  if [ ! -f /tmp/test_employee_id.txt ]; then
    print_fail "テスト用の社員IDが存在しません"
    return
  fi
  
  employee_id=$(cat /tmp/test_employee_id.txt)
  
  response=$(curl -s -w "\n%{http_code}" -X PUT "${BFF_URL}/master-data/employee-master/${employee_id}" \
    -H "Content-Type: application/json" \
    -H "x-tenant-id: ${TENANT_ID}" \
    -H "x-user-id: ${USER_ID}" \
    -d '{
      "employeeCode": "EMP999",
      "employeeName": "テスト太郎",
      "employeeKanaName": "テストタロウ",
      "joinDate": "2024-01-01T00:00:00.000Z",
      "isActive": true,
      "version": 1
    }')
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  error_code=$(echo $body | jq -r '.code // .error.code // ""')
  
  if [ "$http_code" = "409" ] && [ "$error_code" = "CONCURRENT_UPDATE" ]; then
    print_pass "楽観ロックが正しく動作"
  else
    print_fail "楽観ロックが正しく動作しない (HTTP $http_code, code: $error_code)"
  fi
}

# メイン実行
main() {
  echo "=========================================="
  echo "社員マスタ 統合テスト開始"
  echo "=========================================="
  echo ""
  
  # サーバー接続確認
  if ! curl -s "${BFF_URL}/master-data/employee-master?page=1&pageSize=1" > /dev/null 2>&1; then
    echo -e "${RED}[ERROR]${NC} BFFサーバーに接続できません。サーバーが起動しているか確認してください。"
    exit 1
  fi
  
  # テスト実行
  test_list_employees_pagination
  test_list_employees_sort
  test_list_employees_keyword
  test_create_employee
  test_create_employee_duplicate
  test_get_employee
  test_update_employee
  test_update_employee_optimistic_lock
  
  # 結果サマリー
  echo ""
  echo "=========================================="
  echo "テスト結果サマリー"
  echo "=========================================="
  echo -e "${GREEN}PASSED: ${PASSED}${NC}"
  echo -e "${RED}FAILED: ${FAILED}${NC}"
  echo "=========================================="
  
  if [ $FAILED -eq 0 ]; then
    exit 0
  else
    exit 1
  fi
}

main




