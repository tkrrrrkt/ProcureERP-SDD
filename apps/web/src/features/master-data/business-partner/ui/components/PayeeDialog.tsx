"use client"

import { useState, useEffect } from "react"
import type { PartyDto, PayeeDto, CreatePayeeRequest, UpdatePayeeRequest } from "../types/bff-contracts"
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
        className="bg-card rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
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
  const baseClass = "px-4 py-2 rounded-lg font-medium transition-colors text-sm"
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

function Input({ label, value, onChange, placeholder, error, maxLength, required, disabled }: any) {
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
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg bg-background text-sm ${error ? "border-destructive" : "border-input"} ${disabled ? "opacity-50" : ""}`}
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
        className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm"
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

export function PayeeDialog({
  open,
  onOpenChange,
  partyId,
  party,
  payee,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  partyId: string
  party: PartyDto
  payee?: PayeeDto
  onSuccess: () => void
}) {
  const isEdit = !!payee

  const [payeeSubCode, setPayeeSubCode] = useState("")
  const [payeeName, setPayeeName] = useState("")
  const [payeeNameKana, setPayeeNameKana] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [prefecture, setPrefecture] = useState("")
  const [city, setCity] = useState("")
  const [addressLine1, setAddressLine1] = useState("")
  const [addressLine2, setAddressLine2] = useState("")
  const [phone, setPhone] = useState("")
  const [fax, setFax] = useState("")
  const [email, setEmail] = useState("")
  const [contactName, setContactName] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [currencyCode, setCurrencyCode] = useState("JPY")
  const [paymentTermsText, setPaymentTermsText] = useState("")
  const [isActive, setIsActive] = useState(true)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (payee) {
      setPayeeSubCode(payee.payeeSubCode)
      setPayeeName(payee.payeeName)
      setPayeeNameKana(payee.payeeNameKana || "")
      setPostalCode(payee.postalCode || "")
      setPrefecture(payee.prefecture || "")
      setCity(payee.city || "")
      setAddressLine1(payee.addressLine1 || "")
      setAddressLine2(payee.addressLine2 || "")
      setPhone(payee.phone || "")
      setFax(payee.fax || "")
      setEmail(payee.email || "")
      setContactName(payee.contactName || "")
      setPaymentMethod(payee.paymentMethod || "")
      setCurrencyCode(payee.currencyCode || "JPY")
      setPaymentTermsText(payee.paymentTermsText || "")
      setIsActive(payee.isActive)
    } else {
      setPayeeSubCode("")
      setPayeeName("")
      setPayeeNameKana("")
      setPostalCode("")
      setPrefecture("")
      setCity("")
      setAddressLine1("")
      setAddressLine2("")
      setPhone("")
      setFax("")
      setEmail("")
      setContactName("")
      setPaymentMethod("")
      setCurrencyCode("JPY")
      setPaymentTermsText("")
      setIsActive(true)
    }
    setErrors({})
    setApiError(null)
  }, [payee, open])

  const handlePayeeSubCodeChange = (value: string) => {
    const normalized = normalizeCode(value)
    setPayeeSubCode(normalized)
    if (errors.payeeSubCode) {
      setErrors({ ...errors, payeeSubCode: "" })
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!payeeSubCode) {
      newErrors.payeeSubCode = "支払先コード（枝番）は必須です"
    } else if (!validateCodeLength(payeeSubCode)) {
      newErrors.payeeSubCode = "支払先コード（枝番）は10桁で入力してください"
    }

    if (!payeeName.trim()) {
      newErrors.payeeName = "支払先名は必須です"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    setSaving(true)
    setApiError(null)

    try {
      if (isEdit && payee) {
        const request: UpdatePayeeRequest = {
          payeeName: payeeName.trim(),
          payeeNameKana: payeeNameKana.trim() || undefined,
          postalCode: postalCode.trim() || undefined,
          prefecture: prefecture.trim() || undefined,
          city: city.trim() || undefined,
          addressLine1: addressLine1.trim() || undefined,
          addressLine2: addressLine2.trim() || undefined,
          phone: phone.trim() || undefined,
          fax: fax.trim() || undefined,
          email: email.trim() || undefined,
          contactName: contactName.trim() || undefined,
          paymentMethod: paymentMethod.trim() || undefined,
          currencyCode: currencyCode.trim() || undefined,
          paymentTermsText: paymentTermsText.trim() || undefined,
          isActive,
          version: payee.version,
        }
        await bffClient.updatePayee(payee.id, request)
      } else {
        const request: CreatePayeeRequest = {
          partyId,
          payeeSubCode,
          payeeName: payeeName.trim(),
          payeeNameKana: payeeNameKana.trim() || undefined,
          postalCode: postalCode.trim() || undefined,
          prefecture: prefecture.trim() || undefined,
          city: city.trim() || undefined,
          addressLine1: addressLine1.trim() || undefined,
          addressLine2: addressLine2.trim() || undefined,
          phone: phone.trim() || undefined,
          fax: fax.trim() || undefined,
          email: email.trim() || undefined,
          contactName: contactName.trim() || undefined,
          paymentMethod: paymentMethod.trim() || undefined,
          currencyCode: currencyCode.trim() || undefined,
          paymentTermsText: paymentTermsText.trim() || undefined,
        }
        await bffClient.createPayee(request)
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
        <DialogTitle>{isEdit ? "支払先編集" : "支払先新規登録"}</DialogTitle>
      </DialogHeader>

      <DialogContent>
        {apiError && <Alert variant="destructive">{apiError}</Alert>}

        <div className="space-y-6 mt-4">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-bold mb-3">基本情報</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="支払先コード（枝番）"
                value={payeeSubCode}
                onChange={handlePayeeSubCodeChange}
                placeholder="10桁の枝番を入力"
                error={errors.payeeSubCode}
                maxLength={10}
                required
                disabled={isEdit}
              />
              <div className="text-sm text-muted-foreground flex items-end pb-2">
                完全コード: {party.partyCode}-{payeeSubCode || "??????????"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input
                label="支払先名"
                value={payeeName}
                onChange={setPayeeName}
                placeholder="例: 株式会社サンプル商事 経理部"
                error={errors.payeeName}
                required
              />
              <Input
                label="支払先名カナ"
                value={payeeNameKana}
                onChange={setPayeeNameKana}
                placeholder="例: カブシキガイシャサンプルショウジ ケイリブ"
              />
            </div>
          </div>

          {/* Address & Contact */}
          <div>
            <h3 className="text-sm font-bold mb-3">住所・連絡先</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="郵便番号" value={postalCode} onChange={setPostalCode} placeholder="例: 100-0001" />
              <Input label="都道府県" value={prefecture} onChange={setPrefecture} placeholder="例: 東京都" />
              <Input label="市区町村" value={city} onChange={setCity} placeholder="例: 千代田区" />
              <Input label="住所1" value={addressLine1} onChange={setAddressLine1} placeholder="例: 丸の内1-1-1" />
              <Input label="住所2" value={addressLine2} onChange={setAddressLine2} placeholder="例: サンプルビル3F" />
              <Input label="電話" value={phone} onChange={setPhone} placeholder="例: 03-1234-5678" />
              <Input label="FAX" value={fax} onChange={setFax} placeholder="例: 03-1234-5679" />
              <Input label="メール" value={email} onChange={setEmail} placeholder="例: tokyo@sample.co.jp" />
              <Input label="担当者名" value={contactName} onChange={setContactName} placeholder="例: 山田太郎" />
            </div>
          </div>

          {/* Payment Info */}
          <div>
            <h3 className="text-sm font-bold mb-3">支払情報</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="支払方法" value={paymentMethod} onChange={setPaymentMethod} placeholder="例: 銀行振込" />
              <Input label="通貨" value={currencyCode} onChange={setCurrencyCode} placeholder="例: JPY" />
            </div>
            <div className="mt-4">
              <Textarea
                label="支払条件"
                value={paymentTermsText}
                onChange={setPaymentTermsText}
                placeholder="例: 月末締め翌月末払い"
              />
            </div>
          </div>

          {isEdit && <Checkbox label="有効" checked={isActive} onChange={setIsActive} />}
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
