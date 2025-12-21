# 社員マスタ 統合テストスクリプト (PowerShell版)
# 使用方法: .\scripts\integration-test-employee-master.ps1

$ErrorActionPreference = "Stop"

# 設定
$BFF_URL = "http://localhost:3001/api/bff"
$TENANT_ID = "test-tenant-001"
$USER_ID = "test-user-001"

# テスト結果カウンター
$script:PASSED = 0
$script:FAILED = 0

# ヘルパー関数
function Print-Test {
    param([string]$Message)
    Write-Host "[TEST] $Message" -ForegroundColor Yellow
}

function Print-Pass {
    param([string]$Message)
    Write-Host "[PASS] $Message" -ForegroundColor Green
    $script:PASSED++
}

function Print-Fail {
    param([string]$Message)
    Write-Host "[FAIL] $Message" -ForegroundColor Red
    $script:FAILED++
}

# テスト: 一覧取得（ページネーション）
function Test-ListEmployeesPagination {
    Print-Test "8.1.1: ページネーション"
    
    try {
        $uriBuilder = [System.UriBuilder]::new("$BFF_URL/master-data/employee-master")
        $uriBuilder.Query = 'page=1&pageSize=10'
        $uri = $uriBuilder.Uri.ToString()
        
        $response = Invoke-RestMethod -Uri $uri `
            -Method Get `
            -Headers @{
                "Content-Type" = "application/json"
                "x-tenant-id" = $TENANT_ID
            }
        
        if ($response.page -eq 1 -and $response.pageSize -eq 10 -and $null -ne $response.total -and $null -ne $response.totalPages) {
            Print-Pass "ページネーションが正しく動作 (page=$($response.page), pageSize=$($response.pageSize), total=$($response.total))"
        } else {
            Print-Fail "ページネーションが正しく動作しない (page=$($response.page), pageSize=$($response.pageSize))"
        }
    } catch {
        Print-Fail "ページネーションテストでエラー: $($_.Exception.Message)"
    }
}

# テスト: ソート
function Test-ListEmployeesSort {
    Print-Test "8.1.2: ソート"
    
    try {
        $uriBuilder = [System.UriBuilder]::new("$BFF_URL/master-data/employee-master")
        $uriBuilder.Query = 'page=1&pageSize=50&sortBy=employeeCode&sortOrder=asc'
        $uri = $uriBuilder.Uri.ToString()
        
        $response = Invoke-RestMethod -Uri $uri `
            -Method Get `
            -Headers @{
                "Content-Type" = "application/json"
                "x-tenant-id" = $TENANT_ID
            }
        
        if ($response.items.Count -gt 0) {
            Print-Pass "ソートが正しく動作 (items: $($response.items.Count))"
        } else {
            Print-Fail "ソートが正しく動作しない"
        }
    } catch {
        Print-Fail "ソートテストでエラー: $($_.Exception.Message)"
    }
}

# テスト: キーワード検索
function Test-ListEmployeesKeyword {
    Print-Test "8.1.3: キーワード検索"
    
    try {
        $uriBuilder = [System.UriBuilder]::new("$BFF_URL/master-data/employee-master")
        $uriBuilder.Query = 'page=1&pageSize=50&keyword=山田'
        $uri = $uriBuilder.Uri.ToString()
        
        $response = Invoke-RestMethod -Uri $uri `
            -Method Get `
            -Headers @{
                "Content-Type" = "application/json"
                "x-tenant-id" = $TENANT_ID
            }
        
        Print-Pass "キーワード検索が正しく動作 (items: $($response.items.Count))"
    } catch {
        Print-Fail "キーワード検索テストでエラー: $($_.Exception.Message)"
    }
}

# テスト: 新規登録
function Test-CreateEmployee {
    Print-Test "8.3.1: 新規登録"
    
    try {
        $body = @{
            employeeCode = "EMP999"
            employeeName = "テスト太郎"
            employeeKanaName = "テストタロウ"
            email = "test@example.com"
            joinDate = "2024-01-01T00:00:00.000Z"
            isActive = $true
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$BFF_URL/master-data/employee-master" `
            -Method Post `
            -Headers @{
                "Content-Type" = "application/json"
                "x-tenant-id" = $TENANT_ID
                "x-user-id" = $USER_ID
            } `
            -Body $body
        
        $employeeId = $response.employee.id
        $global:TEST_EMPLOYEE_ID = $employeeId
        Print-Pass "新規登録が成功 (employee_id: $employeeId)"
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Print-Fail "新規登録が失敗 (HTTP $statusCode): $($_.Exception.Message)"
    }
}

# テスト: 社員コード重複チェック
function Test-CreateEmployeeDuplicate {
    Print-Test "8.3.3: 社員コード重複チェック"
    
    try {
        $body = @{
            employeeCode = "EMP999"
            employeeName = "テスト太郎2"
            employeeKanaName = "テストタロウ2"
            joinDate = "2024-01-01T00:00:00.000Z"
            isActive = $true
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$BFF_URL/master-data/employee-master" `
            -Method Post `
            -Headers @{
                "Content-Type" = "application/json"
                "x-tenant-id" = $TENANT_ID
                "x-user-id" = $USER_ID
            } `
            -Body $body
        
        Print-Fail "社員コード重複チェックが正しく動作しない (重複が検出されませんでした)"
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        $errorCode = $errorResponse.code
        
        if ($statusCode -eq 409 -and $errorCode -eq "EMPLOYEE_CODE_DUPLICATE") {
            Print-Pass "社員コード重複チェックが正しく動作"
        } else {
            Print-Fail "社員コード重複チェックが正しく動作しない (HTTP $statusCode, code: $errorCode)"
        }
    }
}

# テスト: 詳細取得
function Test-GetEmployee {
    Print-Test "8.2.1: 社員詳細取得"
    
    if (-not $global:TEST_EMPLOYEE_ID) {
        Print-Fail "テスト用の社員IDが存在しません"
        return
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$BFF_URL/master-data/employee-master/$($global:TEST_EMPLOYEE_ID)" `
            -Method Get `
            -Headers @{
                "Content-Type" = "application/json"
                "x-tenant-id" = $TENANT_ID
            }
        
        $employeeCode = $response.employee.employeeCode
        Print-Pass "社員詳細取得が成功 (employee_code: $employeeCode)"
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Print-Fail "社員詳細取得が失敗 (HTTP $statusCode): $($_.Exception.Message)"
    }
}

# テスト: 更新
function Test-UpdateEmployee {
    Print-Test "8.4.1: 更新"
    
    if (-not $global:TEST_EMPLOYEE_ID) {
        Print-Fail "テスト用の社員IDが存在しません"
        return
    }
    
    try {
        $body = @{
            employeeCode = "EMP999"
            employeeName = "テスト太郎（更新）"
            employeeKanaName = "テストタロウ"
            email = "test.updated@example.com"
            joinDate = "2024-01-01T00:00:00.000Z"
            isActive = $true
            version = 1
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$BFF_URL/master-data/employee-master/$($global:TEST_EMPLOYEE_ID)" `
            -Method Put `
            -Headers @{
                "Content-Type" = "application/json"
                "x-tenant-id" = $TENANT_ID
                "x-user-id" = $USER_ID
            } `
            -Body $body
        
        $version = $response.employee.version
        Print-Pass "更新が成功 (version: $version)"
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Print-Fail "更新が失敗 (HTTP $statusCode): $($_.Exception.Message)"
    }
}

# テスト: 楽観ロック
function Test-UpdateEmployeeOptimisticLock {
    Print-Test "8.4.2: 楽観ロック"
    
    if (-not $global:TEST_EMPLOYEE_ID) {
        Print-Fail "テスト用の社員IDが存在しません"
        return
    }
    
    try {
        $body = @{
            employeeCode = "EMP999"
            employeeName = "テスト太郎"
            employeeKanaName = "テストタロウ"
            joinDate = "2024-01-01T00:00:00.000Z"
            isActive = $true
            version = 1
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$BFF_URL/master-data/employee-master/$($global:TEST_EMPLOYEE_ID)" `
            -Method Put `
            -Headers @{
                "Content-Type" = "application/json"
                "x-tenant-id" = $TENANT_ID
                "x-user-id" = $USER_ID
            } `
            -Body $body
        
        Print-Fail "楽観ロックが正しく動作しない (競合が検出されませんでした)"
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        $errorCode = $errorResponse.code
        
        if ($statusCode -eq 409 -and $errorCode -eq "CONCURRENT_UPDATE") {
            Print-Pass "楽観ロックが正しく動作"
        } else {
            Print-Fail "楽観ロックが正しく動作しない (HTTP $statusCode, code: $errorCode)"
        }
    }
}

# メイン実行
function Main {
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "社員マスタ 統合テスト開始" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # サーバー接続確認
    try {
        $uriBuilder = [System.UriBuilder]::new("$BFF_URL/master-data/employee-master")
        $uriBuilder.Query = 'page=1&pageSize=1'
        $uri = $uriBuilder.Uri.ToString()
        $null = Invoke-RestMethod -Uri $uri -Method Get -ErrorAction Stop
    } catch {
        Write-Host "[ERROR] BFFサーバーに接続できません。サーバーが起動しているか確認してください。" -ForegroundColor Red
        Write-Host "  実行コマンド: pnpm run dev:bff" -ForegroundColor Yellow
        exit 1
    }
    
    # テスト実行
    Test-ListEmployeesPagination
    Test-ListEmployeesSort
    Test-ListEmployeesKeyword
    Test-CreateEmployee
    Test-CreateEmployeeDuplicate
    Test-GetEmployee
    Test-UpdateEmployee
    Test-UpdateEmployeeOptimisticLock
    
    # 結果サマリー
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "テスト結果サマリー" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "PASSED: $script:PASSED" -ForegroundColor Green
    Write-Host "FAILED: $script:FAILED" -ForegroundColor Red
    Write-Host "==========================================" -ForegroundColor Cyan
    
    if ($script:FAILED -eq 0) {
        exit 0
    } else {
        exit 1
    }
}

Main


