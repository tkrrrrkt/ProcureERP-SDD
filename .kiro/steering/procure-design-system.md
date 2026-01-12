# ProcurERP Design System Rules

このドキュメントは、ProcurERP（調達管理SaaS）のデザインシステム定義です。v0での画面作成時は、必ずこのデザインシステムに準拠してUIを構築してください。

## 概要

モダンで洗練された、使いやすくシンプルなB2B向けエンタープライズSaaSのデザインシステムです。**Professional Blue（プライマリー）**と**Teal（セカンダリー/アクセント）**をベースカラーとし、統一感のあるプロフェッショナルなUIを実現します。

---

## カラーパレット

### 色空間について

本デザインシステムは **OKLCH色空間** を採用しています。OKLCHは知覚的に均一な色空間であり、以下の利点があります：

- 明度・彩度の調整が直感的
- アクセシビリティ対応が容易
- ダークモード変換が自然

**OKLCH形式**: `oklch(L C H)` — L=明度(0-1), C=彩度(0-0.4), H=色相(0-360)

### プライマリーカラー（Professional Blue）
**用途**: 主要なアクション、ブランド表現、重要な要素の強調

| トークン | OKLCH値 | 用途 |
|---------|---------|------|
| `--primary` | `oklch(0.45 0.18 250)` | メインプライマリー（デフォルト） |
| Light mode | `oklch(0.45 0.18 250)` | 標準 |
| Dark mode | `oklch(0.55 0.2 250)` | ダークモード用（明度上昇） |

**CSS変数**: `--primary`, `--primary-foreground`

**特徴**: 信頼性・専門性・安定感を表現する青。調達業務における信頼関係を象徴。

### セカンダリーカラー（Teal）
**用途**: セカンダリーアクション、バッジ、補助的な強調、グラフ

| トークン | OKLCH値 | 用途 |
|---------|---------|------|
| `--secondary` | `oklch(0.95 0.05 180)` | 薄い背景（Light mode） |
| `--secondary-foreground` | `oklch(0.25 0.1 180)` | テキスト（Light mode） |
| Dark mode secondary | `oklch(0.25 0.1 180)` | 背景 |
| Dark mode foreground | `oklch(0.95 0.05 180)` | テキスト |

**CSS変数**: `--secondary`, `--secondary-foreground`

### アクセントカラー（Teal）
**用途**: ホバー効果、選択状態、視覚的アクセント

| トークン | OKLCH値 | 用途 |
|---------|---------|------|
| `--accent` | `oklch(0.55 0.15 180)` | アクセント背景 |
| `--accent-foreground` | `oklch(0.99 0 0)` | アクセントテキスト |

### セマンティックカラー

#### Success（成功・完了）
| トークン | OKLCH値 | 用途 |
|---------|---------|------|
| `--success` | `oklch(0.6 0.18 150)` | 成功メッセージ、完了状態 |
| `--success-foreground` | `oklch(0.99 0 0)` | テキスト |

**用途**: 成功メッセージ、完了状態、ポジティブなフィードバック

#### Warning（警告・注意）
| トークン | OKLCH値 | 用途 |
|---------|---------|------|
| `--warning` | `oklch(0.7 0.15 70)` | 警告メッセージ |
| `--warning-foreground` | `oklch(0.15 0 0)` | テキスト（暗色） |

**用途**: 警告メッセージ、注意喚起、一時的な状態

#### Destructive/Error（エラー・危険）
| トークン | OKLCH値 | 用途 |
|---------|---------|------|
| `--destructive` | `oklch(0.55 0.22 25)` | エラーメッセージ、削除アクション |
| `--destructive-foreground` | `oklch(0.99 0 0)` | テキスト |

**用途**: エラーメッセージ、削除アクション、危険な操作

### ニュートラルカラー

| トークン | OKLCH値 | 用途 |
|---------|---------|------|
| `--background` | `oklch(1 0 0)` | ページ背景 |
| `--foreground` | `oklch(0.15 0 0)` | メインテキスト |
| `--card` | `oklch(1 0 0)` | カード背景 |
| `--muted` | `oklch(0.97 0.005 250)` | 薄い背景 |
| `--muted-foreground` | `oklch(0.5 0.01 250)` | 補助テキスト |
| `--border` | `oklch(0.92 0.005 250)` | ボーダー |
| `--input` | `oklch(0.92 0.005 250)` | インプット背景 |

### チャートカラー

| トークン | OKLCH値 | 用途 |
|---------|---------|------|
| `--chart-1` | `oklch(0.45 0.18 250)` | Primary Blue |
| `--chart-2` | `oklch(0.55 0.15 180)` | Teal |
| `--chart-3` | `oklch(0.6 0.18 150)` | Success Green |
| `--chart-4` | `oklch(0.7 0.15 70)` | Warning Yellow |
| `--chart-5` | `oklch(0.55 0.22 25)` | Destructive Red |

---

## タイポグラフィ

### フォントファミリー

```css
--font-sans: "Geist", "Geist Fallback";
--font-mono: "Geist Mono", "Geist Mono Fallback";
```

**使用方法**:
- **本文・UI全般**: `font-sans` クラスを使用
- **コード・数値**: `font-mono` クラスを使用

### フォントサイズ（Tailwindクラス）

- `text-xs`: 0.75rem (12px) - キャプション、メタ情報
- `text-sm`: 0.875rem (14px) - 小さな本文、ラベル
- `text-base`: 1rem (16px) - **標準本文**
- `text-lg`: 1.125rem (18px) - リード文、小見出し
- `text-xl`: 1.25rem (20px) - 中見出し
- `text-2xl`: 1.5rem (24px) - セクション見出し
- `text-3xl`: 1.875rem (30px) - ページタイトル
- `text-4xl`: 2.25rem (36px) - 大きなタイトル

### フォントウェイト

- `font-normal`: 400 - 標準本文
- `font-medium`: 500 - 強調テキスト
- `font-semibold`: 600 - 見出し、ラベル
- `font-bold`: 700 - 強い強調、大見出し

### 行間（Line Height）

- `leading-tight`: 1.25 - 見出し用
- `leading-normal`: 1.5 - **標準（推奨）**
- `leading-relaxed`: 1.625 - 読みやすい本文

**推奨**: 本文には `leading-relaxed` または `leading-6` を使用して可読性を確保

---

## スペーシング

Tailwindのスペーシングスケールを使用（4px基準）

### よく使うスペーシング

- `p-2`: 0.5rem (8px) - 小さなパディング
- `p-4`: 1rem (16px) - **標準パディング**
- `p-6`: 1.5rem (24px) - 中程度のパディング
- `p-8`: 2rem (32px) - 大きなパディング
- `gap-4`: 1rem (16px) - **標準ギャップ**
- `gap-6`: 1.5rem (24px) - 広めのギャップ

**原則**:
- コンポーネント内部: `p-4`, `p-6`, `gap-4`
- セクション間: `p-8`, `gap-6`, `gap-8`
- 任意の値 `p-[16px]` は避け、Tailwindのスケール `p-4` を使用

---

## ボーダーラジウス（角丸）

```css
--radius: 0.5rem; /* 8px */
--radius-sm: calc(var(--radius) - 4px);  /* 4px */
--radius-md: calc(var(--radius) - 2px);  /* 6px */
--radius-lg: var(--radius);               /* 8px */
--radius-xl: calc(var(--radius) + 4px);  /* 12px */
```

### 使用パターン

- `rounded-sm`: 4px - 小さな要素
- `rounded`: 4px - ボタン、インプット（小）
- `rounded-md`: 6px - **標準（カード、ボタン）**
- `rounded-lg`: 8px - **推奨（カード、モーダル）**
- `rounded-xl`: 12px - 大きなカード
- `rounded-2xl`: 16px - ヒーローカード

**推奨**: カードやモーダルには `rounded-lg` または `rounded-xl` を使用

---

## シャドウ（影）

### 標準シャドウ

- `shadow-sm`: 軽い影 - インプット、小さなカード
- `shadow`: **標準の影（推奨）** - カード、ボタン
- `shadow-md`: 中程度の影 - 浮いたカード
- `shadow-lg`: 大きな影 - モーダル、ドロップダウン
- `shadow-xl`: 非常に大きな影 - オーバーレイ

**推奨**: カードには `shadow` または `shadow-md`、モーダルには `shadow-lg` を使用

---

## ボタンコンポーネント

### Primary Button（主要アクション）

```tsx
<Button variant="default" size="default">
  保存
</Button>
```

**スタイル**:
- 背景: `bg-primary` (Blue)
- テキスト: `text-primary-foreground` (白)
- ホバー: `hover:bg-primary/90`
- サイズ: `h-10 px-4 py-2`

**用途**: 最も重要なアクション（保存、送信、確定など）

### Secondary Button（セカンダリーアクション）

```tsx
<Button variant="secondary" size="default">
  キャンセル
</Button>
```

**スタイル**:
- 背景: `bg-secondary` (薄いTeal)
- テキスト: `text-secondary-foreground`
- ホバー: `hover:bg-secondary/80`

**用途**: 補助的なアクション（キャンセル、戻る、スキップなど）

### Outline Button（アウトライン）

```tsx
<Button variant="outline" size="default">
  詳細
</Button>
```

**スタイル**:
- 背景: 透明
- ボーダー: `border border-input`
- テキスト: `text-foreground`
- ホバー: `hover:bg-accent`

**用途**: 低優先度のアクション（詳細、編集、その他）

### Ghost Button（ゴースト）

```tsx
<Button variant="ghost" size="default">
  閉じる
</Button>
```

**スタイル**:
- 背景: 透明
- ボーダー: なし
- ホバー: `hover:bg-accent`

**用途**: 最小限の強調（閉じる、もっと見る、ナビゲーション）

### Destructive Button（削除・危険）

```tsx
<Button variant="destructive" size="default">
  削除
</Button>
```

**スタイル**:
- 背景: `bg-destructive` (赤)
- テキスト: `text-destructive-foreground`
- ホバー: `hover:bg-destructive/90`

**用途**: 削除、破壊的な操作

### アイコン付きボタン

```tsx
<Button variant="default" size="default">
  <Plus className="mr-2 h-4 w-4" />
  新規作成
</Button>
```

**ガイドライン**:
- アイコンサイズ: `h-4 w-4` (16px)
- 左アイコン: `mr-2`
- 右アイコン: `ml-2`

### アイコンボタン

```tsx
<Button variant="ghost" size="icon">
  <Search className="h-4 w-4" />
</Button>
```

**サイズ**: `size="icon"` で正方形のアイコンボタン

---

## カードコンポーネント

### 基本カード

```tsx
<Card>
  <CardHeader>
    <CardTitle>タイトル</CardTitle>
    <CardDescription>説明文</CardDescription>
  </CardHeader>
  <CardContent>
    コンテンツ
  </CardContent>
  <CardFooter>
    <Button>アクション</Button>
  </CardFooter>
</Card>
```

**スタイル**:
- 背景: `bg-card`
- ボーダー: `border border-border`
- 角丸: `rounded-lg`
- 影: `shadow`

**用途**: 情報のグループ化、ダッシュボードウィジェット

### 統計カード

```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">売上高</CardTitle>
    <DollarSign className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">¥12.5M</div>
    <p className="text-xs text-muted-foreground">前月比 +20.1%</p>
  </CardContent>
</Card>
```

**ガイドライン**:
- タイトル: `text-sm font-medium`
- 数値: `text-2xl font-bold`
- サブテキスト: `text-xs text-muted-foreground`

---

## テーブルコンポーネント

### 基本テーブル

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>項目名</TableHead>
      <TableHead>ステータス</TableHead>
      <TableHead>日付</TableHead>
      <TableHead className="text-right">金額</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">データ1</TableCell>
      <TableCell>
        <Badge variant="default">完了</Badge>
      </TableCell>
      <TableCell>2025-12-22</TableCell>
      <TableCell className="text-right">¥1,234</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**スタイル**:
- ヘッダー: `bg-muted/50`, `font-medium`
- セル: `p-4`, `align-middle`
- ホバー: `hover:bg-muted/50`

**ガイドライン**:
- 重要なセル（名前など）: `font-medium`
- 金額の右揃え: `text-right`
- ステータスにはBadgeを使用

---

## フォームコンポーネント

### Input（テキスト入力）

```tsx
<Input
  type="text"
  placeholder="入力してください"
  className="w-full"
/>
```

**スタイル**:
- 高さ: `h-10`
- パディング: `px-3 py-2`
- ボーダー: `border border-input`
- 角丸: `rounded-md`
- フォーカス: `focus-visible:ring-2 focus-visible:ring-ring`

### Textarea（複数行テキスト）

```tsx
<Textarea
  placeholder="詳細を入力してください"
  rows={4}
/>
```

### Select（ドロップダウン）

```tsx
<Select>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="選択してください" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">オプション1</SelectItem>
    <SelectItem value="option2">オプション2</SelectItem>
  </SelectContent>
</Select>
```

### Checkbox（チェックボックス）

```tsx
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <label htmlFor="terms" className="text-sm font-medium">
    利用規約に同意する
  </label>
</div>
```

### Switch（トグルスイッチ）

```tsx
<div className="flex items-center space-x-2">
  <Switch id="notifications" />
  <label htmlFor="notifications" className="text-sm font-medium">
    通知を有効にする
  </label>
</div>
```

### Date Picker（日付選択）

```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" className="w-full justify-start text-left bg-transparent">
      <CalendarIcon className="mr-2 h-4 w-4" />
      {date ? format(date, "PPP") : <span>日付を選択</span>}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0">
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
    />
  </PopoverContent>
</Popover>
```

---

## バッジコンポーネント

### デフォルトバッジ

```tsx
<Badge variant="default">進行中</Badge>
```

**バリアント**:
- `default`: プライマリーカラー（Blue）
- `secondary`: セカンダリーカラー（Teal）
- `outline`: アウトライン
- `destructive`: エラー・警告

### カスタムカラーバッジ

```tsx
<Badge className="bg-success text-success-foreground">完了</Badge>
<Badge className="bg-warning text-warning-foreground">保留</Badge>
<Badge className="bg-destructive text-destructive-foreground">エラー</Badge>
<Badge className="bg-accent text-accent-foreground">レビュー中</Badge>
```

---

## アラート・通知コンポーネント

### Alert（アラート）

```tsx
<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>注意</AlertTitle>
  <AlertDescription>
    この操作は取り消せません。
  </AlertDescription>
</Alert>
```

**バリアント（カスタムクラスで）**:

```tsx
{/* Success */}
<Alert className="border-success bg-success/10 text-success">
  <CheckCircle className="h-4 w-4" />
  <AlertTitle>成功</AlertTitle>
  <AlertDescription>保存が完了しました。</AlertDescription>
</Alert>

{/* Warning */}
<Alert className="border-warning bg-warning/10 text-warning-foreground">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>警告</AlertTitle>
  <AlertDescription>変更が保存されていません。</AlertDescription>
</Alert>

{/* Error */}
<Alert className="border-destructive bg-destructive/10 text-destructive">
  <XCircle className="h-4 w-4" />
  <AlertTitle>エラー</AlertTitle>
  <AlertDescription>操作に失敗しました。</AlertDescription>
</Alert>
```

### Toast（トースト通知）

```tsx
import { useToast } from "@/hooks/use-toast"

const { toast } = useToast()

toast({
  title: "保存完了",
  description: "データが正常に保存されました。",
})

// 成功
toast({
  title: "成功",
  description: "操作が完了しました。",
  className: "border-success bg-success/10",
})

// エラー
toast({
  variant: "destructive",
  title: "エラー",
  description: "操作に失敗しました。",
})
```

---

## タブコンポーネント

### 水平タブ（デフォルト）

```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">タブ1</TabsTrigger>
    <TabsTrigger value="tab2">タブ2</TabsTrigger>
    <TabsTrigger value="tab3">タブ3</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    タブ1のコンテンツ
  </TabsContent>
  <TabsContent value="tab2">
    タブ2のコンテンツ
  </TabsContent>
</Tabs>
```

### アンダーラインタブ（シンプル）

```tsx
<Tabs defaultValue="tab1" className="w-full">
  <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0">
    <TabsTrigger
      value="tab1"
      className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
    >
      概要
    </TabsTrigger>
    <TabsTrigger
      value="tab2"
      className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
    >
      詳細
    </TabsTrigger>
  </TabsList>
</Tabs>
```

---

## ダイアログ・モーダル

### 基本ダイアログ

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>開く</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>タイトル</DialogTitle>
      <DialogDescription>
        説明文がここに入ります。
      </DialogDescription>
    </DialogHeader>
    <div className="py-4">
      {/* コンテンツ */}
    </div>
    <DialogFooter>
      <Button variant="outline">キャンセル</Button>
      <Button>保存</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 確認ダイアログ

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">削除</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
      <AlertDialogDescription>
        この操作は取り消せません。
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>キャンセル</AlertDialogCancel>
      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
        削除
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## ページネーション

### 標準ページネーション

```tsx
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">10</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

---

## ファイルアップロード

### シンプルなファイルアップロード

```tsx
<div className="grid w-full max-w-sm items-center gap-1.5">
  <Label htmlFor="file">ファイル</Label>
  <Input id="file" type="file" />
</div>
```

### ドラッグ&ドロップアップロード

```tsx
<div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
  <p className="text-sm font-medium mb-1">
    ファイルをドラッグ&ドロップ
  </p>
  <p className="text-xs text-muted-foreground mb-4">
    または クリックして選択
  </p>
  <Input type="file" className="hidden" />
</div>
```

---

## プログレスバー

```tsx
<Progress value={60} className="w-full" />
```

**カスタムカラー**:
```tsx
<Progress value={60} className="w-full [&>div]:bg-success" />
<Progress value={30} className="w-full [&>div]:bg-warning" />
<Progress value={90} className="w-full [&>div]:bg-accent" />
```

---

## レイアウトパターン

### サイドバー付きレイアウト

```tsx
<div className="flex h-screen">
  {/* サイドバー */}
  <aside className="w-64 border-r border-border bg-card">
    <nav className="p-4">
      {/* ナビゲーション */}
    </nav>
  </aside>

  {/* メインコンテンツ */}
  <div className="flex-1 flex flex-col">
    {/* ヘッダー */}
    <header className="h-16 border-b border-border bg-background px-6 flex items-center justify-between">
      {/* ヘッダーコンテンツ */}
    </header>

    {/* メインエリア */}
    <main className="flex-1 overflow-auto p-6">
      {/* コンテンツ */}
    </main>
  </div>
</div>
```

### グリッドレイアウト（ダッシュボード）

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <Card>統計カード1</Card>
  <Card>統計カード2</Card>
  <Card>統計カード3</Card>
  <Card>統計カード4</Card>
</div>
```

### 2カラムレイアウト

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* メインコンテンツ（2カラム分） */}
  <div className="lg:col-span-2">
    <Card>メインコンテンツ</Card>
  </div>

  {/* サイドバー（1カラム分） */}
  <div>
    <Card>サイドバーコンテンツ</Card>
  </div>
</div>
```

---

## アイコン使用ガイドライン

### アイコンライブラリ

```tsx
import { Search, Bell, User, Settings, Menu, Plus, Edit, Trash2, Check, X, ChevronDown, ChevronRight, Home, FileText, Calendar, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'
```

### アイコンサイズ

- `h-3 w-3`: 12px - 非常に小さい
- `h-4 w-4`: 16px - **標準（推奨）**
- `h-5 w-5`: 20px - 中サイズ
- `h-6 w-6`: 24px - 大きめ
- `h-8 w-8`: 32px - 大きい

### アイコンの色

```tsx
<Search className="h-4 w-4 text-muted-foreground" />
<Bell className="h-4 w-4 text-primary" />
<AlertCircle className="h-4 w-4 text-destructive" />
```

---

## ダークモード対応

全てのコンポーネントはダークモードに自動対応します。カラーはCSS変数で定義されており、`dark:`プレフィックスは不要です。

### ダークモード切替

`.dark` クラスをルート要素に付与することでダークモードが有効になります。

```tsx
// 例: Next.js App Router
<html lang="ja" className={isDark ? "dark" : ""}>
```

---

## 実装ルール

### 必須ルール

1. **カラーは必ずデザインシステムのトークンから選択する**
   - プライマリー: `bg-primary`, `text-primary`, `border-primary`
   - セカンダリー: `bg-secondary`, `text-secondary-foreground`
   - アクセント: `bg-accent`, `text-accent-foreground`
   - セマンティック: `bg-success`, `bg-warning`, `bg-destructive`
   - 任意の色 `bg-[#3b82f6]` は使用しない

2. **コンポーネントはshadcn/uiを使用する**
   - Button, Card, Input, Select, Dialog等、既存コンポーネントを活用
   - カスタムコンポーネントを作る前に、既存コンポーネントで実現できないか確認

3. **スペーシングはTailwindのスケールを使用する**
   - `gap-4`, `p-6`, `mx-4` 等
   - `gap-[16px]`, `p-[24px]` のような任意の値は避ける

4. **レイアウトはFlexboxを優先する**
   - `flex items-center justify-between`
   - 複雑な2Dレイアウトのみ `grid` を使用

5. **テキストは可読性を確保する**
   - 本文: `leading-relaxed` または `leading-6`
   - コントラスト: WCAG AA準拠

6. **ボーダーラジウスは統一する**
   - カード・モーダル: `rounded-lg` または `rounded-xl`
   - ボタン・インプット: `rounded-md`

7. **シャドウは控えめに使用する**
   - カード: `shadow` または `shadow-md`
   - モーダル: `shadow-lg`

### コード例（推奨パターン）

```tsx
// 良い例
<Card className="rounded-lg shadow-md">
  <CardHeader>
    <CardTitle className="text-2xl font-semibold text-foreground">
      プロジェクト概要
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">ステータス</span>
      <Badge className="bg-success text-success-foreground">進行中</Badge>
    </div>
  </CardContent>
  <CardFooter className="flex gap-2">
    <Button variant="default" className="flex-1">
      <Check className="mr-2 h-4 w-4" />
      承認
    </Button>
    <Button variant="outline" className="flex-1 bg-transparent">
      詳細
    </Button>
  </CardFooter>
</Card>

// 悪い例（任意の値を使用）
<div style={{ backgroundColor: '#3b82f6', padding: '16px', borderRadius: '8px' }}>
  <h2 style={{ fontSize: '24px', fontWeight: 600 }}>プロジェクト概要</h2>
</div>
```

---

## チェックリスト

新しい画面・コンポーネントを作成する際は、以下を確認してください：

- [ ] プライマリーカラー（Professional Blue）を主要アクションに使用している
- [ ] セカンダリー/アクセントカラー（Teal）を補助要素に使用している
- [ ] セマンティックカラー（Success, Warning, Destructive）を適切に使用している
- [ ] 任意の色値（`bg-[#xxx]`）ではなく、定義済みのカラートークンを使用している
- [ ] shadcn/uiコンポーネント（Button, Card, Input等）を活用している
- [ ] Tailwindのスペーシングスケール（`p-4`, `gap-6`等）を使用している
- [ ] Flexboxを優先し、必要な場合のみGridを使用している
- [ ] テキストに適切な`leading-relaxed`を設定している
- [ ] ボーダーラジウスは`rounded-lg`等、統一されたスケールを使用している
- [ ] シャドウは控えめ（`shadow`, `shadow-md`）に使用している
- [ ] アイコンサイズは`h-4 w-4`を標準としている
- [ ] ダークモード対応（CSS変数ベース）を考慮している

---

## まとめ

このデザインシステムは、ProcurERP の全ての画面・コンポーネント作成時に適用されます。**必ず定義されたカラー、コンポーネント、スペーシング、レイアウトパターンに従ってください**。統一感のある、プロフェッショナルで使いやすいUIを実現するために、このルールを遵守してください。

---

## 技術的制約

### Tailwind CSS バージョン
- 本プロジェクトは **Tailwind CSS v3** を使用
- v0 生成時の CSS は v3 構文に変換が必要
- 詳細は `.kiro/steering/v0-workflow.md` の「6. Tailwind CSS バージョン制約」を参照

### CSS トークン定義場所
- 正本: `apps/web/src/shared/ui/tokens/globals.css`
- Tailwind 設定: `apps/web/tailwind.config.ts`

---

**バージョン**: 2.0
**最終更新**: 2025-12-22
**対象プロダクト**: ProcurERP（調達管理SaaS）
**カラー体系**: Professional Blue (Primary) + Teal (Secondary/Accent)
**CSS フレームワーク**: Tailwind CSS v3
