"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import type { UomGroupDto, CreateUomGroupRequest, UpdateUomGroupRequest } from "../types/bff-contracts"
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

interface UomGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group?: UomGroupDto
  onSuccess: () => void
}

interface FormErrors {
  groupCode?: string
  groupName?: string
  baseUomCode?: string
  baseUomName?: string
}

const CODE_FORMAT_REGEX = /^[A-Z0-9_-]{1,10}$/

function normalizeCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 10)
}

function validateCode(code: string): boolean {
  return CODE_FORMAT_REGEX.test(code)
}

export function UomGroupDialog({ open, onOpenChange, group, onSuccess }: UomGroupDialogProps) {
  const isEdit = !!group

  // Form Fields
  const [groupCode, setGroupCode] = useState("")
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [baseUomCode, setBaseUomCode] = useState("")
  const [baseUomName, setBaseUomName] = useState("")
  const [isActive, setIsActive] = useState(true)

  // UI State
  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (group) {
        // Edit mode
        setGroupCode(group.groupCode)
        setGroupName(group.groupName)
        setGroupDescription(group.groupDescription || "")
        setBaseUomCode(group.baseUom?.uomCode || "")
        setBaseUomName(group.baseUom?.uomName || "")
        setIsActive(group.isActive)
      } else {
        // Create mode - reset
        setGroupCode("")
        setGroupName("")
        setGroupDescription("")
        setBaseUomCode("")
        setBaseUomName("")
        setIsActive(true)
      }
      setErrors({})
      setApiError(null)
    }
  }, [group, open])

  const handleCodeChange = (value: string, setter: (v: string) => void, errorKey: keyof FormErrors) => {
    const normalized = normalizeCode(value)
    setter(normalized)
    if (errors[errorKey]) {
      setErrors({ ...errors, [errorKey]: undefined })
    }
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!groupCode) {
      newErrors.groupCode = "グループコードは必須です"
    } else if (!validateCode(groupCode)) {
      newErrors.groupCode = "グループコードは英大文字・数字・ハイフン・アンダースコア(10桁以内)で入力してください"
    }

    if (!groupName.trim()) {
      newErrors.groupName = "グループ名は必須です"
    }

    if (!isEdit) {
      if (!baseUomCode) {
        newErrors.baseUomCode = "基準単位コードは必須です"
      } else if (!validateCode(baseUomCode)) {
        newErrors.baseUomCode = "基準単位コードは英大文字・数字・ハイフン・アンダースコア(10桁以内)で入力してください"
      }

      if (!baseUomName.trim()) {
        newErrors.baseUomName = "基準単位名は必須です"
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
      if (isEdit && group) {
        const request: UpdateUomGroupRequest = {
          groupName: groupName.trim(),
          groupDescription: groupDescription.trim() || undefined,
          version: group.version,
        }
        await bffClient.updateUomGroup(group.id, request)
        toast.success("単位グループを更新しました")
      } else {
        const request: CreateUomGroupRequest = {
          groupCode,
          groupName: groupName.trim(),
          groupDescription: groupDescription.trim() || undefined,
          baseUomCode,
          baseUomName: baseUomName.trim(),
        }
        await bffClient.createUomGroup(request)
        toast.success("単位グループを登録しました")
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
    if (!group) return

    setSaving(true)
    setApiError(null)

    try {
      await bffClient.activateUomGroup(group.id, { version: group.version })
      toast.success("単位グループを有効化しました")
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
    if (!group) return

    setSaving(true)
    setApiError(null)

    try {
      await bffClient.deactivateUomGroup(group.id, { version: group.version })
      toast.success("単位グループを無効化しました")
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "単位グループ編集" : "単位グループ新規登録"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "単位グループの情報を編集してください。"
              : "単位グループと基準単位を同時に登録します。"}
          </DialogDescription>
        </DialogHeader>

        {apiError && (
          <Alert variant="destructive">
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          {/* Group Code */}
          <div className="space-y-2">
            <Label htmlFor="groupCode">
              グループコード <span className="text-destructive">*</span>
            </Label>
            <Input
              id="groupCode"
              value={groupCode}
              onChange={(e) => handleCodeChange(e.target.value, setGroupCode, "groupCode")}
              placeholder="例: LENGTH, WEIGHT"
              maxLength={10}
              disabled={isEdit}
              className={errors.groupCode ? "border-destructive" : ""}
            />
            {errors.groupCode && (
              <p className="text-sm text-destructive">{errors.groupCode}</p>
            )}
            <p className="text-xs text-muted-foreground">英大文字・数字・ハイフン・アンダースコア（10桁以内）</p>
          </div>

          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="groupName">
              グループ名 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="例: 長さ、重量"
              className={errors.groupName ? "border-destructive" : ""}
            />
            {errors.groupName && (
              <p className="text-sm text-destructive">{errors.groupName}</p>
            )}
          </div>

          {/* Group Description */}
          <div className="space-y-2">
            <Label htmlFor="groupDescription">グループ説明</Label>
            <Input
              id="groupDescription"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="例: 長さを測定する単位のグループ"
            />
          </div>

          {/* Base Uom (Create only) */}
          {!isEdit && (
            <>
              <div className="border-t pt-4 mt-2">
                <h3 className="text-sm font-medium mb-3">基準単位（同時作成）</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseUomCode">
                  基準単位コード <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="baseUomCode"
                  value={baseUomCode}
                  onChange={(e) => handleCodeChange(e.target.value, setBaseUomCode, "baseUomCode")}
                  placeholder="例: M, KG"
                  maxLength={10}
                  className={errors.baseUomCode ? "border-destructive" : ""}
                />
                {errors.baseUomCode && (
                  <p className="text-sm text-destructive">{errors.baseUomCode}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseUomName">
                  基準単位名 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="baseUomName"
                  value={baseUomName}
                  onChange={(e) => setBaseUomName(e.target.value)}
                  placeholder="例: メートル、キログラム"
                  className={errors.baseUomName ? "border-destructive" : ""}
                />
                {errors.baseUomName && (
                  <p className="text-sm text-destructive">{errors.baseUomName}</p>
                )}
              </div>
            </>
          )}

          {/* Base Uom Display (Edit only) */}
          {isEdit && group?.baseUom && (
            <div className="space-y-2">
              <Label>基準単位（変更不可）</Label>
              <div className="px-3 py-2 bg-muted rounded-md text-sm">
                {group.baseUom.uomCode} ({group.baseUom.uomName})
              </div>
              <p className="text-xs text-muted-foreground">
                基準単位はグループ作成時に固定され、変更できません
              </p>
            </div>
          )}

          {/* Status (Edit only) */}
          {isEdit && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <Label>ステータス</Label>
                <p className="text-sm text-muted-foreground">
                  {group?.isActive ? "有効" : "無効"}
                </p>
              </div>
              {group?.isActive ? (
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
