"use client"

import { useState } from "react"
import { Dialog } from "@/shared/ui/index"
import { Button } from "@/shared/ui/index"
import { Input } from "@/shared/ui/index"
import { Label } from "@/shared/ui/index"
import { Alert } from "@/shared/ui/index"
import { Spinner } from "@/shared/ui/index"
import { Separator } from "@/shared/ui/index"
import type { BffClient } from "../api/BffClient"
import type { CreateProjectMasterRequest } from "@contracts/bff/project-master"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  bffClient: BffClient
}

interface FormData {
  projectCode: string
  projectName: string
  projectShortName: string
  projectKanaName: string
  departmentCode: string
  responsibleEmployeeCode: string
  responsibleEmployeeName: string
  plannedPeriodFrom: string
  plannedPeriodTo: string
  actualPeriodFrom: string
  actualPeriodTo: string
  budgetAmount: string
}

interface ValidationErrors {
  [key: string]: string
}

export function CreateProjectDialog({ open, onOpenChange, onSuccess, bffClient }: CreateProjectDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    projectCode: "",
    projectName: "",
    projectShortName: "",
    projectKanaName: "",
    departmentCode: "",
    responsibleEmployeeCode: "",
    responsibleEmployeeName: "",
    plannedPeriodFrom: "",
    plannedPeriodTo: "",
    actualPeriodFrom: "",
    actualPeriodTo: "",
    budgetAmount: "",
  })

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validate = (): boolean => {
    const errors: ValidationErrors = {}

    if (!formData.projectCode.trim()) {
      errors.projectCode = "プロジェクトコードを入力してください"
    }
    if (!formData.projectName.trim()) {
      errors.projectName = "プロジェクト正式名を入力してください"
    }
    if (!formData.plannedPeriodFrom) {
      errors.plannedPeriodFrom = "プロジェクト予定期間Fromを入力してください"
    }
    if (!formData.plannedPeriodTo) {
      errors.plannedPeriodTo = "プロジェクト予定期間Toを入力してください"
    }
    if (!formData.budgetAmount) {
      errors.budgetAmount = "プロジェクト予算金額を入力してください"
    }

    if (formData.plannedPeriodFrom && formData.plannedPeriodTo) {
      if (new Date(formData.plannedPeriodFrom) > new Date(formData.plannedPeriodTo)) {
        errors.plannedPeriodFrom = "プロジェクト予定期間FromはToより前の日付を入力してください"
      }
    }

    if (formData.actualPeriodFrom && formData.actualPeriodTo) {
      if (new Date(formData.actualPeriodFrom) > new Date(formData.actualPeriodTo)) {
        errors.actualPeriodFrom = "プロジェクト実績FromはToより前の日付を入力してください"
      }
    }

    if (formData.actualPeriodFrom && !formData.actualPeriodTo) {
      errors.actualPeriodTo = "プロジェクト実績Fromが指定されている場合、実績Toも必須です"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    setGeneralError(null)

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      const request: CreateProjectMasterRequest = {
        projectCode: formData.projectCode.trim(),
        projectName: formData.projectName.trim(),
        projectShortName: formData.projectShortName.trim() || null,
        projectKanaName: formData.projectKanaName.trim() || null,
        departmentCode: formData.departmentCode.trim() || null,
        responsibleEmployeeCode: formData.responsibleEmployeeCode.trim() || null,
        responsibleEmployeeName: formData.responsibleEmployeeName.trim() || null,
        plannedPeriodFrom: new Date(formData.plannedPeriodFrom).toISOString(),
        plannedPeriodTo: new Date(formData.plannedPeriodTo).toISOString(),
        actualPeriodFrom: formData.actualPeriodFrom ? new Date(formData.actualPeriodFrom).toISOString() : null,
        actualPeriodTo: formData.actualPeriodTo ? new Date(formData.actualPeriodTo).toISOString() : null,
        budgetAmount: formData.budgetAmount,
      }

      await bffClient.create(request)
      onSuccess()
      resetForm()
    } catch (error: any) {
      console.error("[v0] Create project failed:", error)
      if (error.code === "PROJECT_CODE_DUPLICATE") {
        setGeneralError("このプロジェクトコードは既に使用されています")
      } else if (error.status === 403) {
        setGeneralError("この操作を実行する権限がありません")
      } else {
        setGeneralError("プロジェクトの作成に失敗しました")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      projectCode: "",
      projectName: "",
      projectShortName: "",
      projectKanaName: "",
      departmentCode: "",
      responsibleEmployeeCode: "",
      responsibleEmployeeName: "",
      plannedPeriodFrom: "",
      plannedPeriodTo: "",
      actualPeriodFrom: "",
      actualPeriodTo: "",
      budgetAmount: "",
    })
    setValidationErrors({})
    setGeneralError(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">プロジェクト新規登録</h2>
          <p className="text-sm text-muted-foreground mt-1">新しいプロジェクト情報を登録します</p>
        </div>

        <Separator />

        {generalError && (
          <Alert variant="destructive">
            <p className="text-sm">{generalError}</p>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectCode">
                プロジェクトコード <span className="text-error">*</span>
              </Label>
              <Input
                id="projectCode"
                value={formData.projectCode}
                onChange={(e) => handleChange("projectCode", e.target.value)}
                placeholder="PRJ001"
                className={validationErrors.projectCode ? "border-error" : ""}
              />
              {validationErrors.projectCode && <p className="text-sm text-error">{validationErrors.projectCode}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectName">
                プロジェクト正式名 <span className="text-error">*</span>
              </Label>
              <Input
                id="projectName"
                value={formData.projectName}
                onChange={(e) => handleChange("projectName", e.target.value)}
                placeholder="新規事業開発プロジェクト"
                className={validationErrors.projectName ? "border-error" : ""}
              />
              {validationErrors.projectName && <p className="text-sm text-error">{validationErrors.projectName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectShortName">プロジェクト略名</Label>
              <Input
                id="projectShortName"
                value={formData.projectShortName}
                onChange={(e) => handleChange("projectShortName", e.target.value)}
                placeholder="新規事業"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectKanaName">プロジェクトカナ名</Label>
              <Input
                id="projectKanaName"
                value={formData.projectKanaName}
                onChange={(e) => handleChange("projectKanaName", e.target.value)}
                placeholder="シンキジギョウカイハツプロジェクト"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="departmentCode">部門コード</Label>
              <Input
                id="departmentCode"
                value={formData.departmentCode}
                onChange={(e) => handleChange("departmentCode", e.target.value)}
                placeholder="SALES"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibleEmployeeCode">担当者コード</Label>
              <Input
                id="responsibleEmployeeCode"
                value={formData.responsibleEmployeeCode}
                onChange={(e) => handleChange("responsibleEmployeeCode", e.target.value)}
                placeholder="EMP001"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="responsibleEmployeeName">担当者名</Label>
              <Input
                id="responsibleEmployeeName"
                value={formData.responsibleEmployeeName}
                onChange={(e) => handleChange("responsibleEmployeeName", e.target.value)}
                placeholder="田中 太郎"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plannedPeriodFrom">
                予定期間 From <span className="text-error">*</span>
              </Label>
              <Input
                id="plannedPeriodFrom"
                type="date"
                value={formData.plannedPeriodFrom}
                onChange={(e) => handleChange("plannedPeriodFrom", e.target.value)}
                className={validationErrors.plannedPeriodFrom ? "border-error" : ""}
              />
              {validationErrors.plannedPeriodFrom && (
                <p className="text-sm text-error">{validationErrors.plannedPeriodFrom}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="plannedPeriodTo">
                予定期間 To <span className="text-error">*</span>
              </Label>
              <Input
                id="plannedPeriodTo"
                type="date"
                value={formData.plannedPeriodTo}
                onChange={(e) => handleChange("plannedPeriodTo", e.target.value)}
                className={validationErrors.plannedPeriodTo ? "border-error" : ""}
              />
              {validationErrors.plannedPeriodTo && (
                <p className="text-sm text-error">{validationErrors.plannedPeriodTo}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualPeriodFrom">実績 From</Label>
              <Input
                id="actualPeriodFrom"
                type="date"
                value={formData.actualPeriodFrom}
                onChange={(e) => handleChange("actualPeriodFrom", e.target.value)}
                className={validationErrors.actualPeriodFrom ? "border-error" : ""}
              />
              {validationErrors.actualPeriodFrom && (
                <p className="text-sm text-error">{validationErrors.actualPeriodFrom}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualPeriodTo">実績 To</Label>
              <Input
                id="actualPeriodTo"
                type="date"
                value={formData.actualPeriodTo}
                onChange={(e) => handleChange("actualPeriodTo", e.target.value)}
                className={validationErrors.actualPeriodTo ? "border-error" : ""}
              />
              {validationErrors.actualPeriodTo && (
                <p className="text-sm text-error">{validationErrors.actualPeriodTo}</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="budgetAmount">
              予算金額 <span className="text-error">*</span>
            </Label>
            <Input
              id="budgetAmount"
              type="number"
              step="0.01"
              value={formData.budgetAmount}
              onChange={(e) => handleChange("budgetAmount", e.target.value)}
              placeholder="1000000.00"
              className={validationErrors.budgetAmount ? "border-error" : ""}
            />
            {validationErrors.budgetAmount && <p className="text-sm text-error">{validationErrors.budgetAmount}</p>}
          </div>
        </div>

        <Separator />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                作成中...
              </>
            ) : (
              "作成"
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
