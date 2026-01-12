"use client"

import { useState, useEffect } from "react"
import type { PartyDto, PayeeDto } from "../types/bff-contracts"
import { bffClient } from "../api/client"
import { getErrorMessage } from "../utils/error-messages"
import { PayeeDialog } from "./PayeeDialog"

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

export function PayeeList({ partyId, party }: { partyId: string; party: PartyDto }) {
  const [payees, setPayees] = useState<PayeeDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [keyword, setKeyword] = useState("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPayee, setSelectedPayee] = useState<PayeeDto | undefined>()

  useEffect(() => {
    loadPayees()
  }, [partyId, keyword])

  const loadPayees = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await bffClient.listPayees({
        partyId,
        keyword: keyword || undefined,
      })
      setPayees(response.items)
    } catch (err: any) {
      setError(getErrorMessage(err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedPayee(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (payee: PayeeDto) => {
    setSelectedPayee(payee)
    setDialogOpen(true)
  }

  const formatAddress = (payee: PayeeDto) => {
    const parts = [payee.prefecture, payee.city, payee.addressLine1].filter(Boolean)
    return parts.join(" ") || "-"
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Input value={keyword} onChange={setKeyword} placeholder="支払先コード・名称で検索" />
        <Button onClick={handleCreate}>新規登録</Button>
      </div>

      {/* Error */}
      {error && <Alert variant="destructive">{error}</Alert>}

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>支払先コード</TableHead>
              <TableHead>支払先名</TableHead>
              <TableHead>支払先名カナ</TableHead>
              <TableHead>郵便番号</TableHead>
              <TableHead>住所</TableHead>
              <TableHead>電話</TableHead>
              <TableHead>支払方法</TableHead>
              <TableHead>通貨</TableHead>
              <TableHead>有効</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : payees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  データがありません
                </TableCell>
              </TableRow>
            ) : (
              payees.map((payee) => (
                <TableRow key={payee.id} onClick={() => handleEdit(payee)} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-mono">{payee.payeeCode}</TableCell>
                  <TableCell>{payee.payeeName}</TableCell>
                  <TableCell className="text-muted-foreground">{payee.payeeNameKana || "-"}</TableCell>
                  <TableCell className="font-mono">{payee.postalCode || "-"}</TableCell>
                  <TableCell>{formatAddress(payee)}</TableCell>
                  <TableCell>{payee.phone || "-"}</TableCell>
                  <TableCell>{payee.paymentMethod || "-"}</TableCell>
                  <TableCell>{payee.currencyCode || "-"}</TableCell>
                  <TableCell>{payee.isActive ? "有効" : "無効"}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={(e: any) => {
                        e.stopPropagation()
                        handleEdit(payee)
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
      <PayeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        partyId={partyId}
        party={party}
        payee={selectedPayee}
        onSuccess={loadPayees}
      />
    </div>
  )
}
