/**
 * Menu SSoT (Information Architecture)
 *
 * This file defines:
 * - What screens exist in the SaaS
 * - How they are grouped
 * - Which features are reachable by users
 *
 * Features MUST NOT define their own entry points.
 */

import {
  LayoutDashboard,
  Calculator,
  BarChart3,
  Database,
  Settings,
  Users,
  Building2,
  FolderKanban,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"

export type MenuItem = {
  id: string
  label: string
  labelJa?: string
  path?: string
  icon?: LucideIcon
  children?: MenuItem[]
}

export const menu: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    labelJa: "ダッシュボード",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "planning",
    label: "Planning",
    labelJa: "計画",
    icon: Calculator,
    children: [
      {
        id: "budget-entry",
        label: "Budget Entry",
        labelJa: "予算入力",
        path: "/planning/budget-entry",
      },
    ],
  },
  {
    id: "analysis",
    label: "Analysis",
    labelJa: "分析",
    icon: BarChart3,
    children: [
      {
        id: "budget-vs-actual",
        label: "Budget vs Actual",
        labelJa: "予実分析",
        path: "/analysis/budget-vs-actual",
        icon: TrendingUp,
      },
    ],
  },
  {
    id: "master-data",
    label: "Master Data",
    labelJa: "マスタデータ",
    icon: Database,
    children: [
      {
        id: "project-master",
        label: "Projects",
        labelJa: "プロジェクト",
        path: "/master-data/project-master",
        icon: FolderKanban,
      },
      {
        id: "employee-master",
        label: "Employees",
        labelJa: "従業員",
        path: "/master-data/employee-master",
        icon: Users,
      },
      {
        id: "organization-master",
        label: "Organizations",
        labelJa: "組織",
        path: "/master-data/organizations",
        icon: Building2,
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    labelJa: "設定",
    icon: Settings,
    children: [
      {
        id: "user-management",
        label: "Users & Roles",
        labelJa: "ユーザー・ロール",
        path: "/settings/users",
        icon: Users,
      },
    ],
  },
]
