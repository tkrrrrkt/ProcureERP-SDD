"use client"

import { useState, useEffect } from "react"
import type {
  PartyDto,
  SupplierSiteDto,
  PayeeDto,
  CreateSupplierSiteRequest,
  UpdateSupplierSiteRequest,
} from "../types/bff-contracts"
import { bffClient } from "../api/client"
import { getErrorMessage } from "../utils/error-messages"
import { normalizeCode, validateCodeLength } from "../utils/code-normalizer"
import { PayeeSelectionDialog } from "./PayeeSelectionDialog"

// TODO: Import from @/shared/ui
function Dialog({ open, onOpenChange, children }: any) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-card rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
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

function RadioGroup({ label, value, onChange, options }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="space-y-2">
        {options.map((option: any) => (
          <label key={option.value} className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-muted">
            <input
              type="radio"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="mt-0.5"
            />
            <div>
              <div className="text-sm font-medium">{option.label}</div>
              <div className="text-xs text-muted-foreground">{option.description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}

function Alert({ children, variant = "default" }: any) {
  const variantClass = variant === "destructive" ? "bg-destructive/10 text-destructive border-destructive" : "bg-muted"
  return <div className={`p-3 rounded-lg border text-sm ${variantClass}`}>{children}</div>
}

function Card({ children, className = "" }: any) {
  return <div className={`bg-muted/30 border border-border rounded-lg p-4 ${className}`}>{children}</div>
}

type PayeeSetupMode = "same" | "existing" | "new"

export function SupplierSiteDialog({
  open,
  onOpenChange,
  partyId,
  party,
  supplierSite,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  partyId: string
  party: PartyDto
  supplierSite?: SupplierSiteDto
  onSuccess: () => void
}) {
  const isEdit = !!supplierSite

  // Supplier Site fields
  const [supplierSubCode, setSupplierSubCode] = useState("")
  const [supplierName, setSupplierName] = useState("")
  const [supplierNameKana, setSupplierNameKana] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [prefecture, setPrefecture] = useState("")
  const [city, setCity] = useState("")
  const [addressLine1, setAddressLine1] = useState("")
  const [addressLine2, setAddressLine2] = useState("")
  const [phone, setPhone] = useState("")
  const [fax, setFax] = useState("")
  const [email, setEmail] = useState("")
  const [contactName, setContactName] = useState("")
  const [isActive, setIsActive] = useState(true)

  // Payee setup (only for create)
  const [payeeSetupMode, setPayeeSetupMode] = useState<PayeeSetupMode>("same")
  const [selectedPayee, setSelectedPayee] = useState<PayeeDto | null>(null)
  const [payeeSelectionDialogOpen, setPayeeSelectionDialogOpen] = useState(false)

  // New payee fields
  const [payeeSubCode, setPayeeSubCode] = useState("")
  const [payeeName, setPayeeName] = useState("")
  const [payeeNameKana, setPayeeNameKana] = useState("")
  const [payeePostalCode, setPayeePostalCode] = useState("")
  const [payeePrefecture, setPayeePrefecture] = useState("")
  const [payeeCity, setPayeeCity] = useState("")
  const [payeeAddressLine1, setPayeeAddressLine1] = useState("")
  const [payeeAddressLine2, setPayeeAddressLine2] = useState("")
  const [payeePhone, setPayeePhone] = useState("")
  const [payeeFax, setPayeeFax] = useState("")
  const [payeeEmail, setPayeeEmail] = useState("")
  const [payeeContactName, setPayeeContactName] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [currencyCode, setCurrencyCode] = useState("JPY")
  const [paymentTermsText, setPaymentTermsText] = useState("")

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (supplierSite) {
      // Edit mode
      setSupplierSubCode(supplierSite.supplierSubCode)
      setSupplierName(supplierSite.supplierName)
      setSupplierNameKana(supplierSite.supplierNameKana || "")
      setPostalCode(supplierSite.postalCode || "")
      setPrefecture(supplierSite.prefecture || "")
      setCity(supplierSite.city || "")
      setAddressLine1(supplierSite.addressLine1 || "")
      setAddressLine2(supplierSite.addressLine2 || "")
      setPhone(supplierSite.phone || "")
      setFax(supplierSite.fax || "")
      setEmail(supplierSite.email || "")
      setContactName(supplierSite.contactName || "")
      setIsActive(supplierSite.isActive)
    } else {
      // Create mode - reset all fields
      setSupplierSubCode("")
      setSupplierName("")
      setSupplierNameKana("")
      setPostalCode("")
      setPrefecture("")
      setCity("")
      setAddressLine1("")
      setAddressLine2("")
      setPhone("")
      setFax("")
      setEmail("")
      setContactName("")
      setIsActive(true)
      setPayeeSetupMode("same")
      setSelectedPayee(null)
      setPayeeSubCode("")
      setPayeeName("")
      setPayeeNameKana("")
      setPayeePostalCode("")
      setPayeePrefecture("")
      setPayeeCity("")
      setPayeeAddressLine1("")
      setPayeeAddressLine2("")
      setPayeePhone("")
      setPayeeFax("")
      setPayeeEmail("")
      setPayeeContactName("")
      setPaymentMethod("")
      setCurrencyCode("JPY")
      setPaymentTermsText("")
    }
    setErrors({})
    setApiError(null)
  }, [supplierSite, open])

  const handleSupplierSubCodeChange = (value: string) => {
    const normalized = normalizeCode(value)
    setSupplierSubCode(normalized)
    if (errors.supplierSubCode) {
      setErrors({ ...errors, supplierSubCode: "" })
    }
  }

  const handlePayeeSubCodeChange = (value: string) => {
    const normalized = normalizeCode(value)
    setPayeeSubCode(normalized)
    if (errors.payeeSubCode) {
      setErrors({ ...errors, payeeSubCode: "" })
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!supplierSubCode) {
      newErrors.supplierSubCode = "仕入先コード（枝番）は必須です"
    } else if (!validateCodeLength(supplierSubCode)) {
      newErrors.supplierSubCode = "仕入先コード（枝番）は10桁で入力してください"
    }

    if (!supplierName.trim()) {
      newErrors.supplierName = "仕入先名は必須です"
    }

    // Validate payee setup for create mode
    if (!isEdit) {
      if (payeeSetupMode === "new") {
        if (!payeeSubCode) {
          newErrors.payeeSubCode = "支払先コード（枝番）は必須です"
        } else if (!validateCodeLength(payeeSubCode)) {
          newErrors.payeeSubCode = "支払先コード（枝番）は10桁で入力してください"
        }

        if (!payeeName.trim()) {
          newErrors.payeeName = "支払先名は必須です"
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    setSaving(true)
    setApiError(null)

    try {
      if (isEdit && supplierSite) {
        const request: UpdateSupplierSiteRequest = {
          supplierName: supplierName.trim(),
          supplierNameKana: supplierNameKana.trim() || undefined,
          payeeId: selectedPayee ? selectedPayee.id : undefined, // Allow changing payee
          postalCode: postalCode.trim() || undefined,
          prefecture: prefecture.trim() || undefined,
          city: city.trim() || undefined,
          addressLine1: addressLine1.trim() || undefined,
          addressLine2: addressLine2.trim() || undefined,
          phone: phone.trim() || undefined,
          fax: fax.trim() || undefined,
          email: email.trim() || undefined,
          contactName: contactName.trim() || undefined,
          isActive,
          version: supplierSite.version,
        }
        await bffClient.updateSupplierSite(supplierSite.id, request)
      } else {
        const request: CreateSupplierSiteRequest = {
          partyId,
          supplierSubCode,
          supplierName: supplierName.trim(),
          supplierNameKana: supplierNameKana.trim() || undefined,
          postalCode: postalCode.trim() || undefined,
          prefecture: prefecture.trim() || undefined,
          city: city.trim() || undefined,
          addressLine1: addressLine1.trim() || undefined,
          addressLine2: addressLine2.trim() || undefined,
          phone: phone.trim() || undefined,
          fax: fax.trim() || undefined,
          email: email.trim() || undefined,
          contactName: contactName.trim() || undefined,
        }

        // Handle payee setup
        if (payeeSetupMode === "existing" && selectedPayee) {
          request.payeeId = selectedPayee.id
        } else if (payeeSetupMode === "new") {
          request.payeeSubCode = payeeSubCode
          request.payeeName = payeeName.trim()
          request.payeeNameKana = payeeNameKana.trim() || undefined
          request.postalCode = payeePostalCode.trim() || postalCode.trim() || undefined
          request.prefecture = payeePrefecture.trim() || prefecture.trim() || undefined
          request.city = payeeCity.trim() || city.trim() || undefined
          request.addressLine1 = payeeAddressLine1.trim() || addressLine1.trim() || undefined
          request.addressLine2 = payeeAddressLine2.trim() || addressLine2.trim() || undefined
          request.phone = payeePhone.trim() || phone.trim() || undefined
          request.fax = payeeFax.trim() || fax.trim() || undefined
          request.email = payeeEmail.trim() || email.trim() || undefined
          request.contactName = payeeContactName.trim() || contactName.trim() || undefined
          request.paymentMethod = paymentMethod.trim() || undefined
          request.currencyCode = currencyCode.trim() || undefined
          request.paymentTermsText = paymentTermsText.trim() || undefined
        }
        // If 'same', payeeId is undefined and backend auto-generates

        await bffClient.createSupplierSite(request)
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "仕入先拠点編集" : "仕入先拠点新規登録"}</DialogTitle>
        </DialogHeader>

        <DialogContent>
          {apiError && <Alert variant="destructive">{apiError}</Alert>}

          <div className="space-y-6 mt-4">
            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-bold mb-3">基本情報</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="仕入先コード（枝番）"
                  value={supplierSubCode}
                  onChange={handleSupplierSubCodeChange}
                  placeholder="10桁の枝番を入力"
                  error={errors.supplierSubCode}
                  maxLength={10}
                  required
                  disabled={isEdit}
                />
                <div className="text-sm text-muted-foreground flex items-end pb-2">
                  完全コード: {party.partyCode}-{supplierSubCode || "??????????"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <Input
                  label="仕入先名"
                  value={supplierName}
                  onChange={setSupplierName}
                  placeholder="例: 株式会社サンプル商事 東京本社"
                  error={errors.supplierName}
                  required
                />
                <Input
                  label="仕入先名カナ"
                  value={supplierNameKana}
                  onChange={setSupplierNameKana}
                  placeholder="例: カブシキガイシャサンプルショウジ トウキョウホンシャ"
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

            {/* Payee Info (Edit mode - allow changing) */}
            {isEdit && supplierSite && (
              <div>
                <h3 className="text-sm font-bold mb-3">支払先設定</h3>
                <Card>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">現在の支払先コード</div>
                        <div className="font-mono">{supplierSite.payeeCode}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">現在の支払先名</div>
                        <div>{supplierSite.payeeName}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="text-sm">
                        {selectedPayee ? (
                          <>
                            <div className="text-xs text-muted-foreground mb-1">変更先</div>
                            <div className="font-medium">{selectedPayee.payeeName}</div>
                            <div className="text-muted-foreground font-mono text-xs">{selectedPayee.payeeCode}</div>
                          </>
                        ) : (
                          <div className="text-muted-foreground text-sm">支払先を変更する場合は選択してください</div>
                        )}
                      </div>
                      <Button variant="outline" onClick={() => setPayeeSelectionDialogOpen(true)}>
                        {selectedPayee ? "変更" : "支払先を変更"}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Payee Setup (Create only) */}
            {!isEdit && (
              <div>
                <RadioGroup
                  label="支払先設定"
                  value={payeeSetupMode}
                  onChange={setPayeeSetupMode}
                  options={[
                    {
                      value: "same",
                      label: "同一（推奨）",
                      description: "仕入先と同じ住所・名称で支払先を自動生成",
                    },
                    {
                      value: "existing",
                      label: "既存の支払先を選択",
                      description: "この取引先に登録済みの支払先から選択",
                    },
                    {
                      value: "new",
                      label: "新規の支払先を同時登録",
                      description: "支払先情報を入力して新規作成",
                    },
                  ]}
                />

                {/* Existing Payee Selection */}
                {payeeSetupMode === "existing" && (
                  <Card className="mt-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        {selectedPayee ? (
                          <>
                            <div className="font-medium">{selectedPayee.payeeName}</div>
                            <div className="text-muted-foreground">{selectedPayee.payeeCode}</div>
                          </>
                        ) : (
                          <div className="text-muted-foreground">支払先が選択されていません</div>
                        )}
                      </div>
                      <Button variant="outline" onClick={() => setPayeeSelectionDialogOpen(true)}>
                        {selectedPayee ? "変更" : "支払先を選択"}
                      </Button>
                    </div>
                  </Card>
                )}

                {/* New Payee Form */}
                {payeeSetupMode === "new" && (
                  <Card className="mt-3 space-y-4">
                    <h4 className="text-sm font-bold">新規支払先情報</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="支払先コード（枝番）"
                        value={payeeSubCode}
                        onChange={handlePayeeSubCodeChange}
                        placeholder="10桁の枝番を入力"
                        error={errors.payeeSubCode}
                        maxLength={10}
                        required
                      />
                      <div className="text-sm text-muted-foreground flex items-end pb-2">
                        完全コード: {party.partyCode}-{payeeSubCode || "??????????"}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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

                    <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
                      ※ 住所・連絡先は仕入先と同じ値が使用されます。異なる場合は以下に入力してください。
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="郵便番号"
                        value={payeePostalCode}
                        onChange={setPayeePostalCode}
                        placeholder={postalCode || "例: 100-0001"}
                      />
                      <Input
                        label="都道府県"
                        value={payeePrefecture}
                        onChange={setPayeePrefecture}
                        placeholder={prefecture || "例: 東京都"}
                      />
                      <Input
                        label="市区町村"
                        value={payeeCity}
                        onChange={setPayeeCity}
                        placeholder={city || "例: 千代田区"}
                      />
                      <Input
                        label="住所1"
                        value={payeeAddressLine1}
                        onChange={setPayeeAddressLine1}
                        placeholder={addressLine1 || "例: 丸の内1-1-1"}
                      />
                      <Input
                        label="住所2"
                        value={payeeAddressLine2}
                        onChange={setPayeeAddressLine2}
                        placeholder={addressLine2 || "例: サンプルビル3F"}
                      />
                      <Input
                        label="電話"
                        value={payeePhone}
                        onChange={setPayeePhone}
                        placeholder={phone || "例: 03-1234-5678"}
                      />
                      <Input
                        label="FAX"
                        value={payeeFax}
                        onChange={setPayeeFax}
                        placeholder={fax || "例: 03-1234-5679"}
                      />
                      <Input
                        label="メール"
                        value={payeeEmail}
                        onChange={setPayeeEmail}
                        placeholder={email || "例: tokyo@sample.co.jp"}
                      />
                      <Input
                        label="担当者名"
                        value={payeeContactName}
                        onChange={setPayeeContactName}
                        placeholder={contactName || "例: 山田太郎"}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="支払方法"
                        value={paymentMethod}
                        onChange={setPaymentMethod}
                        placeholder="例: 銀行振込"
                      />
                      <Input label="通貨" value={currencyCode} onChange={setCurrencyCode} placeholder="例: JPY" />
                    </div>

                    <Textarea
                      label="支払条件"
                      value={paymentTermsText}
                      onChange={setPaymentTermsText}
                      placeholder="例: 月末締め翌月末払い"
                    />
                  </Card>
                )}
              </div>
            )}
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

      {/* Payee Selection Dialog */}
      <PayeeSelectionDialog
        open={payeeSelectionDialogOpen}
        onOpenChange={setPayeeSelectionDialogOpen}
        partyId={partyId}
        onSelect={(payee) => {
          setSelectedPayee(payee)
          setPayeeSelectionDialogOpen(false)
        }}
      />
    </>
  )
}
