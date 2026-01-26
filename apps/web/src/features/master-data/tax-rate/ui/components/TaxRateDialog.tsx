"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import type { TaxRateDto, CreateTaxRateRequest, UpdateTaxRateRequest } from "../types/bff-contracts"
import { bffClient } from "../api/client"
import { getErrorMessage } from "../utils/error-messages"
import { toast } from "sonner"

// Shared UI Components
import { Button } from "@/shared/ui/components/button"
import { Input } from "@/shared/ui/components/input"
import { Label } from "@/shared/ui/components/label"
import { Switch } from "@/shared/ui/components/switch"
import { Alert, AlertDescription } from "@/shared/ui/components/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/components/dialog"

interface TaxRateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taxRate?: TaxRateDto
  onSuccess: () => void
}

interface FormErrors {
  taxRateCode?: string
  ratePercent?: string
  validFrom?: string
  validTo?: string
}

export function TaxRateDialog({ open, onOpenChange, taxRate, onSuccess }: TaxRateDialogProps) {
  const isEdit = !!taxRate

  // Form State
  const [taxRateCode, setTaxRateCode] = useState("")
  const [ratePercent, setRatePercent] = useState("")
  const [validFrom, setValidFrom] = useState("")
  const [validTo, setValidTo] = useState("")
  const [isActive, setIsActive] = useState(true)

  // UI State
  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (taxRate) {
        // Edit mode
        setTaxRateCode(taxRate.taxRateCode)
        setRatePercent(taxRate.ratePercent)
        setValidFrom(taxRate.validFrom)
        setValidTo(taxRate.validTo || "")
        setIsActive(taxRate.isActive)
      } else {
        // Create mode - reset
        setTaxRateCode("")
        setRatePercent("")
        setValidFrom("")
        setValidTo("")
        setIsActive(true)
      }
      setErrors({})
      setApiError(null)
    }
  }, [taxRate, open])

  const handleTaxRateCodeChange = (value: string) => {
    // Normalize: uppercase alphanumeric and underscore only
    const normalized = value.toUpperCase().replace(/[^A-Z0-9_]/g, "")
    setTaxRateCode(normalized)
    if (errors.taxRateCode) {
      setErrors({ ...errors, taxRateCode: undefined })
    }
  }

  const handleRatePercentChange = (value: string) => {
    // Allow only numbers and one decimal point
    const normalized = value.replace(/[^\d.]/g, "")
    // Ensure only one decimal point
    const parts = normalized.split(".")
    const formatted = parts.length > 2
      ? parts[0] + "." + parts.slice(1).join("")
      : normalized
    setRatePercent(formatted)
    if (errors.ratePercent) {
      setErrors({ ...errors, ratePercent: undefined })
    }
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!taxRateCode) {
      newErrors.taxRateCode = "税率コードは必須です"
    } else if (taxRateCode.length < 1 || taxRateCode.length > 20) {
      newErrors.taxRateCode = "税率コードは1〜20文字で入力してください"
    }

    if (!ratePercent) {
      newErrors.ratePercent = "税率は必須です"
    } else {
      const rate = parseFloat(ratePercent)
      if (isNaN(rate) || rate < 0 || rate > 100) {
        newErrors.ratePercent = "税率は0〜100の数値で入力してください"
      }
    }

    if (!validFrom) {
      newErrors.validFrom = "適用開始日は必須です"
    }

    if (validTo && validFrom) {
      const from = new Date(validFrom)
      const to = new Date(validTo)
      if (to < from) {
        newErrors.validTo = "適用終了日は適用開始日以降を指定してください"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const formatRatePercent = (value: string): string => {
    const rate = parseFloat(value)
    if (isNaN(rate)) return value
    return rate.toFixed(2)
  }

  const handleSave = async () => {
    if (!validate()) return

    setSaving(true)
    setApiError(null)

    try {
      if (isEdit && taxRate) {
        const request: UpdateTaxRateRequest = {
          validFrom,
          validTo: validTo || undefined,
          isActive,
          version: taxRate.version,
        }
        await bffClient.updateTaxRate(taxRate.id, request)
        toast.success("税率を更新しました")
      } else {
        const request: CreateTaxRateRequest = {
          taxRateCode,
          ratePercent: formatRatePercent(ratePercent),
          validFrom,
          validTo: validTo || undefined,
          isActive,
        }
        await bffClient.createTaxRate(request)
        toast.success("税率を登録しました")
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

  const handleDeactivate = async () => {
    if (!taxRate) return

    setSaving(true)
    setApiError(null)

    try {
      await bffClient.deactivateTaxRate(taxRate.id, { version: taxRate.version })
      toast.success("税率を無効化しました")
      onSuccess()
      onOpenChange(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "UNKNOWN_ERROR"
      setApiError(getErrorMessage(message))
    } finally {
      setSaving(false)
    }
  }

  const handleActivate = async () => {
    if (!taxRate) return

    setSaving(true)
    setApiError(null)

    try {
      await bffClient.activateTaxRate(taxRate.id, { version: taxRate.version })
      toast.success("税率を有効化しました")
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "税率編集" : "税率新規登録"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "税率の適用期間とステータスを編集できます。税率コードと税率値は変更できません。"
              : "新しい税率を登録します。税率コードと税率値は登録後に変更できません。"
            }
          </DialogDescription>
        </DialogHeader>

        {apiError && (
          <Alert variant="destructive">
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          {/* 税率コード */}
          <div className="space-y-2">
            <Label htmlFor="taxRateCode">
              税率コード <span className="text-destructive">*</span>
            </Label>
            <Input
              id="taxRateCode"
              value={taxRateCode}
              onChange={(e) => handleTaxRateCodeChange(e.target.value)}
              placeholder="例: STANDARD_10"
              maxLength={20}
              disabled={isEdit}
              className={errors.taxRateCode ? "border-destructive" : ""}
            />
            {errors.taxRateCode && (
              <p className="text-sm text-destructive">{errors.taxRateCode}</p>
            )}
            <p className="text-xs text-muted-foreground">
              半角英数字とアンダースコア（自動で大文字変換）
            </p>
          </div>

          {/* 税率 */}
          <div className="space-y-2">
            <Label htmlFor="ratePercent">
              税率（%） <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ratePercent"
              value={ratePercent}
              onChange={(e) => handleRatePercentChange(e.target.value)}
              placeholder="例: 10.00"
              disabled={isEdit}
              className={errors.ratePercent ? "border-destructive" : ""}
            />
            {errors.ratePercent && (
              <p className="text-sm text-destructive">{errors.ratePercent}</p>
            )}
            <p className="text-xs text-muted-foreground">
              0〜100の数値（小数点以下2桁）
            </p>
          </div>

          {/* 適用開始日 */}
          <div className="space-y-2">
            <Label htmlFor="validFrom">
              適用開始日 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="validFrom"
              type="date"
              value={validFrom}
              onChange={(e) => {
                setValidFrom(e.target.value)
                if (errors.validFrom) {
                  setErrors({ ...errors, validFrom: undefined })
                }
              }}
              className={errors.validFrom ? "border-destructive" : ""}
            />
            {errors.validFrom && (
              <p className="text-sm text-destructive">{errors.validFrom}</p>
            )}
          </div>

          {/* 適用終了日 */}
          <div className="space-y-2">
            <Label htmlFor="validTo">適用終了日</Label>
            <Input
              id="validTo"
              type="date"
              value={validTo}
              onChange={(e) => {
                setValidTo(e.target.value)
                if (errors.validTo) {
                  setErrors({ ...errors, validTo: undefined })
                }
              }}
              className={errors.validTo ? "border-destructive" : ""}
            />
            {errors.validTo && (
              <p className="text-sm text-destructive">{errors.validTo}</p>
            )}
            <p className="text-xs text-muted-foreground">
              空欄の場合は無期限
            </p>
          </div>

          {/* 有効フラグ */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive">有効</Label>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {isEdit && taxRate && (
            <div className="flex-1">
              {taxRate.isActive ? (
                <Button
                  variant="outline"
                  onClick={handleDeactivate}
                  disabled={saving}
                  className="text-destructive hover:text-destructive"
                >
                  無効化
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleActivate}
                  disabled={saving}
                >
                  有効化
                </Button>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              キャンセル
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "保存中..." : "保存"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
