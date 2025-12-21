/**
 * Menu SSoT (Information Architecture)
 *
 * This file defines:
 * - What screens exist in the SaaS
 * - How they are grouped
 * - Which features are reachable by users
 *
 * Features MUST NOT define their own entry points.
 *
 * ProcurERP - 調達管理SaaS
 */

import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  ShoppingCart,
  PackageCheck,
  Receipt,
  Database,
  Settings,
  Users,
  Building2,
  Truck,
  Package,
  BarChart3,
  TrendingUp,
  UserCircle,
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
    id: "procurement-flow",
    label: "Procurement",
    labelJa: "購買プロセス",
    icon: ShoppingCart,
    children: [
      {
        id: "purchase-request",
        label: "Purchase Requests",
        labelJa: "購買依頼",
        path: "/procurement/purchase-requests",
        icon: ClipboardList,
      },
      {
        id: "quotation",
        label: "Quotations",
        labelJa: "見積",
        path: "/procurement/quotations",
        icon: FileText,
      },
      {
        id: "purchase-order",
        label: "Purchase Orders",
        labelJa: "発注",
        path: "/procurement/purchase-orders",
        icon: ShoppingCart,
      },
      {
        id: "goods-receipt",
        label: "Goods Receipt",
        labelJa: "入荷",
        path: "/procurement/goods-receipts",
        icon: PackageCheck,
      },
      {
        id: "purchase-booking",
        label: "Purchase Booking",
        labelJa: "仕入計上",
        path: "/procurement/purchase-bookings",
        icon: Receipt,
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
        id: "supplier-master",
        label: "Suppliers",
        labelJa: "仕入先",
        path: "/master-data/suppliers",
        icon: Truck,
      },
      {
        id: "item-master",
        label: "Items",
        labelJa: "品目",
        path: "/master-data/items",
        icon: Package,
      },
      {
        id: "organization-master",
        label: "Organizations",
        labelJa: "組織",
        path: "/master-data/organizations",
        icon: Building2,
      },
      {
        id: "employee-master",
        label: "Employees",
        labelJa: "社員",
        path: "/master-data/employee-master",
        icon: UserCircle,
      },
    ],
  },
  {
    id: "reporting",
    label: "Reports",
    labelJa: "レポート",
    icon: BarChart3,
    children: [
      {
        id: "spend-analysis",
        label: "Spend Analysis",
        labelJa: "Spend分析",
        path: "/reports/spend-analysis",
        icon: TrendingUp,
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
