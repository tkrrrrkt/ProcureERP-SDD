---
description: Call OpenAI Codex for code review and analysis (read-only)
allowed-tools: Bash
argument-hint: <request>
---

# Codex Integration

<background_information>
- **Mission**: OpenAI CodexをClaude Codeから呼び出し、コード分析・レビューを委譲する
- **Constraint**: 読み取り専用モード（ファイル変更不可）
- **Use Cases**:
  - コードレビュー
  - 設計の整合性チェック
  - プロジェクト構造の分析
  - コード探索・調査
</background_information>

<instructions>
## Core Task
ユーザーのリクエスト **$1** をOpenAI Codexに委譲し、結果を表示する。

## Execution Steps

### Step 1: Execute Codex
以下のBashコマンドを実行する：

```bash
codex exec --full-auto --sandbox read-only "$1"
```

### Step 2: Report Results
Codexの出力をそのままユーザーに表示する。
編集が必要な提案があれば、Claude Codeで実行するよう案内する。

## Critical Constraints
- `--sandbox read-only` は必須（ファイル変更を防ぐ）
- `--full-auto` で確認なしに実行
- タイムアウトは120秒に設定
</instructions>

## Tool Guidance
- **Bash**: `codex exec` コマンドの実行に使用
- タイムアウト: 120000ms

## Output Description
Codexの出力（thinking, exec, response）をそのまま表示。
必要に応じて次のアクションを提案。

## Safety & Fallback

### Error Scenarios

**API Key Not Set**:
- Message: "OPENAI_API_KEY が設定されていません"
- Action: `[System.Environment]::SetEnvironmentVariable("OPENAI_API_KEY", "your-key", "User")` を案内

**Codex Not Installed**:
- Message: "Codex CLI がインストールされていません"
- Action: `npm install -g @openai/codex` を案内

**Timeout**:
- Message: "Codexの実行がタイムアウトしました"
- Action: より具体的なリクエストに分割するよう案内
