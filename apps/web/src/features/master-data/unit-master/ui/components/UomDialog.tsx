"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import type { UomDto, UomGroupDto, CreateUomRequest, UpdateUomRequest } from "../types/bff-contracts"
import { bffClient } from "../api/client"
import { getErrorMessage } from "../utils/error-messages"
import { toast } from "sonner"

// Shared UI Components
import { Button } from "@/shared/ui/components/button"
import { Input } from "@/shared/ui/components/input"
import { Label } from "@/shared/ui/components/label"
import { Alert, AlertDescription } from "@/shared/ui/components/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/components/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/components/select"

interface UomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  uom?: UomDto
  defaultGroupId?: string
  onSuccess: () => void
}

interface FormErrors {
  uomCode?: string
  uomName?: string
  uomGroupId?: string
  conversionFactor?: string
}

const CODE_FORMAT_REGEX = /^[A-Z0-9_-]{1,10}$/

function normalizeCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 10)
}

function validateCode(code: string): boolean {
  return CODE_FORMAT_REGEX.test(code)
}

export function UomDialog({ open, onOpenChange, uom, defaultGroupId, onSuccess }: UomDialogProps) {
  const isEdit = !!uom

  // Form Fields
  const [uomCode, setUomCode] = useState("")
  const [uomName, setUomName] = useState("")
  const [uomGroupId, setUomGroupId] = useState("")
  const [conversionFactor, setConversionFactor] = useState("1")

  // Available Groups
  const [groups, setGroups] = useState<UomGroupDto[]>([])
  const [loadingGroups, setLoadingGroups] = useState(false)

  // UI State
  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Load available groups
  useEffect(() => {
    if (open) {
      setLoadingGroups(true)
      bffClient
        .listUomGroups({ page: 1, pageSize: 200, isActive: true })
        .then((response) => {
          setGroups(response.items)
        })
        .catch(() => {
          setGroups([])
        })
        .finally(() => {
          setLoadingGroups(false)
        })
    }
  }, [open])

  useEffect(() => {
    if (open) {
      if (uom) {
        // Edit mode
        setUomCode(uom.uomCode)
        setUomName(uom.uomName)
        setUomGroupId(uom.uomGroupId)
        setConversionFactor(String(uom.conversionFactor))
      } else {
        // Create mode - reset
        setUomCode("")
        setUomName("")
        setUomGroupId(defaultGroupId || "")
        setConversionFactor("1")
      }
      setErrors({})
      setApiError(null)
    }
  }, [uom, defaultGroupId, open])

  const handleCodeChange = (value: string) => {
    const normalized = normalizeCode(value)
    setUomCode(normalized)
    if (errors.uomCode) {
      setErrors({ ...errors, uomCode: undefined })
    }
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!uomCode) {
      newErrors.uomCode = "単位コードは必須です"
    } else if (!validateCode(uomCode)) {
      newErrors.uomCode = "単位コードは英大文字・数字・ハイフン・アンダースコア(10桁以内)で入力してください"
    }

    if (!uomName.trim()) {
      newErrors.uomName = "単位名は必須です"
    }

    if (!isEdit && !uomGroupId) {
      newErrors.uomGroupId = "単位グループは必須です"
    }

    const factor = parseFloat(conversionFactor)
    if (isNaN(factor) || factor <= 0) {
      newErrors.conversionFactor = "換算率は0より大きい数値を入力してください"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    setSaving(true)
    setApiError(null)

    try {
      if (isEdit && uom) {
        const request: UpdateUomRequest = {
          uomName: uomName.trim(),
          conversionFactor: parseFloat(conversionFactor),
          version: uom.version,
        }
        await bffClient.updateUom(uom.id, request)
        toast.success("単位を更新しました")
      } else {
        const request: CreateUomRequest = {
          uomCode,
          uomName: uomName.trim(),
          uomGroupId,
          conversionFactor: parseFloat(conversionFactor),
        }
        await bffClient.createUom(request)
        toast.success("単位を登録しました")
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

  const handleActivate = async () => {
    if (!uom) return

    setSaving(true)
    setApiError(null)

    try {
      await bffClient.activateUom(uom.id, { version: uom.version })
      toast.success("単位を有効化しました")
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
    if (!uom) return

    setSaving(true)
    setApiError(null)

    try {
      await bffClient.deactivateUom(uom.id, { version: uom.version })
      toast.success("単位を無効化しました")
      onSuccess()
      onOpenChange(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "UNKNOWN_ERROR"
      setApiError(getErrorMessage(message))
    } finally {
      setSaving(false)
    }
  }

  const selectedGroup = groups.find((g) => g.id === uomGroupId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "単位編集" : "単位新規登録"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "単位の情報を編集してください。"
              : "新しい単位を登録します。換算率は基準単位に対する比率を入力してください。"}
          </DialogDescription>
        </DialogHeader>

        {apiError && (
          <Alert variant="destructive">
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          {/* Unit Group */}
          <div className="space-y-2">
            <Label htmlFor="uomGroupId">
              単位グループ <span className="text-destructive">*</span>
            </Label>
            {isEdit ? (
              <div className="px-3 py-2 bg-muted rounded-md text-sm">
                {uom?.groupCode} ({uom?.groupName})
              </div>
            ) : (
              <>
                <Select
                  value={uomGroupId}
                  onValueChange={setUomGroupId}
                  disabled={loadingGroups}
                >
                  <SelectTrigger className={errors.uomGroupId ? "border-destructive" : ""}>
                    <SelectValue placeholder={loadingGroups ? "読み込み中..." : "グループを選択"} />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.groupCode} ({group.groupName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.uomGroupId && (
                  <p className="text-sm text-destructive">{errors.uomGroupId}</p>
                )}
              </>
            )}
            {selectedGroup?.baseUom && (
              <p className="text-xs text-muted-foreground">
                基準単位: {selectedGroup.baseUom.uomCode} ({selectedGroup.baseUom.uomName})
              </p>
            )}
          </div>

          {/* Unit Code */}
          <div className="space-y-2">
            <Label htmlFor="uomCode">
              単位コード <span className="text-destructive">*</span>
            </Label>
            <Input
              id="uomCode"
              value={uomCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="例: CM, KG, PC"
              maxLength={10}
              disabled={isEdit}
              className={errors.uomCode ? "border-destructive" : ""}
            />
            {errors.uomCode && (
              <p className="text-sm text-destructive">{errors.uomCode}</p>
            )}
            <p className="text-xs text-muted-foreground">英大文字・数字・ハイフン・アンダースコア（10桁以内）</p>
          </div>

          {/* Unit Name */}
          <div className="space-y-2">
            <Label htmlFor="uomName">
              単位名 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="uomName"
              value={uomName}
              onChange={(e) => setUomName(e.target.value)}
              placeholder="例: センチメートル、キログラム、個"
              className={errors.uomName ? "border-destructive" : ""}
            />
            {errors.uomName && (
              <p className="text-sm text-destructive">{errors.uomName}</p>
            )}
          </div>

          {/* Conversion Factor */}
          <div className="space-y-2">
            <Label htmlFor="conversionFactor">
              換算率 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="conversionFactor"
              value={conversionFactor}
              onChange={(e) => setConversionFactor(e.target.value)}
              placeholder="1"
              type="number"
              step="any"
              min="0"
              disabled={isEdit && uom?.isBaseUom}
              className={errors.conversionFactor ? "border-destructive" : ""}
            />
            {errors.conversionFactor && (
              <p className="text-sm text-destructive">{errors.conversionFactor}</p>
            )}
            <p className="text-xs text-muted-foreground">
              基準単位に対する比率（例: 1cm = 0.01m なら 0.01）
            </p>
          </div>

          {/* Base Uom Notice (Edit only) */}
          {isEdit && uom?.isBaseUom && (
            <Alert>
              <AlertDescription>
                この単位は基準単位です。換算率は常に1で固定されており、無効化することはできません。
              </AlertDescription>
            </Alert>
          )}

          {/* Status (Edit only) */}
          {isEdit && !uom?.isBaseUom && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <Label>ステータス</Label>
                <p className="text-sm text-muted-foreground">
                  {uom?.isActive ? "有効" : "無効"}
                </p>
              </div>
              {uom?.isActive ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeactivate}
                  disabled={saving}
                >
                  無効化
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleActivate}
                  disabled={saving}
                >
                  有効化
                </Button>
              )}
            </div>
          )}
        </div>

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
