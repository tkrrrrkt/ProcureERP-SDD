"use client"

import { useState, useEffect } from "react"
import type { PayeeDto } from "../types/bff-contracts"
import { bffClient } from "../api/client"
import { getErrorMessage } from "../utils/error-messages"

// TODO: Import from @/shared/ui
function Dialog({ open, onOpenChange, children }: any) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-card rounded-lg shadow-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

function DialogHeader({ children }: any) {
  return <div className="p-6 border-b border-border">{children}</div>
}

function DialogTitle({ children }: any) {
  return <h2 className="text-xl font-bold">{children}</h2>
}

function DialogContent({ children }: any) {
  return <div className="p-6">{children}</div>
}

function Button({ children, onClick, variant = "default" }: any) {
  const baseClass = "px-3 py-1.5 rounded text-sm font-medium transition-colors"
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

function TableRow({ children }: any) {
  return <tr className="border-b border-border">{children}</tr>
}

function TableHead({ children }: any) {
  return <th className="px-4 py-3 text-left font-medium text-sm">{children}</th>
}

function TableCell({ children, className = "" }: any) {
  return <td className={`px-4 py-3 text-sm ${className}`}>{children}</td>
}

export function PayeeSelectionDialog({
  open,
  onOpenChange,
  partyId,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  partyId: string
  onSelect: (payee: PayeeDto) => void
}) {
  const [payees, setPayees] = useState<PayeeDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && partyId) {
      loadPayees()
    }
  }, [open, partyId])

  const loadPayees = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await bffClient.listPayees({ partyId })
      setPayees(response.items)
    } catch (err: any) {
      setError(getErrorMessage(err.message))
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (payee: PayeeDto) => {
    const parts = [payee.prefecture, payee.city, payee.addressLine1].filter(Boolean)
    return parts.join(" ") || "-"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>支払先選択</DialogTitle>
      </DialogHeader>

      <DialogContent>
        {error && <Alert variant="destructive">{error}</Alert>}

        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>支払先コード</TableHead>
                <TableHead>支払先名</TableHead>
                <TableHead>郵便番号</TableHead>
                <TableHead>住所</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    読み込み中...
                  </TableCell>
                </TableRow>
              ) : payees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    支払先が登録されていません
                  </TableCell>
                </TableRow>
              ) : (
                payees.map((payee) => (
                  <TableRow key={payee.id}>
                    <TableCell className="font-mono">{payee.payeeCode}</TableCell>
                    <TableCell>{payee.payeeName}</TableCell>
                    <TableCell className="font-mono">{payee.postalCode || "-"}</TableCell>
                    <TableCell>{formatAddress(payee)}</TableCell>
                    <TableCell>
                      <Button onClick={() => onSelect(payee)}>選択</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
