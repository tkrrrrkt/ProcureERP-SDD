"use client"

import { useState, useEffect } from "react"
import type { PartyDto, SupplierSiteDto } from "../types/bff-contracts"
import { bffClient } from "../api/client"
import { getErrorMessage } from "../utils/error-messages"
import { SupplierSiteDialog } from "./SupplierSiteDialog"

// TODO: Import from @/shared/ui
function Button({ children, onClick, variant = "default" }: any) {
  const baseClass = "px-4 py-2 rounded-lg font-medium transition-colors"
  const variantClass =
    variant === "outline"
      ? "border border-border bg-background hover:bg-accent"
      : "bg-primary text-primary-foreground hover:bg-primary/90"
  return (
    <button onClick={onClick} className={`${baseClass} ${variantClass}`}>
      {children}
    </button>
  )
}

function Input({ value, onChange, placeholder }: any) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="px-3 py-2 border border-input rounded-lg bg-background"
    />
  )
}

function Alert({ children, variant = "default" }: any) {
  const variantClass = variant === "destructive" ? "bg-destructive/10 text-destructive border-destructive" : "bg-muted"
  return <div className={`p-3 rounded-lg border text-sm ${variantClass}`}>{children}</div>
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

function TableHead({ children }: any) {
  return <th className="px-4 py-3 text-left font-medium text-sm">{children}</th>
}

function TableCell({ children, className = "" }: any) {
  return <td className={`px-4 py-3 text-sm ${className}`}>{children}</td>
}

export function SupplierSiteList({ partyId, party }: { partyId: string; party: PartyDto }) {
  const [supplierSites, setSupplierSites] = useState<SupplierSiteDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [keyword, setKeyword] = useState("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedSite, setSelectedSite] = useState<SupplierSiteDto | undefined>()

  useEffect(() => {
    loadSupplierSites()
  }, [partyId, keyword])

  const loadSupplierSites = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await bffClient.listSupplierSites({
        partyId,
        keyword: keyword || undefined,
      })
      setSupplierSites(response.items)
    } catch (err: any) {
      setError(getErrorMessage(err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedSite(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (site: SupplierSiteDto) => {
    setSelectedSite(site)
    setDialogOpen(true)
  }

  const formatAddress = (site: SupplierSiteDto) => {
    const parts = [site.prefecture, site.city, site.addressLine1].filter(Boolean)
    return parts.join(" ") || "-"
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Input value={keyword} onChange={setKeyword} placeholder="仕入先コード・名称で検索" />
        <Button onClick={handleCreate}>新規登録</Button>
      </div>

      {/* Error */}
      {error && <Alert variant="destructive">{error}</Alert>}

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>仕入先コード</TableHead>
              <TableHead>仕入先名</TableHead>
              <TableHead>支払先コード</TableHead>
              <TableHead>支払先名</TableHead>
              <TableHead>郵便番号</TableHead>
              <TableHead>住所</TableHead>
              <TableHead>電話</TableHead>
              <TableHead>有効</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : supplierSites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  データがありません
                </TableCell>
              </TableRow>
            ) : (
              supplierSites.map((site) => (
                <TableRow key={site.id} onClick={() => handleEdit(site)} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-mono">{site.supplierCode}</TableCell>
                  <TableCell>{site.supplierName}</TableCell>
                  <TableCell className="font-mono text-primary">{site.payeeCode}</TableCell>
                  <TableCell className="text-primary">{site.payeeName}</TableCell>
                  <TableCell className="font-mono">{site.postalCode || "-"}</TableCell>
                  <TableCell>{formatAddress(site)}</TableCell>
                  <TableCell>{site.phone || "-"}</TableCell>
                  <TableCell>{site.isActive ? "有効" : "無効"}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={(e: any) => {
                        e.stopPropagation()
                        handleEdit(site)
                      }}
                    >
                      編集
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog */}
      <SupplierSiteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        partyId={partyId}
        party={party}
        supplierSite={selectedSite}
        onSuccess={loadSupplierSites}
      />
    </div>
  )
}
