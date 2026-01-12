"use client"

import { useState, useEffect } from "react"
import type { PartyDto, CreatePartyRequest, UpdatePartyRequest } from "../types/bff-contracts"
import { bffClient } from "../api/client"
import { getErrorMessage } from "../utils/error-messages"
import { normalizeCode, validateCodeLength } from "../utils/code-normalizer"

// TODO: Import from @/shared/ui
function Dialog({ open, onOpenChange, children }: any) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-card rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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

function DialogFooter({ children }: any) {
  return <div className="p-6 border-t border-border flex justify-end gap-3">{children}</div>
}

function Button({ children, onClick, variant = "default", disabled = false }: any) {
  const baseClass = "px-4 py-2 rounded-lg font-medium transition-colors"
  const variantClass =
    variant === "outline"
      ? "border border-border bg-background hover:bg-accent"
      : "bg-primary text-primary-foreground hover:bg-primary/90"
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : ""
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseClass} ${variantClass} ${disabledClass}`}>
      {children}
    </button>
  )
}

function Input({ label, value, onChange, placeholder, error, maxLength, required }: any) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full px-3 py-2 border rounded-lg bg-background ${error ? "border-destructive" : "border-input"}`}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

function Textarea({ label, value, onChange, placeholder, rows = 3 }: any) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-input rounded-lg bg-background"
      />
    </div>
  )
}

function Checkbox({ label, checked, onChange }: any) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </label>
  )
}

function Alert({ children, variant = "default" }: any) {
  const variantClass = variant === "destructive" ? "bg-destructive/10 text-destructive border-destructive" : "bg-muted"
  return <div className={`p-3 rounded-lg border text-sm ${variantClass}`}>{children}</div>
}

export function PartyDialog({
  open,
  onOpenChange,
  party,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  party?: PartyDto
  onSuccess: () => void
}) {
  const isEdit = !!party

  const [partyCode, setPartyCode] = useState("")
  const [partyName, setPartyName] = useState("")
  const [partyNameKana, setPartyNameKana] = useState("")
  const [remarks, setRemarks] = useState("")
  const [isActive, setIsActive] = useState(true)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (party) {
      setPartyCode(party.partyCode)
      setPartyName(party.partyName)
      setPartyNameKana(party.partyNameKana || "")
      setRemarks(party.remarks || "")
      setIsActive(party.isActive)
    } else {
      // Reset for create
      setPartyCode("")
      setPartyName("")
      setPartyNameKana("")
      setRemarks("")
      setIsActive(true)
    }
    setErrors({})
    setApiError(null)
  }, [party, open])

  const handlePartyCodeChange = (value: string) => {
    const normalized = normalizeCode(value)
    setPartyCode(normalized)
    if (errors.partyCode) {
      setErrors({ ...errors, partyCode: "" })
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!partyCode) {
      newErrors.partyCode = "取引先コードは必須です"
    } else if (!validateCodeLength(partyCode)) {
      newErrors.partyCode = "取引先コードは10桁で入力してください"
    }

    if (!partyName.trim()) {
      newErrors.partyName = "取引先名は必須です"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    setSaving(true)
    setApiError(null)

    try {
      if (isEdit && party) {
        const request: UpdatePartyRequest = {
          partyName: partyName.trim(),
          partyNameKana: partyNameKana.trim() || undefined,
          remarks: remarks.trim() || undefined,
          isActive,
          version: party.version,
        }
        await bffClient.updateParty(party.id, request)
      } else {
        const request: CreatePartyRequest = {
          partyCode,
          partyName: partyName.trim(),
          partyNameKana: partyNameKana.trim() || undefined,
          remarks: remarks.trim() || undefined,
          isActive,
        }
        await bffClient.createParty(request)
      }
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      setApiError(getErrorMessage(err.message))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{isEdit ? "取引先編集" : "取引先新規登録"}</DialogTitle>
      </DialogHeader>

      <DialogContent>
        {apiError && <Alert variant="destructive">{apiError}</Alert>}

        <div className="space-y-4 mt-4">
          <Input
            label="取引先コード"
            value={partyCode}
            onChange={handlePartyCodeChange}
            placeholder="10桁のコードを入力"
            error={errors.partyCode}
            maxLength={10}
            required
            disabled={isEdit}
          />

          <Input
            label="取引先名"
            value={partyName}
            onChange={setPartyName}
            placeholder="例: 株式会社サンプル商事"
            error={errors.partyName}
            required
          />

          <Input
            label="取引先名カナ"
            value={partyNameKana}
            onChange={setPartyNameKana}
            placeholder="例: カブシキガイシャサンプルショウジ"
          />

          <Textarea label="備考" value={remarks} onChange={setRemarks} placeholder="備考を入力" />

          <Checkbox label="有効" checked={isActive} onChange={setIsActive} />
        </div>
      </DialogContent>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
          キャンセル
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "保存中..." : "保存"}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
