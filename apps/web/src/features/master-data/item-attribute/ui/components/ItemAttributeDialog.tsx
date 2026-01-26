"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, Plus, AlertTriangle, ChevronRight } from "lucide-react"
import type {
  ItemAttributeDto,
  ItemAttributeValueDto,
  ItemAttributeValueSortBy,
  SortOrder
} from "../types/bff-contracts"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/components/table"
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

// Child components
import { ItemAttributeValueDialog } from "./ItemAttributeValueDialog"

interface ItemAttributeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attribute?: ItemAttributeDto | null
  mode: "create" | "edit"
  onSaved: () => void
}

export function ItemAttributeDialog({
  open,
  onOpenChange,
  attribute,
  mode,
  onSaved,
}: ItemAttributeDialogProps) {
  // Form state
  const [attributeCode, setAttributeCode] = useState("")
  const [attributeName, setAttributeName] = useState("")
  const [sortOrder, setSortOrder] = useState(0)
  const [version, setVersion] = useState(1)
  const [isActive, setIsActive] = useState(true)

  // Values state
  const [values, setValues] = useState<ItemAttributeValueDto[]>([])
  const [valuesLoading, setValuesLoading] = useState(false)

  // UI state
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Value dialog state
  const [valueDialogOpen, setValueDialogOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState<ItemAttributeValueDto | null>(null)
  const [valueDialogMode, setValueDialogMode] = useState<"create" | "edit">("create")

  // Confirmation dialogs
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false)
  const [deactivateWarning, setDeactivateWarning] = useState<{
    message: string
    usageCount: number
  } | null>(null)
  const [pendingDeactivateForce, setPendingDeactivateForce] = useState(false)

  // Initialize form when attribute changes
  useEffect(() => {
    if (open) {
      if (attribute && mode === "edit") {
        setAttributeCode(attribute.attributeCode)
        setAttributeName(attribute.attributeName)
        setSortOrder(attribute.sortOrder)
        setVersion(attribute.version)
        setIsActive(attribute.isActive)
        loadValues(attribute.id)
      } else {
        setAttributeCode("")
        setAttributeName("")
        setSortOrder(0)
        setVersion(1)
        setIsActive(true)
        setValues([])
      }
      setError(null)
      setValidationErrors({})
    }
  }, [open, attribute, mode])

  const loadValues = useCallback(async (attributeId: string) => {
    setValuesLoading(true)
    try {
      const response = await bffClient.listItemAttributeValues(attributeId, {
        page: 1,
        pageSize: 200,
        sortBy: "sortOrder",
        sortOrder: "asc",
      })
      setValues(response.items)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "UNKNOWN_ERROR"
      setError(getErrorMessage(message))
    } finally {
      setValuesLoading(false)
    }
  }, [])

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (mode === "create") {
      if (!attributeCode.trim()) {
        errors.attributeCode = "属性コードは必須です"
      } else if (!/^[A-Z0-9_-]{1,20}$/i.test(attributeCode.trim())) {
        errors.attributeCode = "英大文字・数字・ハイフン・アンダースコアで20文字以内"
      }
    }

    if (!attributeName.trim()) {
      errors.attributeName = "属性名は必須です"
    } else if (attributeName.trim().length > 100) {
      errors.attributeName = "属性名は100文字以内で入力してください"
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
        const response = await bffClient.createItemAttribute({
          attributeCode: attributeCode.trim().toUpperCase(),
          attributeName: attributeName.trim(),
          sortOrder,
        })
        // After create, switch to edit mode to show values
        onSaved()
        onOpenChange(false)
      } else if (attribute) {
        await bffClient.updateItemAttribute(attribute.id, {
          attributeName: attributeName.trim(),
          sortOrder,
          version,
        })
        onSaved()
        onOpenChange(false)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "UNKNOWN_ERROR"
      setError(getErrorMessage(message))
    } finally {
      setSaving(false)
    }
  }

  const handleActivate = async () => {
    if (!attribute) return

    setSaving(true)
    setError(null)

    try {
      await bffClient.activateItemAttribute(attribute.id, { version })
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
    if (!attribute) return

    setSaving(true)
    setError(null)
    setDeactivateWarning(null)

    try {
      const response = await bffClient.deactivateItemAttribute(attribute.id, {
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

  const handleAddValue = () => {
    setSelectedValue(null)
    setValueDialogMode("create")
    setValueDialogOpen(true)
  }

  const handleEditValue = (value: ItemAttributeValueDto) => {
    setSelectedValue(value)
    setValueDialogMode("edit")
    setValueDialogOpen(true)
  }

  const handleValueSaved = () => {
    if (attribute) {
      loadValues(attribute.id)
    }
  }

  const title = mode === "create" ? "仕様属性の新規登録" : `仕様属性の詳細 - ${attribute?.attributeCode}`

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "新しい仕様属性を登録します。登録後に属性値を追加できます。"
                : "仕様属性の情報を編集し、属性値を管理します。"
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

          <div className="space-y-6">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">基本情報</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="attributeCode">
                    属性コード <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="attributeCode"
                    value={attributeCode}
                    onChange={(e) => setAttributeCode(e.target.value.toUpperCase())}
                    placeholder="例: COLOR, SIZE"
                    disabled={mode === "edit"}
                    className={mode === "edit" ? "bg-muted" : "font-mono"}
                  />
                  {validationErrors.attributeCode && (
                    <p className="text-sm text-destructive">{validationErrors.attributeCode}</p>
                  )}
                  {mode === "create" && (
                    <p className="text-xs text-muted-foreground">
                      英大文字・数字・ハイフン・アンダースコア、20文字以内
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortOrder">表示順</Label>
                  <Input
                    id="sortOrder"
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
                <Label htmlFor="attributeName">
                  属性名 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="attributeName"
                  value={attributeName}
                  onChange={(e) => setAttributeName(e.target.value)}
                  placeholder="例: 色, サイズ"
                />
                {validationErrors.attributeName && (
                  <p className="text-sm text-destructive">{validationErrors.attributeName}</p>
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

            {/* Values Section (Edit mode only) */}
            {mode === "edit" && attribute && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">属性値一覧</h3>
                  <Button size="sm" onClick={handleAddValue} disabled={!isActive}>
                    <Plus className="h-4 w-4 mr-1" />
                    属性値を追加
                  </Button>
                </div>

                {valuesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : values.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg">
                    <p>属性値がありません</p>
                    <p className="text-sm mt-1">「属性値を追加」ボタンから追加してください</p>
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">値コード</TableHead>
                          <TableHead>値名</TableHead>
                          <TableHead className="w-[80px] text-center">表示順</TableHead>
                          <TableHead className="w-[100px]">ステータス</TableHead>
                          <TableHead className="w-[40px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {values.map((value) => (
                          <TableRow
                            key={value.id}
                            onClick={() => handleEditValue(value)}
                            className="cursor-pointer hover:bg-muted/50"
                          >
                            <TableCell className="font-mono text-sm">{value.valueCode}</TableCell>
                            <TableCell>{value.valueName}</TableCell>
                            <TableCell className="text-center">{value.sortOrder}</TableCell>
                            <TableCell>
                              <Badge variant={value.isActive ? "default" : "outline"}>
                                {value.isActive ? "有効" : "無効"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
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

      {/* Value Dialog */}
      {attribute && (
        <ItemAttributeValueDialog
          open={valueDialogOpen}
          onOpenChange={setValueDialogOpen}
          attributeId={attribute.id}
          attributeCode={attribute.attributeCode}
          value={selectedValue}
          mode={valueDialogMode}
          onSaved={handleValueSaved}
        />
      )}

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
              この仕様属性を無効化すると、関連するSKU仕様に影響する可能性があります。
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
