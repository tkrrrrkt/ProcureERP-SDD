"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  XCircle,
  Upload,
  Download,
  Search,
  Filter,
  Calendar,
  User,
  Settings,
  Home,
  BarChart3,
  FileText,
  FolderOpen,
  Mail,
  Phone,
  MapPin,
  Clock,
  Star,
  Heart,
  Share2,
  Trash2,
  Edit,
  Plus,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react"

export default function DesignSystem() {
  const [darkMode, setDarkMode] = useState(false)
  const [progress, setProgress] = useState(45)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">EPM Design System</h1>
              <p className="text-xs text-muted-foreground">Enterprise Project Management</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="rounded-lg">
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-6 py-12">
        <div className="mb-12 space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-balance">Design System</h1>
          <p className="text-xl text-muted-foreground max-w-3xl text-pretty leading-relaxed">
            モダンで洗練された、使いやすくシンプルなUIコンポーネントライブラリ。EPM
            SaaSプロダクトのための統一されたデザイン言語。
          </p>
        </div>

        {/* Color Palette Section */}
        <section className="mb-16 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Color Palette</h2>
            <p className="text-muted-foreground">プライマリー・セカンダリーカラーとセマンティックカラー</p>
          </div>

          {/* Primary Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Primary Colors - Deep Teal</CardTitle>
              <CardDescription>メインのブランドカラー。アクション、リンク、重要な要素に使用</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4 md:grid-cols-10">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div key={shade} className="space-y-2">
                    <div
                      className="h-20 w-full rounded-lg border border-border shadow-sm"
                      style={{ backgroundColor: `var(--primary-${shade})` }}
                    />
                    <div className="text-center">
                      <p className="text-xs font-medium">{shade}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Secondary Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Secondary Colors - Royal Indigo</CardTitle>
              <CardDescription>セカンダリーカラー。補助的な要素、アクセントに使用</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4 md:grid-cols-10">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div key={shade} className="space-y-2">
                    <div
                      className="h-20 w-full rounded-lg border border-border shadow-sm"
                      style={{ backgroundColor: `var(--secondary-${shade})` }}
                    />
                    <div className="text-center">
                      <p className="text-xs font-medium">{shade}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Semantic Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Semantic Colors</CardTitle>
              <CardDescription>状態やフィードバックを表現するカラー</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <div
                    className="h-24 w-full rounded-lg border border-border shadow-sm"
                    style={{ backgroundColor: "var(--success)" }}
                  />
                  <div>
                    <p className="text-sm font-medium">Success</p>
                    <p className="text-xs text-muted-foreground">成功・完了</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div
                    className="h-24 w-full rounded-lg border border-border shadow-sm"
                    style={{ backgroundColor: "var(--warning)" }}
                  />
                  <div>
                    <p className="text-sm font-medium">Warning</p>
                    <p className="text-xs text-muted-foreground">警告・注意</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div
                    className="h-24 w-full rounded-lg border border-border shadow-sm"
                    style={{ backgroundColor: "var(--error)" }}
                  />
                  <div>
                    <p className="text-sm font-medium">Error</p>
                    <p className="text-xs text-muted-foreground">エラー・危険</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div
                    className="h-24 w-full rounded-lg border border-border shadow-sm"
                    style={{ backgroundColor: "var(--info)" }}
                  />
                  <div>
                    <p className="text-sm font-medium">Info</p>
                    <p className="text-xs text-muted-foreground">情報・通知</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Buttons Section */}
        <section className="mb-16 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Buttons</h2>
            <p className="text-muted-foreground">様々なスタイルとサイズのボタンコンポーネント</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Primary Buttons</h4>
                <div className="flex flex-wrap gap-3">
                  <Button size="sm">Small</Button>
                  <Button>Default</Button>
                  <Button size="lg">Large</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Secondary Buttons</h4>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" size="sm">
                    Small
                  </Button>
                  <Button variant="secondary">Default</Button>
                  <Button variant="secondary" size="lg">
                    Large
                  </Button>
                  <Button variant="secondary" disabled>
                    Disabled
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Outline Buttons</h4>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm">
                    Small
                  </Button>
                  <Button variant="outline">Default</Button>
                  <Button variant="outline" size="lg">
                    Large
                  </Button>
                  <Button variant="outline" disabled>
                    Disabled
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Ghost Buttons</h4>
                <div className="flex flex-wrap gap-3">
                  <Button variant="ghost" size="sm">
                    Small
                  </Button>
                  <Button variant="ghost">Default</Button>
                  <Button variant="ghost" size="lg">
                    Large
                  </Button>
                  <Button variant="ghost" disabled>
                    Disabled
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Destructive Buttons</h4>
                <div className="flex flex-wrap gap-3">
                  <Button variant="destructive" size="sm">
                    Small
                  </Button>
                  <Button variant="destructive">Default</Button>
                  <Button variant="destructive" size="lg">
                    Large
                  </Button>
                  <Button variant="destructive" disabled>
                    Disabled
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Buttons with Icons</h4>
                <div className="flex flex-wrap gap-3">
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="secondary">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                  <Button variant="outline">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Icon Buttons</h4>
                <div className="flex flex-wrap gap-3">
                  <Button size="icon" variant="default">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="secondary">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Bell className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Badges Section */}
        <section className="mb-16 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Badges</h2>
            <p className="text-muted-foreground">ステータス、カテゴリー、ラベルを表示</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Badge Components</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Default Badges</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Status Badges</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-success text-white">Active</Badge>
                  <Badge className="bg-warning text-white">Pending</Badge>
                  <Badge className="bg-error text-white">Inactive</Badge>
                  <Badge className="bg-info text-white">Draft</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Badges with Icons</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge>
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Completed
                  </Badge>
                  <Badge variant="secondary">
                    <Clock className="mr-1 h-3 w-3" />
                    In Progress
                  </Badge>
                  <Badge variant="outline">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Warning
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Alerts & Notifications Section */}
        <section className="mb-16 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Alerts & Notifications</h2>
            <p className="text-muted-foreground">重要な情報やフィードバックを表示</p>
          </div>

          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>これは情報メッセージです。ユーザーに追加情報を提供します。</AlertDescription>
            </Alert>

            <Alert className="border-success bg-success/10">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertTitle className="text-success">Success</AlertTitle>
              <AlertDescription className="text-success/90">
                操作が正常に完了しました。変更が保存されました。
              </AlertDescription>
            </Alert>

            <Alert className="border-warning bg-warning/10">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertTitle className="text-warning">Warning</AlertTitle>
              <AlertDescription className="text-warning/90">
                この操作には注意が必要です。続行する前に確認してください。
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>エラーが発生しました。もう一度お試しください。</AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Cards Section */}
        <section className="mb-16 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Cards</h2>
            <p className="text-muted-foreground">コンテンツをグループ化して表示</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
                <CardDescription>プロジェクトの概要と進捗状況</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">進捗率</span>
                    <span className="text-2xl font-bold">75%</span>
                  </div>
                  <Progress value={75} />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">詳細を見る</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Team Members</CardTitle>
                  <Badge>12 Members</Badge>
                </div>
                <CardDescription>チームメンバーの管理</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">田中 太郎</p>
                        <p className="text-xs text-muted-foreground">Developer</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full bg-transparent">
                  <Plus className="mr-2 h-4 w-4" />
                  メンバー追加
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>今月のパフォーマンス</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">完了タスク</span>
                    <span className="text-2xl font-bold">48</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">進行中</span>
                    <span className="text-2xl font-bold">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">未着手</span>
                    <span className="text-2xl font-bold">6</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Table Section */}
        <section className="mb-16 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Tables</h2>
            <p className="text-muted-foreground">データを整理して表示</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Project List</CardTitle>
              <CardDescription>進行中のプロジェクト一覧</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>2024年度のプロジェクト一覧</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>プロジェクト名</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>担当者</TableHead>
                    <TableHead>期限</TableHead>
                    <TableHead className="text-right">進捗率</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Webサイトリニューアル</TableCell>
                    <TableCell>
                      <Badge className="bg-success text-white">進行中</Badge>
                    </TableCell>
                    <TableCell>田中 太郎</TableCell>
                    <TableCell>2024/03/31</TableCell>
                    <TableCell className="text-right">75%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">モバイルアプリ開発</TableCell>
                    <TableCell>
                      <Badge className="bg-warning text-white">保留中</Badge>
                    </TableCell>
                    <TableCell>佐藤 花子</TableCell>
                    <TableCell>2024/04/15</TableCell>
                    <TableCell className="text-right">45%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">マーケティング戦略</TableCell>
                    <TableCell>
                      <Badge className="bg-info text-white">計画中</Badge>
                    </TableCell>
                    <TableCell>鈴木 一郎</TableCell>
                    <TableCell>2024/05/01</TableCell>
                    <TableCell className="text-right">20%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">システム最適化</TableCell>
                    <TableCell>
                      <Badge>完了</Badge>
                    </TableCell>
                    <TableCell>高橋 美咲</TableCell>
                    <TableCell>2024/02/28</TableCell>
                    <TableCell className="text-right">100%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* Form Elements Section */}
        <section className="mb-16 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Form Elements</h2>
            <p className="text-muted-foreground">入力フォームとコントロール</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Form Components</CardTitle>
              <CardDescription>各種入力コンポーネントのサンプル</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="input-1">Input Field</Label>
                  <Input id="input-1" placeholder="テキストを入力..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="input-2">Input with Icon</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="input-2" placeholder="検索..." className="pl-9" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="select-1">Select Dropdown</Label>
                  <Select>
                    <SelectTrigger id="select-1">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="option1">オプション 1</SelectItem>
                      <SelectItem value="option2">オプション 2</SelectItem>
                      <SelectItem value="option3">オプション 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="select-2">Status Select</Label>
                  <Select>
                    <SelectTrigger id="select-2">
                      <SelectValue placeholder="ステータスを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">進行中</SelectItem>
                      <SelectItem value="pending">保留中</SelectItem>
                      <SelectItem value="completed">完了</SelectItem>
                      <SelectItem value="cancelled">中止</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="textarea-1">Textarea</Label>
                <Textarea id="textarea-1" placeholder="詳細な説明を入力..." rows={4} />
              </div>

              <div className="space-y-4">
                <Label>Checkboxes</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="check-1" defaultChecked />
                    <label
                      htmlFor="check-1"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      メール通知を受け取る
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="check-2" />
                    <label
                      htmlFor="check-2"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      週次レポートを受け取る
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="check-3" />
                    <label
                      htmlFor="check-3"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      プロモーション情報を受け取る
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Switch Toggles</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="switch-1">自動保存</Label>
                      <p className="text-sm text-muted-foreground">変更を自動的に保存します</p>
                    </div>
                    <Switch id="switch-1" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="switch-2">ダークモード</Label>
                      <p className="text-sm text-muted-foreground">ダークテーマを有効にします</p>
                    </div>
                    <Switch id="switch-2" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="switch-3">通知音</Label>
                      <p className="text-sm text-muted-foreground">通知時にサウンドを再生します</p>
                    </div>
                    <Switch id="switch-3" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Progress Bars Section */}
        <section className="mb-16 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Progress Indicators</h2>
            <p className="text-muted-foreground">進捗状況を視覚的に表示</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Progress Bars</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Default Progress</Label>
                  <span className="text-sm text-muted-foreground">45%</span>
                </div>
                <Progress value={45} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>High Progress</Label>
                  <span className="text-sm text-muted-foreground">75%</span>
                </div>
                <Progress value={75} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Complete</Label>
                  <span className="text-sm text-muted-foreground">100%</span>
                </div>
                <Progress value={100} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Low Progress</Label>
                  <span className="text-sm text-muted-foreground">20%</span>
                </div>
                <Progress value={20} />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tabs Section */}
        <section className="mb-16 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Tabs</h2>
            <p className="text-muted-foreground">コンテンツを整理して切り替え</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tab Components</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">概要</TabsTrigger>
                  <TabsTrigger value="analytics">分析</TabsTrigger>
                  <TabsTrigger value="settings">設定</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">プロジェクト概要</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      このタブには、プロジェクトの概要情報が表示されます。基本的な統計、進捗状況、重要なマイルストーンなどを確認できます。
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-border bg-card p-4">
                      <p className="text-sm text-muted-foreground">総タスク数</p>
                      <p className="text-3xl font-bold">66</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-4">
                      <p className="text-sm text-muted-foreground">完了済み</p>
                      <p className="text-3xl font-bold">48</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-4">
                      <p className="text-sm text-muted-foreground">残りタスク</p>
                      <p className="text-3xl font-bold">18</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="analytics" className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">分析ダッシュボード</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      詳細なパフォーマンス分析、チームの生産性指標、時系列データなどを表示します。
                    </p>
                  </div>
                  <div className="space-y-4">
                    <Progress value={85} />
                    <Progress value={65} />
                    <Progress value={42} />
                  </div>
                </TabsContent>
                <TabsContent value="settings" className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">プロジェクト設定</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      プロジェクトの各種設定を管理します。アクセス権限、通知設定、統合などを構成できます。
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>メール通知</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>自動アーカイブ</Label>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>公開プロジェクト</Label>
                      <Switch />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        {/* Icon Set Section */}
        <section className="mb-16 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Icon Set</h2>
            <p className="text-muted-foreground">Lucide Iconsライブラリを使用</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Common Icons</CardTitle>
              <CardDescription>よく使用されるアイコン</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-6 md:grid-cols-8">
                {[
                  { icon: Home, label: "Home" },
                  { icon: User, label: "User" },
                  { icon: Settings, label: "Settings" },
                  { icon: Bell, label: "Bell" },
                  { icon: Search, label: "Search" },
                  { icon: Filter, label: "Filter" },
                  { icon: Calendar, label: "Calendar" },
                  { icon: Mail, label: "Mail" },
                  { icon: Phone, label: "Phone" },
                  { icon: MapPin, label: "MapPin" },
                  { icon: Clock, label: "Clock" },
                  { icon: Star, label: "Star" },
                  { icon: Heart, label: "Heart" },
                  { icon: Share2, label: "Share" },
                  { icon: Download, label: "Download" },
                  { icon: Upload, label: "Upload" },
                  { icon: Edit, label: "Edit" },
                  { icon: Trash2, label: "Trash" },
                  { icon: Plus, label: "Plus" },
                  { icon: FileText, label: "File" },
                  { icon: FolderOpen, label: "Folder" },
                  { icon: BarChart3, label: "Chart" },
                  { icon: CheckCircle2, label: "Check" },
                  { icon: XCircle, label: "Close" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-card">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Typography & Spacing Section */}
        <section className="mb-16 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Typography & Spacing</h2>
            <p className="text-muted-foreground">テキストスタイルとスペーシング</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Typography Scale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Heading 1</p>
                  <h1 className="text-4xl font-bold tracking-tight">The quick brown fox jumps</h1>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Heading 2</p>
                  <h2 className="text-3xl font-bold tracking-tight">The quick brown fox jumps</h2>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Heading 3</p>
                  <h3 className="text-2xl font-semibold tracking-tight">The quick brown fox jumps</h3>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Heading 4</p>
                  <h4 className="text-xl font-semibold">The quick brown fox jumps</h4>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Body Text</p>
                  <p className="text-base leading-relaxed">
                    The quick brown fox jumps over the lazy dog. これは本文テキストのサンプルです。
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Small Text</p>
                  <p className="text-sm leading-relaxed">
                    The quick brown fox jumps over the lazy dog. これは小さなテキストのサンプルです。
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Muted Text</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The quick brown fox jumps over the lazy dog. これはミュートされたテキストのサンプルです。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Border Radius & Shadows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Small Radius</p>
                  <div className="h-20 rounded-sm border border-border bg-muted shadow-sm"></div>
                  <p className="text-xs text-muted-foreground">rounded-sm</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Medium Radius</p>
                  <div className="h-20 rounded-md border border-border bg-muted shadow-md"></div>
                  <p className="text-xs text-muted-foreground">rounded-md</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Large Radius</p>
                  <div className="h-20 rounded-lg border border-border bg-muted shadow-lg"></div>
                  <p className="text-xs text-muted-foreground">rounded-lg</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">XL Radius</p>
                  <div className="h-20 rounded-xl border border-border bg-muted shadow-xl"></div>
                  <p className="text-xs text-muted-foreground">rounded-xl</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Pagination Section */}
        <section className="mb-16 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Pagination</h2>
            <p className="text-muted-foreground">ページネーションコンポーネント</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pagination Styles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Standard Pagination</h4>
                <div className="flex items-center justify-center gap-2">
                  <Button variant="outline" size="icon">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline">1</Button>
                  <Button>2</Button>
                  <Button variant="outline">3</Button>
                  <Button variant="outline">4</Button>
                  <Button variant="outline">5</Button>
                  <Button variant="outline" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Compact Pagination</h4>
                <div className="flex items-center justify-center gap-2">
                  <Button variant="outline" size="sm">
                    前へ
                  </Button>
                  <span className="text-sm text-muted-foreground px-4">2 / 10</span>
                  <Button variant="outline" size="sm">
                    次へ
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Simple Pagination</h4>
                <div className="flex items-center justify-between">
                  <Button variant="ghost">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    前のページ
                  </Button>
                  <Button variant="ghost">
                    次のページ
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="mt-20 border-t border-border pt-12 pb-8">
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">EPM Design System - Enterprise Project Management</p>
            <p className="text-xs text-muted-foreground">
              このデザインシステムは、一貫性のあるユーザーエクスペリエンスを提供するために設計されています。
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}
