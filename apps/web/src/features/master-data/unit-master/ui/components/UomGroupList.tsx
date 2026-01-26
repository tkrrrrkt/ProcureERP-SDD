"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Plus, ArrowUp, ArrowDown, FileX2 } from "lucide-react"
import type { UomGroupDto, UomGroupSortBy, SortOrder } from "../types/bff-contracts"
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

interface UomGroupListProps {
  onSelectGroup: (group: UomGroupDto) => void
  onCreateGroup: () => void
  onNavigateToUoms: (groupId: string) => void
}

export function UomGroupList({ onSelectGroup, onCreateGroup, onNavigateToUoms }: UomGroupListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [groups, setGroups] = useState<UomGroupDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // URL state
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1)
  const [pageSize, setPageSize] = useState(Number(searchParams.get("pageSize")) || 50)
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "")
  const [isActiveFilter, setIsActiveFilter] = useState<string>(searchParams.get("isActive") || "all")
  const [sortBy, setSortBy] = useState<UomGroupSortBy>((searchParams.get("sortBy") as UomGroupSortBy) || "groupCode")
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
    if (isActiveFilter !== "all") params.set("isActive", isActiveFilter)
    params.set("sortBy", sortBy)
    params.set("sortOrder", sortOrder)

    router.replace(`?${params.toString()}`, { scroll: false })
  }, [page, pageSize, debouncedKeyword, isActiveFilter, sortBy, sortOrder, router])

  const loadGroups = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await bffClient.listUomGroups({
        page,
        pageSize,
        keyword: debouncedKeyword || undefined,
        isActive: isActiveFilter === "all" ? undefined : isActiveFilter === "true",
        sortBy,
        sortOrder,
      })
      setGroups(response.items)
      setTotal(response.total)
      setTotalPages(response.totalPages)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "UNKNOWN_ERROR"
      setError(getErrorMessage(message))
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, debouncedKeyword, isActiveFilter, sortBy, sortOrder])

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  const handleSort = (column: UomGroupSortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
    setPage(1)
  }

  const renderSortIcon = (column: UomGroupSortBy) => {
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
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      </TableRow>
    ))
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">単位グループ一覧</h1>
        <Button onClick={onCreateGroup}>
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
              placeholder="グループコード・グループ名で検索"
              className="pl-10"
            />
          </div>
          <Select value={isActiveFilter} onValueChange={(value) => { setIsActiveFilter(value); setPage(1) }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="すべて（ステータス）" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="true">有効のみ</SelectItem>
              <SelectItem value="false">無効のみ</SelectItem>
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
                  onClick={() => handleSort("groupCode")}
                  className="cursor-pointer hover:bg-muted"
                >
                  グループコード {renderSortIcon("groupCode")}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("groupName")}
                  className="cursor-pointer hover:bg-muted"
                >
                  グループ名 {renderSortIcon("groupName")}
                </TableHead>
                <TableHead>
                  基準単位
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
              ) : groups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileX2 className="h-10 w-10 mb-2" />
                      <p>データがありません</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                groups.map((group) => (
                  <TableRow
                    key={group.id}
                    onClick={() => onSelectGroup(group)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-mono">{group.groupCode}</TableCell>
                    <TableCell className="font-medium">{group.groupName}</TableCell>
                    <TableCell>
                      {group.baseUom ? (
                        <span className="text-sm">
                          {group.baseUom.uomCode} ({group.baseUom.uomName})
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={group.isActive ? "default" : "outline"}>
                        {group.isActive ? "有効" : "無効"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectGroup(group)
                          }}
                        >
                          編集
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onNavigateToUoms(group.id)
                          }}
                        >
                          単位一覧
                        </Button>
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
