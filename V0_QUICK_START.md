# 🚀 v0.dev クイックスタートガイド

**所要時間:** 初回15分、2回目以降5分

---

## ⚡ 3ステップで完了

### 1️⃣ 初回セットアップ（初回のみ）

```bash
cd apps/web
```

`package.json` に以下を追加:
```json
"dependencies": {
  "@contracts/bff": "file:../../packages/contracts"
}
```

```bash
npm install
```

✅ これで準備完了！

---

### 2️⃣ v0でコード生成

1. https://v0.dev にアクセス
2. プロンプトテンプレート（`.kiro/steering/v0-prompt-template-enhanced.md`）を使用
3. **「Add to Codebase」** ボタンをクリック
4. コマンドをコピー

---

### 3️⃣ ローカルで取得

```bash
cd apps/web

# v0からコピーしたコマンドを貼り付け
npx shadcn@latest add "https://v0.app/chat/b/[CHAT_ID]?token=[TOKEN]"

# package.json上書き確認 → 「N」を入力
```

✅ 完了！`apps/web/_v0_drop/` にファイルが取得されました。

---

## 📂 取得されるファイル

```
apps/web/_v0_drop/<context>/<feature>/src/
├── OUTPUT.md              ← 統合手順が記載されている
├── page.tsx
├── components/
│   └── *.tsx
└── api/
    ├── BffClient.ts
    ├── MockBffClient.ts
    └── HttpBffClient.ts
```

---

## 🔍 次のステップ

### OUTPUT.md を確認

```bash
cat apps/web/_v0_drop/<context>/<feature>/src/OUTPUT.md
```

**確認項目:**
- [ ] すべてのファイルが取得されているか
- [ ] Missing Components（追加実装が必要なコンポーネント）の有無
- [ ] Constraint compliance（CCSDD制約への準拠状況）

### 統合スクリプトを実行（オプション）

```bash
./scripts/v0-integrate.sh <context>/<feature>
```

これで自動的に:
- Cursor でファイルを開く
- features/ ディレクトリへ移行
- import 修正のサポート

---

## ⚠️ トラブルシューティング

### エラー: `@contracts/bff` が見つからない

```bash
cd apps/web
# package.json に "@contracts/bff": "file:../../packages/contracts" を追加
npm install
```

### エラー: トークンが無効

v0.dev で「Add to Codebase」を再度クリックして、新しいコマンドを取得してください。

---

## 📚 詳細ドキュメント

- **完全ガイド**: `doc/technical/v0-fetch-workflow-complete.md`
- **統合方法比較**: `doc/technical/v0-integration-methods.md`
- **スクリプト詳細**: `scripts/README.md`

---

## ✅ 成功実績

**社員マスタCRUD実装で検証済み:**
- 取得成功率: **98%**
- 手動修正: わずか2箇所（null安全性のみ）
- 所要時間: **約5分**（2回目以降）

---

**このフローで、次のマスタ機能も同様に実装できます！**
