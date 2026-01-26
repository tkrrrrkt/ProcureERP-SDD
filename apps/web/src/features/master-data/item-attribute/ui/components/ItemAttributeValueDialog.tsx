"use client"

import { useState, useEffect } from "react"
import { Loader2, AlertTriangle } from "lucide-react"
import type { ItemAttributeValueDto } from "../types/bff-contracts"
import { bffClient } from "../api/client"
import { getErrorMessage } from "../utils/error-messages"

// Shared UI Components
import { Button } from "@/shared/ui/components/button"
import { Input } from "@/shared/ui/components/input"
import { Label } from "@/shared/ui/components/label"
import { Badge } from "@/shared/ui/components/badge"
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/components/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/components/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/components/alert-dialog"

interface ItemAttributeValueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attributeId: string
  attributeCode: string
  value?: ItemAttributeValueDto | null
  mode: "create" | "edit"
  onSaved: () => void
}

export function ItemAttributeValueDialog({
  open,
  onOpenChange,
  attributeId,
  attributeCode,
  value,
  mode,
  onSaved,
}: ItemAttributeValueDialogProps) {
  // Form state
  const [valueCode, setValueCode] = useState("")
  const [valueName, setValueName] = useState("")
  const [sortOrder, setSortOrder] = useState(0)
  const [version, setVersion] = useState(1)
  const [isActive, setIsActive] = useState(true)

  // UI state
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Confirmation dialogs
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false)
  const [deactivateWarning, setDeactivateWarning] = useState<{
    message: string
    usageCount: number
  } | null>(null)

  // Initialize form when value changes
  useEffect(() => {
    if (open) {
      if (value && mode === "edit") {
        setValueCode(value.valueCode)
        setValueName(value.valueName)
        setSortOrder(value.sortOrder)
        setVersion(value.version)
        setIsActive(value.isActive)
      } else {
        setValueCode("")
        setValueName("")
        setSortOrder(0)
        setVersion(1)
        setIsActive(true)
      }
      setError(null)
      setValidationErrors({})
    }
  }, [open, value, mode])

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (mode === "create") {
      if (!valueCode.trim()) {
        errors.valueCode = "値コードは必須です"
      } else if (!/^[A-Z0-9_-]{1,30}$/i.test(valueCode.trim())) {
        errors.valueCode = "英大文字・数字・ハイフン・アンダースコアで30文字以内"
      }
    }

    if (!valueName.trim()) {
      errors.valueName = "値名は必須です"
    } else if (valueName.trim().length > 100) {
      errors.valueName = "値名は100文字以内で入力してください"
    }

    if (sortOrder < 0) {
      errors.sortOrder = "表示順は0以上の数値を入力してください"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    setSaving(true)
    setError(null)

    try {
      if (mode === "create") {
        await bffClient.createItemAttributeValue(attributeId, {
          valueCode: valueCode.trim().toUpperCase(),
          valueName: valueName.trim(),
          sortOrder,
        })
      } else if (value) {
        await bffClient.updateItemAttributeValue(attributeId, value.id, {
          valueName: valueName.trim(),
          sortOrder,
          version,
        })
      }
      onSaved()
      onOpenChange(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "UNKNOWN_ERROR"
      setError(getErrorMessage(message))
    } finally {
      setSaving(false)
    }
  }

  const handleActivate = async () => {
    if (!value) return

    setSaving(true)
    setError(null)

    try {
      await bffClient.activateItemAttributeValue(attributeId, value.id, { version })
      onSaved()
      onOpenChange(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "UNKNOWN_ERROR"
      setError(getErrorMessage(message))
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (force = false) => {
    if (!value) return

    setSaving(true)
    setError(null)
    setDeactivateWarning(null)

    try {
      const response = await bffClient.deactivateItemAttributeValue(attributeId, value.id, {
        version,
        force,
      })

      if (response.warning && !force) {
        setDeactivateWarning({
          message: response.warning.message,
          usageCount: response.warning.usageCount,
        })
        setShowDeactivateConfirm(true)
        return
      }

      onSaved()
      onOpenChange(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "UNKNOWN_ERROR"
      setError(getErrorMessage(message))
    } finally {
      setSaving(false)
    }
  }

  const handleForceDeactivate = async () => {
    setShowDeactivateConfirm(false)
    await handleDeactivate(true)
  }

  const title = mode === "create"
    ? `属性値の新規登録 - ${attributeCode}`
    : `属性値の詳細 - ${value?.valueCode}`

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "新しい属性値を登録します。"
                : "属性値の情報を編集します。"
              }
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valueCode">
                  値コード <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="valueCode"
                  value={valueCode}
                  onChange={(e) => setValueCode(e.target.value.toUpperCase())}
                  placeholder="例: RED, BLUE"
                  disabled={mode === "edit"}
                  className={mode === "edit" ? "bg-muted" : "font-mono"}
                />
                {validationErrors.valueCode && (
                  <p className="text-sm text-destructive">{validationErrors.valueCode}</p>
                )}
                {mode === "create" && (
                  <p className="text-xs text-muted-foreground">
                    英大文字・数字・ハイフン・アンダースコア、30文字以内
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="valueSortOrder">表示順</Label>
                <Input
                  id="valueSortOrder"
                  type="number"
                  min={0}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                />
                {validationErrors.sortOrder && (
                  <p className="text-sm text-destructive">{validationErrors.sortOrder}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valueName">
                値名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="valueName"
                value={valueName}
                onChange={(e) => setValueName(e.target.value)}
                placeholder="例: 赤, 青"
              />
              {validationErrors.valueName && (
                <p className="text-sm text-destructive">{validationErrors.valueName}</p>
              )}
            </div>

            {mode === "edit" && (
              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <Label>ステータス</Label>
                  <div>
                    <Badge variant={isActive ? "default" : "outline"}>
                      {isActive ? "有効" : "無効"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {mode === "edit" && (
              <div className="flex gap-2 mr-auto">
                {isActive ? (
                  <Button
                    variant="outline"
                    onClick={() => handleDeactivate(false)}
                    disabled={saving}
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
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              キャンセル
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {mode === "create" ? "登録" : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={showDeactivateConfirm} onOpenChange={setShowDeactivateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                無効化の確認
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deactivateWarning?.message}
              <br /><br />
              この属性値を無効化すると、関連するSKU仕様に影響する可能性があります。
              本当に無効化しますか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleForceDeactivate}>
              無効化する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
