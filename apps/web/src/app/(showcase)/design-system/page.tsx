"use client"

import { useState } from "react"
import { Button } from "@/shared/ui/components/button"
import { Input } from "@/shared/ui/components/input"
import { Textarea } from "@/shared/ui/components/textarea"
import { Checkbox } from "@/shared/ui/components/checkbox"
import { Switch } from "@/shared/ui/components/switch"
import { Badge } from "@/shared/ui/components/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/components/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/components/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/components/select"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/components/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/shared/ui/components/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/components/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/ui/components/pagination"
import { Calendar } from "@/shared/ui/components/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/components/popover"
import { Progress } from "@/shared/ui/components/progress"
import { Label } from "@/shared/ui/components/label"
import { useToast } from "@/shared/ui/components/use-toast"
import { Toaster } from "@/shared/ui/components/toaster"
import { format } from "date-fns"
import {
  Moon,
  Sun,
  ChevronRight,
  Check,
  Package,
  FileText,
  TrendingUp,
  Users,
  ShoppingCart,
  BarChart3,
  Search,
  Bell,
  Copy,
  AlertCircle,
  Info,
  CheckCircle2,
  AlertTriangle,
  X,
  CalendarIcon,
  Upload,
  Download,
  Edit,
  Trash2,
  Plus,
  Settings,
  Home,
  Mail,
  Phone,
} from "lucide-react"

export default function DesignSystemPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [copiedColor, setCopiedColor] = useState<string | null>(null)
  const [date, setDate] = useState<Date>()
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [progress, setProgress] = useState(45)
  const { toast } = useToast()

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedColor(text)
    setTimeout(() => setCopiedColor(null), 2000)
  }

  const primaryColors = [
    { shade: "50", hex: "#eff6ff", name: "Blue 50" },
    { shade: "100", hex: "#dbeafe", name: "Blue 100" },
    { shade: "200", hex: "#bfdbfe", name: "Blue 200" },
    { shade: "300", hex: "#93c5fd", name: "Blue 300" },
    { shade: "400", hex: "#60a5fa", name: "Blue 400" },
    { shade: "500", hex: "#3b82f6", name: "Blue 500" },
    { shade: "600", hex: "#2563eb", name: "Blue 600" },
    { shade: "700", hex: "#1d4ed8", name: "Blue 700" },
    { shade: "800", hex: "#1e40af", name: "Blue 800" },
    { shade: "900", hex: "#1e3a8a", name: "Blue 900" },
  ]

  const secondaryColors = [
    { shade: "50", hex: "#f0fdfa", name: "Teal 50" },
    { shade: "100", hex: "#ccfbf1", name: "Teal 100" },
    { shade: "200", hex: "#99f6e4", name: "Teal 200" },
    { shade: "300", hex: "#5eead4", name: "Teal 300" },
    { shade: "400", hex: "#2dd4bf", name: "Teal 400" },
    { shade: "500", hex: "#14b8a6", name: "Teal 500" },
    { shade: "600", hex: "#0d9488", name: "Teal 600" },
    { shade: "700", hex: "#0f766e", name: "Teal 700" },
    { shade: "800", hex: "#115e59", name: "Teal 800" },
    { shade: "900", hex: "#134e4a", name: "Teal 900" },
  ]

  const semanticColors = [
    { name: "Success", hex: "#10b981", usage: "成功、承認済み", label: "成功" },
    { name: "Warning", hex: "#f59e0b", usage: "警告、注意事項", label: "警告" },
    { name: "Danger", hex: "#ef4444", usage: "エラー、却下", label: "危険" },
    { name: "Info", hex: "#3b82f6", usage: "情報表示", label: "情報" },
    { name: "Accent", hex: "#14b8a6", usage: "セカンダリーアクション、強調", label: "アクセント" },
  ]

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "colors", label: "Colors" },
    { id: "typography", label: "Typography" },
    { id: "spacing", label: "Spacing" },
    { id: "effects", label: "Effects" },
    { id: "buttons", label: "Buttons" },
    { id: "forms", label: "Forms" },
    { id: "tables", label: "Tables" },
    { id: "feedback", label: "Feedback" },
    { id: "navigation", label: "Navigation" },
  ]

  return (
    <div className={`min-h-screen bg-background transition-colors duration-300`}>
      <Toaster />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold">ProcurERP Design System</h1>
              <nav className="hidden md:flex items-center gap-6">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" })
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="overview" className="border-b border-border">
        <div className="container mx-auto px-6 lg:px-12 py-24 lg:py-32">
          <div className="max-w-4xl">
            <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20 border-0">Design System v2.0</Badge>
            <h2 className="text-5xl lg:text-7xl font-bold mb-6 text-balance leading-tight">
              Enterprise Procurement Design System
            </h2>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 text-pretty leading-relaxed">
              A modern, accessible design language for procurement workflows. Built for clarity, efficiency, and scale.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="text-base">
                Get Started
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-base bg-transparent">
                View Components
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Principles Section */}
      <section className="border-b border-border">
        <div className="container mx-auto px-6 lg:px-12 py-24">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Clarity First</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every element serves a purpose. Clear hierarchy and intuitive interactions guide users through complex
                procurement workflows.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Data-Driven</h3>
              <p className="text-muted-foreground leading-relaxed">
                Optimized for data-heavy interfaces. Tables, charts, and forms designed for quick scanning and efficient
                data entry.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Accessible</h3>
              <p className="text-muted-foreground leading-relaxed">
                WCAG 2.1 AA compliant. High contrast ratios, keyboard navigation, and screen reader support built into
                every component.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Colors Section */}
      <section id="colors" className="border-b border-border bg-black">
        <div className="container mx-auto px-6 lg:px-12 py-24">
          <div className="mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-white">Color Palette</h2>
            <p className="text-xl text-gray-400 max-w-3xl">
              Enterprise-grade color system designed for clarity and accessibility
            </p>
          </div>

          {/* Primary Colors */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-6 text-white">Primary Colors (Professional Blue)</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-0">
              {primaryColors.map((color) => (
                <div
                  key={color.shade}
                  className="group cursor-pointer relative"
                  onClick={() => copyToClipboard(color.hex)}
                >
                  <div
                    className="aspect-square w-full flex items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor: color.hex }}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      {copiedColor === color.hex ? (
                        <Check className="h-5 w-5 text-white drop-shadow-lg" />
                      ) : (
                        <Copy className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-900 border-t border-gray-800">
                    <p className="text-xs font-medium text-white mb-1">{color.shade}</p>
                    <p className="text-xs font-mono text-gray-400">{color.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Colors */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-6 text-white">Secondary Colors (Teal)</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-0">
              {secondaryColors.map((color) => (
                <div
                  key={color.shade}
                  className="group cursor-pointer relative"
                  onClick={() => copyToClipboard(color.hex)}
                >
                  <div
                    className="aspect-square w-full flex items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor: color.hex }}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      {copiedColor === color.hex ? (
                        <Check className="h-5 w-5 text-white drop-shadow-lg" />
                      ) : (
                        <Copy className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-900 border-t border-gray-800">
                    <p className="text-xs font-medium text-white mb-1">{color.shade}</p>
                    <p className="text-xs font-mono text-gray-400">{color.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Semantic Colors */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-white">Semantic Colors</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {semanticColors.map((color) => (
                <div
                  key={color.name}
                  className="group cursor-pointer rounded-lg overflow-hidden"
                  onClick={() => copyToClipboard(color.hex)}
                >
                  <div
                    className="h-32 flex items-center justify-center relative"
                    style={{ backgroundColor: color.hex }}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      {copiedColor === color.hex ? (
                        <Check className="h-6 w-6 text-white drop-shadow-lg" />
                      ) : (
                        <Copy className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                      )}
                    </div>
                    <div className="text-center z-10">
                      <p className="text-white font-bold text-lg mb-1">{color.name}</p>
                      <p className="text-white text-sm">{color.label}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-900">
                    <p className="text-sm font-mono text-white mb-2">{color.hex}</p>
                    <p className="text-xs text-gray-400">{color.usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Typography Section */}
      <section id="typography" className="border-b border-border">
        <div className="container mx-auto px-6 lg:px-12 py-24">
          <div className="mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Typography</h2>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Geist Sans for UI and body text. Geist Mono for codes, numbers, and data tables.
            </p>
          </div>

          <div className="space-y-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">Type Scale</h3>
              <div className="space-y-6">
                <div className="border-b border-border pb-6">
                  <p className="text-sm text-muted-foreground mb-2">Display / 72px</p>
                  <h1 className="text-7xl font-bold">Enterprise Procurement</h1>
                </div>
                <div className="border-b border-border pb-6">
                  <p className="text-sm text-muted-foreground mb-2">Heading 1 / 48px</p>
                  <h2 className="text-5xl font-bold">Purchase Orders</h2>
                </div>
                <div className="border-b border-border pb-6">
                  <p className="text-sm text-muted-foreground mb-2">Heading 2 / 36px</p>
                  <h3 className="text-4xl font-bold">Vendor Management</h3>
                </div>
                <div className="border-b border-border pb-6">
                  <p className="text-sm text-muted-foreground mb-2">Heading 3 / 24px</p>
                  <h4 className="text-2xl font-bold">Invoice Processing</h4>
                </div>
                <div className="border-b border-border pb-6">
                  <p className="text-sm text-muted-foreground mb-2">Body / 16px</p>
                  <p className="text-base leading-relaxed">
                    The quick brown fox jumps over the lazy dog. This is the standard body text used throughout the
                    application for readable content and descriptions.
                  </p>
                </div>
                <div className="border-b border-border pb-6">
                  <p className="text-sm text-muted-foreground mb-2">Small / 14px</p>
                  <p className="text-sm leading-relaxed">
                    Secondary information, captions, and helper text use this smaller size for visual hierarchy.
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Mono / 14px</p>
                  <p className="text-sm font-mono">PO-2024-001234 | ¥1,234,567 | SKU-ABC-123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacing Section */}
      <section id="spacing" className="border-b border-border">
        <div className="container mx-auto px-6 lg:px-12 py-24">
          <div className="mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Spacing System</h2>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Consistent spacing based on a 4px grid. Creates rhythm and visual harmony across all interfaces.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { value: "4", size: "1", pixels: "4px" },
              { value: "8", size: "2", pixels: "8px" },
              { value: "12", size: "3", pixels: "12px" },
              { value: "16", size: "4", pixels: "16px" },
              { value: "24", size: "6", pixels: "24px" },
              { value: "32", size: "8", pixels: "32px" },
              { value: "48", size: "12", pixels: "48px" },
              { value: "64", size: "16", pixels: "64px" },
              { value: "96", size: "24", pixels: "96px" },
            ].map((space) => (
              <Card key={space.value}>
                <CardContent className="p-6 flex flex-col items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold mb-1">{space.size}</p>
                    <p className="text-xs text-muted-foreground">{space.pixels}</p>
                  </div>
                  <div
                    className="bg-primary rounded"
                    style={{
                      width: `${space.value}px`,
                      height: `${space.value}px`,
                      maxWidth: "100%",
                      maxHeight: "80px",
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Effects Section */}
      <section id="effects" className="border-b border-border">
        <div className="container mx-auto px-6 lg:px-12 py-24">
          <div className="mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Shadows & Effects</h2>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Subtle shadows and effects to create depth and visual hierarchy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="shadow-sm">
              <CardContent className="p-8 text-center">
                <p className="font-medium mb-2">Small Shadow</p>
                <p className="text-xs text-muted-foreground font-mono">shadow-sm</p>
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardContent className="p-8 text-center">
                <p className="font-medium mb-2">Medium Shadow</p>
                <p className="text-xs text-muted-foreground font-mono">shadow-md</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardContent className="p-8 text-center">
                <p className="font-medium mb-2">Large Shadow</p>
                <p className="text-xs text-muted-foreground font-mono">shadow-lg</p>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-6">Border Radius</h3>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { name: "Small", class: "rounded-sm", value: "2px" },
                { name: "Medium", class: "rounded-md", value: "6px" },
                { name: "Large", class: "rounded-lg", value: "8px" },
                { name: "Extra Large", class: "rounded-xl", value: "12px" },
              ].map((radius) => (
                <Card key={radius.name}>
                  <CardContent className="p-6">
                    <div className={`h-20 bg-primary ${radius.class} mb-4`} />
                    <p className="text-sm font-medium">{radius.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{radius.class}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Buttons Section */}
      <section id="buttons" className="border-b border-border">
        <div className="container mx-auto px-6 lg:px-12 py-24">
          <div className="mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Buttons</h2>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Button variants for different actions and contexts.
            </p>
          </div>

          <div className="space-y-12">
            {/* Primary Buttons */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Primary Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <Button size="lg">Large Primary</Button>
                <Button>Default Primary</Button>
                <Button size="sm">Small Primary</Button>
              </div>
            </div>

            {/* Secondary Buttons */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Secondary Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" variant="secondary">
                  Large Secondary
                </Button>
                <Button variant="secondary">Default Secondary</Button>
                <Button size="sm" variant="secondary">
                  Small Secondary
                </Button>
              </div>
            </div>

            {/* Outline Buttons */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Outline Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" variant="outline">
                  Large Outline
                </Button>
                <Button variant="outline">Default Outline</Button>
                <Button size="sm" variant="outline">
                  Small Outline
                </Button>
              </div>
            </div>

            {/* Ghost Buttons */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Ghost Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" variant="ghost">
                  Large Ghost
                </Button>
                <Button variant="ghost">Default Ghost</Button>
                <Button size="sm" variant="ghost">
                  Small Ghost
                </Button>
              </div>
            </div>

            {/* Destructive Buttons */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Destructive Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" variant="destructive">
                  Delete Order
                </Button>
                <Button variant="destructive">Remove Item</Button>
                <Button size="sm" variant="destructive">
                  Cancel
                </Button>
              </div>
            </div>

            {/* Icon Buttons */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Icon Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <Button size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Buttons with Icons */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Buttons with Icons</h3>
              <div className="flex flex-wrap gap-4">
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
                <Button variant="secondary">
                  Create Order
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Forms Section */}
      <section id="forms" className="border-b border-border">
        <div className="container mx-auto px-6 lg:px-12 py-24">
          <div className="mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Form Components</h2>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Input fields, selects, and form controls for data entry.
            </p>
          </div>

          <div className="max-w-2xl space-y-12">
            {/* Text Inputs */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Text Inputs</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="po-number">Purchase Order Number</Label>
                  <Input id="po-number" placeholder="PO-2024-001234" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="vendor">Vendor Name</Label>
                  <Input id="vendor" placeholder="Enter vendor name" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="search" placeholder="Search orders..." className="pl-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Select Dropdown */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Select Dropdown</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Order Status</Label>
                  <Select>
                    <SelectTrigger id="status" className="mt-2">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending Approval</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select>
                    <SelectTrigger id="department" className="mt-2">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="it">IT</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Textarea */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Textarea</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Order Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter detailed description of the order..."
                    className="mt-2 min-h-[120px]"
                  />
                </div>
              </div>
            </div>

            {/* Checkbox */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Checkbox</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                    I agree to the terms and conditions
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="urgent" />
                  <Label htmlFor="urgent" className="text-sm font-normal cursor-pointer">
                    Mark as urgent order
                  </Label>
                </div>
              </div>
            </div>

            {/* Switch Toggle */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Switch Toggle</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-approve">Auto-approve orders</Label>
                    <p className="text-sm text-muted-foreground">Automatically approve orders under ¥10,000</p>
                  </div>
                  <Switch id="auto-approve" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications">Email notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates on order status</p>
                  </div>
                  <Switch id="notifications" defaultChecked />
                </div>
              </div>
            </div>

            {/* Date Pickers */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Date Pickers</h3>
              <div className="space-y-4">
                <div>
                  <Label>Single Date Picker</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal mt-2 bg-transparent"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <h3 className="text-2xl font-bold mb-6">File Upload</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="simple-upload">Simple File Upload</Label>
                  <Input id="simple-upload" type="file" className="mt-2" />
                </div>
                <div>
                  <Label>Drag & Drop Upload</Label>
                  <div className="mt-2 border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PDF, CSV, or Excel files (max 10MB)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Progress Bar</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Order Processing</Label>
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Budget Utilization</Label>
                    <span className="text-sm text-muted-foreground">75%</span>
                  </div>
                  <Progress value={75} className="[&>div]:bg-success" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tables Section */}
      <section id="tables" className="border-b border-border">
        <div className="container mx-auto px-6 lg:px-12 py-24">
          <div className="mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Table Components</h2>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Data tables for displaying and managing procurement information.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Purchase Orders</CardTitle>
              <CardDescription>A list of recent purchase orders with status and details</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Purchase orders from the last 30 days</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono">PO-2024-001234</TableCell>
                    <TableCell>Acme Corp</TableCell>
                    <TableCell>IT</TableCell>
                    <TableCell className="font-mono">¥1,234,567</TableCell>
                    <TableCell>
                      <Badge className="bg-success text-success-foreground">Approved</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">PO-2024-001235</TableCell>
                    <TableCell>Global Supplies</TableCell>
                    <TableCell>Operations</TableCell>
                    <TableCell className="font-mono">¥567,890</TableCell>
                    <TableCell>
                      <Badge className="bg-warning text-warning-foreground">Pending</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">PO-2024-001236</TableCell>
                    <TableCell>Tech Solutions</TableCell>
                    <TableCell>Finance</TableCell>
                    <TableCell className="font-mono">¥2,345,678</TableCell>
                    <TableCell>
                      <Badge className="bg-accent text-accent-foreground">In Review</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">PO-2024-001237</TableCell>
                    <TableCell>Office Depot</TableCell>
                    <TableCell>HR</TableCell>
                    <TableCell className="font-mono">¥123,456</TableCell>
                    <TableCell>
                      <Badge className="bg-destructive text-destructive-foreground">Rejected</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feedback Section */}
      <section id="feedback" className="border-b border-border">
        <div className="container mx-auto px-6 lg:px-12 py-24">
          <div className="mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Feedback Components</h2>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Alerts, notifications, and feedback elements for user communication.
            </p>
          </div>

          <div className="max-w-3xl space-y-12">
            {/* Alerts */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Alerts & Notifications</h3>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Information</AlertTitle>
                  <AlertDescription>
                    Your purchase order has been submitted and is awaiting approval from the finance department.
                  </AlertDescription>
                </Alert>

                <Alert className="border-success text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    Purchase order PO-2024-001234 has been approved and sent to the vendor.
                  </AlertDescription>
                </Alert>

                <Alert className="border-warning text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    This order is approaching the budget limit. Please review before proceeding.
                  </AlertDescription>
                </Alert>

                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Unable to process the order. The vendor information is incomplete or invalid.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            {/* Badge Components */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Badge Components</h3>
              <div className="flex flex-wrap gap-3">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge className="bg-success text-success-foreground">Success</Badge>
                <Badge className="bg-warning text-warning-foreground">Warning</Badge>
                <Badge className="bg-destructive text-destructive-foreground">Error</Badge>
                <Badge className="bg-accent text-accent-foreground">Accent</Badge>
                <Badge className="bg-primary text-primary-foreground">Primary</Badge>
              </div>
            </div>

            {/* Toast Notifications */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Toast Notifications</h3>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Order Created",
                      description: "Purchase order PO-2024-001239 has been created successfully.",
                    })
                  }}
                >
                  Show Default Toast
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Error",
                      description: "Unable to process the order. Please try again.",
                      variant: "destructive",
                    })
                  }}
                >
                  Show Error Toast
                </Button>
              </div>
            </div>

            {/* Dialog & Modal */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Dialog & Modal</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Order Deletion</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this purchase order? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button variant="destructive">Delete Order</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Card Components */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Card Components</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>Total Orders</CardTitle>
                    <CardDescription>This month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">1,234</p>
                    <p className="text-sm text-success mt-1">+12.5% from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                      <FileText className="h-5 w-5 text-accent" />
                    </div>
                    <CardTitle>Pending Approvals</CardTitle>
                    <CardDescription>Requires action</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">23</p>
                    <p className="text-sm text-muted-foreground mt-1">8 urgent items</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center mb-3">
                      <ShoppingCart className="h-5 w-5 text-success" />
                    </div>
                    <CardTitle>Total Spend</CardTitle>
                    <CardDescription>This quarter</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">¥45.2M</p>
                    <p className="text-sm text-muted-foreground mt-1">Within budget</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Section */}
      <section id="navigation" className="border-b border-border">
        <div className="container mx-auto px-6 lg:px-12 py-24">
          <div className="mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Navigation Components</h2>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Tabs, pagination, and navigation elements for organizing content.
            </p>
          </div>

          <div className="space-y-12">
            {/* Horizontal Tabs */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Horizontal Tabs (Default)</h3>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="vendors">Vendors</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Overview</CardTitle>
                      <CardDescription>Dashboard overview of your procurement activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        View key metrics, recent orders, and important notifications in one place.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="orders" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Orders</CardTitle>
                      <CardDescription>Manage your purchase orders</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Create, edit, and track purchase orders throughout their lifecycle.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Pagination */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Pagination</h3>
              <div className="space-y-8">
                <div>
                  <p className="text-sm text-muted-foreground mb-4">Standard Pagination</p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">1</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#" isActive>
                          2
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">3</PaginationLink>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Icon Set Section */}
      <section className="border-b border-border">
        <div className="container mx-auto px-6 lg:px-12 py-24">
          <div className="mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Icon Set</h2>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Lucide icons for consistent visual language throughout the application.
            </p>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
            {[
              { icon: Home, name: "Home" },
              { icon: Package, name: "Package" },
              { icon: FileText, name: "FileText" },
              { icon: Users, name: "Users" },
              { icon: ShoppingCart, name: "Cart" },
              { icon: BarChart3, name: "Chart" },
              { icon: Settings, name: "Settings" },
              { icon: Search, name: "Search" },
              { icon: Bell, name: "Bell" },
              { icon: Mail, name: "Mail" },
              { icon: Phone, name: "Phone" },
              { icon: CalendarIcon, name: "Calendar" },
              { icon: Download, name: "Download" },
              { icon: Upload, name: "Upload" },
              { icon: Edit, name: "Edit" },
              { icon: Trash2, name: "Trash" },
              { icon: Plus, name: "Plus" },
              { icon: X, name: "Close" },
              { icon: Check, name: "Check" },
              { icon: ChevronRight, name: "Chevron" },
              { icon: AlertCircle, name: "Alert" },
              { icon: Info, name: "Info" },
              { icon: CheckCircle2, name: "Success" },
              { icon: AlertTriangle, name: "Warning" },
            ].map((item) => (
              <div
                key={item.name}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-muted transition-colors"
              >
                <item.icon className="h-6 w-6" />
                <p className="text-xs text-muted-foreground">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-6 lg:px-12 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="font-bold text-lg mb-2">ProcurERP Design System</h3>
              <p className="text-sm text-muted-foreground">Built for enterprise procurement workflows</p>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm">
                Documentation
              </Button>
              <Button variant="ghost" size="sm">
                GitHub
              </Button>
              <Button variant="ghost" size="sm">
                Support
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
