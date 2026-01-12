"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { PartyDto, PartySortBy, SortOrder } from "../types/bff-contracts"
import { bffClient } from "../api/client"
import { getErrorMessage } from "../utils/error-messages"
import { useDebounce } from "../hooks/useDebounce"

// TODO: Import from @/shared/ui once available
// For now, using placeholder components
function Button({ children, onClick, variant = "default", className = "" }: any) {
  const baseClass = "px-4 py-2 rounded-lg font-medium transition-colors"
  const variantClass =
    variant === "outline"
      ? "border border-border bg-background hover:bg-accent"
      : "bg-primary text-primary-foreground hover:bg-primary/90"
  return (
    <button onClick={onClick} className={`${baseClass} ${variantClass} ${className}`}>
      {children}
    </button>
  )
}

function Input({ value, onChange, placeholder, className = "" }: any) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`px-3 py-2 border border-input rounded-lg bg-background ${className}`}
    />
  )
}

function Select({ value, onChange, children, className = "" }: any) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-2 border border-input rounded-lg bg-background ${className}`}
    >
      {children}
    </select>
  )
}

function Card({ children, className = "" }: any) {
  return <div className={`bg-card border border-border rounded-lg ${className}`}>{children}</div>
}

function Alert({ children, variant = "default" }: any) {
  const variantClass = variant === "destructive" ? "bg-destructive/10 text-destructive border-destructive" : "bg-muted"
  return <div className={`p-4 rounded-lg border ${variantClass}`}>{children}</div>
}

function Table({ children }: any) {
  return <table className="w-full">{children}</table>
}

function TableHeader({ children }: any) {
  return <thead className="border-b border-border">{children}</thead>
}

function TableBody({ children }: any) {
  return <tbody>{children}</tbody>
}

function TableRow({ children, onClick, className = "" }: any) {
  return (
    <tr onClick={onClick} className={`border-b border-border ${className}`}>
      {children}
    </tr>
  )
}

function TableHead({ children, onClick, className = "" }: any) {
  return (
    <th onClick={onClick} className={`px-4 py-3 text-left font-medium text-sm ${className}`}>
      {children}
    </th>
  )
}

function TableCell({ children, className = "" }: any) {
  return <td className={`px-4 py-3 text-sm ${className}`}>{children}</td>
}

export function PartyList({
  onSelectParty,
  onCreateParty,
}: {
  onSelectParty: (party: PartyDto) => void
  onCreateParty: () => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [parties, setParties] = useState<PartyDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // URL state
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1)
  const [pageSize] = useState(Number(searchParams.get("pageSize")) || 50)
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "")
  const [isSupplierFilter, setIsSupplierFilter] = useState<string>(searchParams.get("isSupplier") || "all")
  const [isCustomerFilter, setIsCustomerFilter] = useState<string>(searchParams.get("isCustomer") || "all")
  const [sortBy, setSortBy] = useState<PartySortBy>((searchParams.get("sortBy") as PartySortBy) || "partyCode")
  const [sortOrder, setSortOrder] = useState<SortOrder>((searchParams.get("sortOrder") as SortOrder) || "asc")

  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const debouncedKeyword = useDebounce(keyword, 300)

  useEffect(() => {
    // Update URL
    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("pageSize", String(pageSize))
    if (debouncedKeyword) params.set("keyword", debouncedKeyword)
    if (isSupplierFilter !== "all") params.set("isSupplier", isSupplierFilter)
    if (isCustomerFilter !== "all") params.set("isCustomer", isCustomerFilter)
    params.set("sortBy", sortBy)
    params.set("sortOrder", sortOrder)

    router.replace(`?${params.toString()}`, { scroll: false })
  }, [page, pageSize, debouncedKeyword, isSupplierFilter, isCustomerFilter, sortBy, sortOrder, router])

  useEffect(() => {
    loadParties()
  }, [page, pageSize, debouncedKeyword, isSupplierFilter, isCustomerFilter, sortBy, sortOrder])

  const loadParties = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await bffClient.listParties({
        page,
        pageSize,
        keyword: debouncedKeyword || undefined,
        isSupplier: isSupplierFilter === "all" ? undefined : isSupplierFilter === "true",
        isCustomer: isCustomerFilter === "all" ? undefined : isCustomerFilter === "true",
        sortBy,
        sortOrder,
      })
      setParties(response.items)
      setTotal(response.total)
      setTotalPages(response.totalPages)
    } catch (err: any) {
      setError(getErrorMessage(err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (column: PartySortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const handleNavigateToSupplierSites = (partyId: string) => {
    router.push(`/master-data/business-partner/supplier-sites?partyId=${partyId}`)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">取引先一覧</h1>
        <Button onClick={onCreateParty}>新規登録</Button>
      </div>

      {/* Search & Filter */}
      <Card className="p-4">
        <div className="flex gap-4 flex-wrap">
          <Input
            value={keyword}
            onChange={setKeyword}
            placeholder="取引先コード・名称・名称カナで検索"
            className="flex-1 min-w-[300px]"
          />
          <Select value={isSupplierFilter} onChange={setIsSupplierFilter}>
            <option value="all">すべて（仕入先）</option>
            <option value="true">仕入先</option>
            <option value="false">仕入先以外</option>
          </Select>
          <Select value={isCustomerFilter} onChange={setIsCustomerFilter}>
            <option value="all">すべて（得意先）</option>
            <option value="true">得意先</option>
            <option value="false">得意先以外</option>
          </Select>
        </div>
      </Card>

      {/* Error Alert */}
      {error && <Alert variant="destructive">{error}</Alert>}

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort("partyCode")} className="cursor-pointer hover:bg-muted">
                  取引先コード {sortBy === "partyCode" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead onClick={() => handleSort("partyName")} className="cursor-pointer hover:bg-muted">
                  取引先名 {sortBy === "partyName" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead onClick={() => handleSort("partyNameKana")} className="cursor-pointer hover:bg-muted">
                  取引先名カナ {sortBy === "partyNameKana" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead onClick={() => handleSort("isSupplier")} className="cursor-pointer hover:bg-muted">
                  仕入先 {sortBy === "isSupplier" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead onClick={() => handleSort("isCustomer")} className="cursor-pointer hover:bg-muted">
                  得意先 {sortBy === "isCustomer" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead onClick={() => handleSort("isActive")} className="cursor-pointer hover:bg-muted">
                  有効 {sortBy === "isActive" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    読み込み中...
                  </TableCell>
                </TableRow>
              ) : parties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    データがありません
                  </TableCell>
                </TableRow>
              ) : (
                parties.map((party) => (
                  <TableRow
                    key={party.id}
                    onClick={() => onSelectParty(party)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-mono">{party.partyCode}</TableCell>
                    <TableCell>{party.partyName}</TableCell>
                    <TableCell className="text-muted-foreground">{party.partyNameKana || "-"}</TableCell>
                    <TableCell>{party.isSupplier ? "○" : "-"}</TableCell>
                    <TableCell>{party.isCustomer ? "○" : "-"}</TableCell>
                    <TableCell>{party.isActive ? "有効" : "無効"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={(e: any) => {
                            e.stopPropagation()
                            onSelectParty(party)
                          }}
                        >
                          編集
                        </Button>
                        {party.isSupplier && (
                          <Button
                            variant="outline"
                            onClick={(e: any) => {
                              e.stopPropagation()
                              handleNavigateToSupplierSites(party.id)
                            }}
                          >
                            仕入先
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              {total}件中 {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)}件を表示
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                前へ
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {page} / {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                次へ
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
