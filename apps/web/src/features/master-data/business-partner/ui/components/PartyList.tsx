"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Plus, ArrowUp, ArrowDown, FileX2 } from "lucide-react"
import type { PartyDto, PartySortBy, SortOrder } from "../types/bff-contracts"
import { bffClient } from "../api/client"
import { getErrorMessage } from "../utils/error-messages"
import { useDebounce } from "../hooks/useDebounce"

// Shared UI Components
import { Button } from "@/shared/ui/components/button"
import { Input } from "@/shared/ui/components/input"
import { Card } from "@/shared/ui/components/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/components/alert"
import { Badge } from "@/shared/ui/components/badge"
import { Skeleton } from "@/shared/ui/components/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/components/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/components/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/ui/components/pagination"

interface PartyListProps {
  onSelectParty: (party: PartyDto) => void
  onCreateParty: () => void
}

export function PartyList({ onSelectParty, onCreateParty }: PartyListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [parties, setParties] = useState<PartyDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // URL state
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1)
  const [pageSize, setPageSize] = useState(Number(searchParams.get("pageSize")) || 50)
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "")
  const [isSupplierFilter, setIsSupplierFilter] = useState<string>(searchParams.get("isSupplier") || "all")
  const [isCustomerFilter, setIsCustomerFilter] = useState<string>(searchParams.get("isCustomer") || "all")
  const [sortBy, setSortBy] = useState<PartySortBy>((searchParams.get("sortBy") as PartySortBy) || "partyCode")
  const [sortOrder, setSortOrder] = useState<SortOrder>((searchParams.get("sortOrder") as SortOrder) || "asc")

  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const debouncedKeyword = useDebounce(keyword, 300)

  // Update URL
  useEffect(() => {
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

  const loadParties = useCallback(async () => {
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "UNKNOWN_ERROR"
      setError(getErrorMessage(message))
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, debouncedKeyword, isSupplierFilter, isCustomerFilter, sortBy, sortOrder])

  useEffect(() => {
    loadParties()
  }, [loadParties])

  const handleSort = (column: PartySortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
    setPage(1)
  }

  const handleNavigateToSupplierSites = (partyId: string) => {
    router.push(`/master-data/business-partner/supplier-sites?partyId=${partyId}`)
  }

  const renderSortIcon = (column: PartySortBy) => {
    if (sortBy !== column) return null
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 inline ml-1" />
    )
  }

  const renderSkeletonRows = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      </TableRow>
    ))
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">取引先一覧</h1>
        <Button onClick={onCreateParty}>
          <Plus className="h-4 w-4 mr-2" />
          新規登録
        </Button>
      </div>

      {/* Search & Filter */}
      <Card className="p-4">
        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value)
                setPage(1)
              }}
              placeholder="取引先コード・名称・名称カナで検索"
              className="pl-10"
            />
          </div>
          <Select value={isSupplierFilter} onValueChange={(value) => { setIsSupplierFilter(value); setPage(1) }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="すべて（仕入先）" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて（仕入先）</SelectItem>
              <SelectItem value="true">仕入先</SelectItem>
              <SelectItem value="false">仕入先以外</SelectItem>
            </SelectContent>
          </Select>
          <Select value={isCustomerFilter} onValueChange={(value) => { setIsCustomerFilter(value); setPage(1) }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="すべて（得意先）" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて（得意先）</SelectItem>
              <SelectItem value="true">得意先</SelectItem>
              <SelectItem value="false">得意先以外</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  onClick={() => handleSort("partyCode")}
                  className="cursor-pointer hover:bg-muted"
                >
                  取引先コード {renderSortIcon("partyCode")}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("partyName")}
                  className="cursor-pointer hover:bg-muted"
                >
                  取引先名 {renderSortIcon("partyName")}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("partyNameKana")}
                  className="cursor-pointer hover:bg-muted"
                >
                  取引先名カナ {renderSortIcon("partyNameKana")}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("isSupplier")}
                  className="cursor-pointer hover:bg-muted"
                >
                  仕入先 {renderSortIcon("isSupplier")}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("isCustomer")}
                  className="cursor-pointer hover:bg-muted"
                >
                  得意先 {renderSortIcon("isCustomer")}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("isActive")}
                  className="cursor-pointer hover:bg-muted"
                >
                  ステータス {renderSortIcon("isActive")}
                </TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                renderSkeletonRows()
              ) : parties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileX2 className="h-10 w-10 mb-2" />
                      <p>データがありません</p>
                    </div>
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
                    <TableCell className="font-medium">{party.partyName}</TableCell>
                    <TableCell className="text-muted-foreground">{party.partyNameKana || "-"}</TableCell>
                    <TableCell>
                      {party.isSupplier ? (
                        <Badge variant="default">仕入先</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {party.isCustomer ? (
                        <Badge variant="secondary">得意先</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={party.isActive ? "default" : "outline"}>
                        {party.isActive ? "有効" : "無効"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectParty(party)
                          }}
                        >
                          編集
                        </Button>
                        {party.isSupplier && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleNavigateToSupplierSites(party.id)
                            }}
                          >
                            仕入先拠点
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
        {totalPages > 0 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                {total}件中 {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)}件を表示
              </p>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => { setPageSize(Number(value)); setPage(1) }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10件</SelectItem>
                  <SelectItem value="50">50件</SelectItem>
                  <SelectItem value="100">100件</SelectItem>
                  <SelectItem value="200">200件</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage(Math.max(1, page - 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                  if (pageNum > totalPages) return null
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setPage(pageNum)}
                        isActive={page === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>
    </div>
  )
}
