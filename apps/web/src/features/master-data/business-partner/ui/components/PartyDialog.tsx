"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import type { PartyDto, CreatePartyRequest, UpdatePartyRequest } from "../types/bff-contracts"
import { bffClient } from "../api/client"
import { getErrorMessage } from "../utils/error-messages"
import { normalizeCode, validateCodeLength } from "../utils/code-normalizer"
import { toast } from "sonner"

// Shared UI Components
import { Button } from "@/shared/ui/components/button"
import { Input } from "@/shared/ui/components/input"
import { Label } from "@/shared/ui/components/label"
import { Textarea } from "@/shared/ui/components/textarea"
import { Switch } from "@/shared/ui/components/switch"
import { Alert, AlertDescription } from "@/shared/ui/components/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/components/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/components/dialog"

interface PartyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  party?: PartyDto
  onSuccess: () => void
}

interface FormErrors {
  partyCode?: string
  partyName?: string
}

export function PartyDialog({ open, onOpenChange, party, onSuccess }: PartyDialogProps) {
  const isEdit = !!party

  // Basic Info
  const [partyCode, setPartyCode] = useState("")
  const [partyName, setPartyName] = useState("")
  const [partyNameKana, setPartyNameKana] = useState("")
  const [partyShortName, setPartyShortName] = useState("")

  // Contact Info
  const [countryCode, setCountryCode] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [prefecture, setPrefecture] = useState("")
  const [city, setCity] = useState("")
  const [addressLine1, setAddressLine1] = useState("")
  const [addressLine2, setAddressLine2] = useState("")
  const [phone, setPhone] = useState("")
  const [fax, setFax] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")

  // Legal Info
  const [corporateNumber, setCorporateNumber] = useState("")
  const [invoiceRegistrationNo, setInvoiceRegistrationNo] = useState("")

  // Other
  const [notes, setNotes] = useState("")
  const [isActive, setIsActive] = useState(true)

  // UI State
  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (party) {
        // Edit mode
        setPartyCode(party.partyCode)
        setPartyName(party.partyName)
        setPartyNameKana(party.partyNameKana || "")
        setPartyShortName(party.partyShortName || "")
        setCountryCode(party.countryCode || "")
        setPostalCode(party.postalCode || "")
        setPrefecture(party.prefecture || "")
        setCity(party.city || "")
        setAddressLine1(party.addressLine1 || "")
        setAddressLine2(party.addressLine2 || "")
        setPhone(party.phone || "")
        setFax(party.fax || "")
        setWebsiteUrl(party.websiteUrl || "")
        setCorporateNumber(party.corporateNumber || "")
        setInvoiceRegistrationNo(party.invoiceRegistrationNo || "")
        setNotes(party.notes || "")
        setIsActive(party.isActive)
      } else {
        // Create mode - reset
        setPartyCode("")
        setPartyName("")
        setPartyNameKana("")
        setPartyShortName("")
        setCountryCode("JP")
        setPostalCode("")
        setPrefecture("")
        setCity("")
        setAddressLine1("")
        setAddressLine2("")
        setPhone("")
        setFax("")
        setWebsiteUrl("")
        setCorporateNumber("")
        setInvoiceRegistrationNo("")
        setNotes("")
        setIsActive(true)
      }
      setErrors({})
      setApiError(null)
    }
  }, [party, open])

  const handlePartyCodeChange = (value: string) => {
    const normalized = normalizeCode(value)
    setPartyCode(normalized)
    if (errors.partyCode) {
      setErrors({ ...errors, partyCode: undefined })
    }
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

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
          partyShortName: partyShortName.trim() || undefined,
          countryCode: countryCode.trim() || undefined,
          postalCode: postalCode.trim() || undefined,
          prefecture: prefecture.trim() || undefined,
          city: city.trim() || undefined,
          addressLine1: addressLine1.trim() || undefined,
          addressLine2: addressLine2.trim() || undefined,
          phone: phone.trim() || undefined,
          fax: fax.trim() || undefined,
          websiteUrl: websiteUrl.trim() || undefined,
          corporateNumber: corporateNumber.trim() || undefined,
          invoiceRegistrationNo: invoiceRegistrationNo.trim() || undefined,
          notes: notes.trim() || undefined,
          isActive,
          version: party.version,
        }
        await bffClient.updateParty(party.id, request)
        toast.success("取引先を更新しました")
      } else {
        const request: CreatePartyRequest = {
          partyCode,
          partyName: partyName.trim(),
          partyNameKana: partyNameKana.trim() || undefined,
          partyShortName: partyShortName.trim() || undefined,
          countryCode: countryCode.trim() || undefined,
          postalCode: postalCode.trim() || undefined,
          prefecture: prefecture.trim() || undefined,
          city: city.trim() || undefined,
          addressLine1: addressLine1.trim() || undefined,
          addressLine2: addressLine2.trim() || undefined,
          phone: phone.trim() || undefined,
          fax: fax.trim() || undefined,
          websiteUrl: websiteUrl.trim() || undefined,
          corporateNumber: corporateNumber.trim() || undefined,
          invoiceRegistrationNo: invoiceRegistrationNo.trim() || undefined,
          notes: notes.trim() || undefined,
          isActive,
        }
        await bffClient.createParty(request)
        toast.success("取引先を登録しました")
      }
      onSuccess()
      onOpenChange(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "UNKNOWN_ERROR"
      setApiError(getErrorMessage(message))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "取引先編集" : "取引先新規登録"}</DialogTitle>
          <DialogDescription>
            取引先の基本情報を入力してください。仕入先・得意先フラグは拠点登録時に自動で更新されます。
          </DialogDescription>
        </DialogHeader>

        {apiError && (
          <Alert variant="destructive">
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">基本情報</TabsTrigger>
            <TabsTrigger value="address">住所・連絡先</TabsTrigger>
            <TabsTrigger value="legal">法人情報</TabsTrigger>
          </TabsList>

          {/* 固定サイズのタブコンテンツ領域 */}
          <div className="h-[460px] mt-4">
            {/* 基本情報タブ */}
            <TabsContent value="basic" className="mt-0 h-full overflow-y-auto data-[state=active]:block">
              <div className="grid gap-4 pr-2">
                <div className="space-y-2">
                  <Label htmlFor="partyCode">
                    取引先コード <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="partyCode"
                    value={partyCode}
                    onChange={(e) => handlePartyCodeChange(e.target.value)}
                    placeholder="10桁のコードを入力"
                    maxLength={10}
                    disabled={isEdit}
                    className={errors.partyCode ? "border-destructive" : ""}
                  />
                  {errors.partyCode && (
                    <p className="text-sm text-destructive">{errors.partyCode}</p>
                  )}
                  <p className="text-xs text-muted-foreground">半角英数字10桁（自動で大文字変換）</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partyName">
                    取引先名（正式名称） <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="partyName"
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    placeholder="例: 株式会社サンプル商事"
                    className={errors.partyName ? "border-destructive" : ""}
                  />
                  {errors.partyName && (
                    <p className="text-sm text-destructive">{errors.partyName}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="partyNameKana">取引先名カナ</Label>
                    <Input
                      id="partyNameKana"
                      value={partyNameKana}
                      onChange={(e) => setPartyNameKana(e.target.value)}
                      placeholder="例: カブシキガイシャサンプルショウジ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partyShortName">略称</Label>
                    <Input
                      id="partyShortName"
                      value={partyShortName}
                      onChange={(e) => setPartyShortName(e.target.value)}
                      placeholder="例: サンプル商事"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">備考</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="メモや補足情報"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="isActive">有効</Label>
                </div>
              </div>
            </TabsContent>

            {/* 住所・連絡先タブ */}
            <TabsContent value="address" className="mt-0 h-full overflow-y-auto data-[state=active]:block">
              <div className="grid gap-4 pr-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="countryCode">国コード</Label>
                    <Input
                      id="countryCode"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                      placeholder="JP"
                      maxLength={2}
                    />
                    <p className="text-xs text-muted-foreground">ISO 3166-1 alpha-2</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">郵便番号</Label>
                    <Input
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="123-4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prefecture">都道府県</Label>
                    <Input
                      id="prefecture"
                      value={prefecture}
                      onChange={(e) => setPrefecture(e.target.value)}
                      placeholder="東京都"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">市区町村</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="千代田区"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine1">住所1</Label>
                  <Input
                    id="addressLine1"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="丸の内1-1-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine2">住所2（ビル名等）</Label>
                  <Input
                    id="addressLine2"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="サンプルビル10F"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">代表電話</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="03-1234-5678"
                      type="tel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fax">FAX</Label>
                    <Input
                      id="fax"
                      value={fax}
                      onChange={(e) => setFax(e.target.value)}
                      placeholder="03-1234-5679"
                      type="tel"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Webサイト</Label>
                  <Input
                    id="websiteUrl"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                    type="url"
                  />
                </div>
              </div>
            </TabsContent>

            {/* 法人情報タブ */}
            <TabsContent value="legal" className="mt-0 h-full overflow-y-auto data-[state=active]:block">
              <div className="grid gap-4 pr-2">
                <div className="space-y-2">
                  <Label htmlFor="corporateNumber">法人番号</Label>
                  <Input
                    id="corporateNumber"
                    value={corporateNumber}
                    onChange={(e) => setCorporateNumber(e.target.value)}
                    placeholder="1234567890123"
                    maxLength={13}
                  />
                  <p className="text-xs text-muted-foreground">13桁の法人番号（国税庁）</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoiceRegistrationNo">インボイス登録番号</Label>
                  <Input
                    id="invoiceRegistrationNo"
                    value={invoiceRegistrationNo}
                    onChange={(e) => setInvoiceRegistrationNo(e.target.value)}
                    placeholder="T1234567890123"
                    maxLength={14}
                  />
                  <p className="text-xs text-muted-foreground">適格請求書発行事業者登録番号（T+13桁）</p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
