"use client"

import type React from "react"

import { useState } from "react"
import {
  LayoutDashboard,
  Database,
  FileEdit,
  Search,
  Palette,
  ChevronDown,
  ChevronRight,
  Menu,
  Bell,
  User,
  Settings,
  LogOut,
  Home,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"

type MenuItem = {
  label: string
  icon: React.ElementType
  href?: string
  badge?: string
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    label: "マスタ",
    icon: Database,
    children: [
      { label: "プロジェクトマスタ", icon: Home, href: "/master/projects" },
      { label: "ユーザーマスタ", icon: User, href: "/master/users" },
      { label: "部門マスタ", icon: LayoutDashboard, href: "/master/departments" },
      { label: "カテゴリマスタ", icon: Database, href: "/master/categories" },
    ],
  },
  {
    label: "入力",
    icon: FileEdit,
    children: [
      { label: "タスク登録", icon: FileEdit, href: "/input/tasks" },
      { label: "工数入力", icon: FileEdit, href: "/input/workload" },
      { label: "経費入力", icon: FileEdit, href: "/input/expenses" },
      { label: "進捗報告", icon: FileEdit, href: "/input/progress" },
    ],
  },
  {
    label: "照会",
    icon: Search,
    children: [
      { label: "プロジェクト一覧", icon: Search, href: "/search/projects" },
      { label: "タスク一覧", icon: Search, href: "/search/tasks" },
      { label: "レポート照会", icon: Search, href: "/search/reports" },
      { label: "分析ダッシュボード", icon: LayoutDashboard, href: "/search/analytics" },
    ],
  },
  {
    label: "デザインシステム",
    icon: Palette,
    href: "/design-system",
    badge: "New",
  },
]

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["マスタ"])

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]))
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-0"
        } flex flex-col border-r border-border bg-sidebar transition-all duration-300 overflow-hidden`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-sidebar-foreground">EPM System</h2>
            <p className="text-xs text-sidebar-foreground/60">プロジェクト管理</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => (
            <div key={item.label}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {expandedMenus.includes(item.label) ? (
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                  {expandedMenus.includes(item.label) && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-sidebar-border pl-4">
                      {item.children.map((child) => (
                        <Link key={child.label} href={child.href || "#"}>
                          <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                            <child.icon className="h-3.5 w-3.5 shrink-0" />
                            <span>{child.label}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link href={item.href || "#"}>
                  <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-2">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">山田</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">山田 太郎</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">yamada@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">ダッシュボード</h1>
              <p className="text-xs text-muted-foreground">プロジェクトの概要と最新情報</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error"></span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">山田</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">山田 太郎</p>
                    <p className="text-xs text-muted-foreground">yamada@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  プロフィール
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  設定
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-error">
                  <LogOut className="mr-2 h-4 w-4" />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          {/* Breadcrumb */}
          <div className="mb-6">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                ホーム
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">ダッシュボード</span>
            </nav>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>進行中プロジェクト</CardDescription>
                <CardTitle className="text-3xl font-bold">12</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-success">
                  <span className="font-medium">+2</span> 先月から
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>完了タスク</CardDescription>
                <CardTitle className="text-3xl font-bold">248</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-success">
                  <span className="font-medium">+18%</span> 先月比
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>チームメンバー</CardDescription>
                <CardTitle className="text-3xl font-bold">32</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">28</span> アクティブ
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>平均完了率</CardDescription>
                <CardTitle className="text-3xl font-bold">87%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-success">
                  <span className="font-medium">+5%</span> 先月比
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <CardTitle>最近のプロジェクト</CardTitle>
                <CardDescription>進行中のプロジェクト一覧</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Webサイトリニューアル", progress: 75, status: "順調" },
                  { name: "モバイルアプリ開発", progress: 45, status: "遅延" },
                  { name: "マーケティング戦略", progress: 60, status: "順調" },
                  { name: "システム統合", progress: 30, status: "開始" },
                ].map((project, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{project.name}</p>
                      <Badge
                        variant={project.status === "順調" ? "default" : "secondary"}
                        className={
                          project.status === "遅延"
                            ? "bg-warning text-white"
                            : project.status === "開始"
                              ? "bg-info text-white"
                              : ""
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium w-10 text-right">
                        {project.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Team Activity */}
            <Card>
              <CardHeader>
                <CardTitle>チームアクティビティ</CardTitle>
                <CardDescription>最近の更新情報</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    user: "田中 太郎",
                    action: "タスクを完了しました",
                    task: "UIデザイン作成",
                    time: "5分前",
                  },
                  {
                    user: "佐藤 花子",
                    action: "プロジェクトを更新",
                    task: "Webサイトリニューアル",
                    time: "1時間前",
                  },
                  {
                    user: "鈴木 一郎",
                    action: "コメントを追加",
                    task: "マーケティング戦略",
                    time: "2時間前",
                  },
                  {
                    user: "高橋 美咲",
                    action: "新規タスク作成",
                    task: "バグ修正 #123",
                    time: "3時間前",
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex gap-3">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                        {activity.user.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm leading-tight">
                        <span className="font-medium">{activity.user}</span>
                        <span className="text-muted-foreground"> {activity.action}</span>
                      </p>
                      <p className="text-xs text-primary">{activity.task}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>クイックアクション</CardTitle>
              <CardDescription>よく使う機能へのショートカット</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
                  <FileEdit className="h-6 w-6" />
                  <span className="text-sm">新規タスク作成</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
                  <Database className="h-6 w-6" />
                  <span className="text-sm">プロジェクト追加</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
                  <Search className="h-6 w-6" />
                  <span className="text-sm">レポート照会</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
                  <LayoutDashboard className="h-6 w-6" />
                  <span className="text-sm">分析ダッシュボード</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
