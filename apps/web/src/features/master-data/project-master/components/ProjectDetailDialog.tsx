"use client"

import { useState, useEffect } from "react"
import { Dialog } from "@/shared/ui/index"
import { Button } from "@/shared/ui/index"
import { Input } from "@/shared/ui/index"
import { Label } from "@/shared/ui/index"
import { Alert } from "@/shared/ui/index"
import { Badge } from "@/shared/ui/index"
import { Spinner } from "@/shared/ui/index"
import { Separator } from "@/shared/ui/index"
import type { BffClient } from "../api/BffClient"
import type { ProjectMasterDetailResponse, UpdateProjectMasterRequest } from "@contracts/bff/project-master"

interface ProjectDetailDialogProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  bffClient: BffClient
}

interface FormData {
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

export function ProjectDetailDialog({ projectId, open, onOpenChange, bffClient }: ProjectDetailDialogProps) {
  const [project, setProject] = useState<ProjectMasterDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)

  useEffect(() => {
    if (open && projectId) {
      loadProject()
    }
  }, [open, projectId])

  const loadProject = async () => {
    setIsLoading(true)
    setGeneralError(null)
    try {
      const data = await bffClient.findById(projectId)
      setProject(data)
      initializeFormData(data)
    } catch (error: any) {
      console.error("[v0] Failed to load project:", error)
      if (error.status === 404) {
        setGeneralError("プロジェクトが見つかりませんでした")
      } else {
        setGeneralError("プロジェクトの読み込みに失敗しました")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const initializeFormData = (data: ProjectMasterDetailResponse) => {
    setFormData({
      projectName: data.projectName,
      projectShortName: data.projectShortName || "",
      projectKanaName: data.projectKanaName || "",
      departmentCode: data.departmentCode || "",
      responsibleEmployeeCode: data.responsibleEmployeeCode || "",
      responsibleEmployeeName: data.responsibleEmployeeName || "",
      plannedPeriodFrom: data.plannedPeriodFrom.split("T")[0],
      plannedPeriodTo: data.plannedPeriodTo.split("T")[0],
      actualPeriodFrom: data.actualPeriodFrom ? data.actualPeriodFrom.split("T")[0] : "",
      actualPeriodTo: data.actualPeriodTo ? data.actualPeriodTo.split("T")[0] : "",
      budgetAmount: data.budgetAmount,
    })
  }

  const handleChange = (field: keyof FormData, value: string) => {
    if (!formData) return
    setFormData((prev) => ({ ...prev!, [field]: value }))
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validate = (): boolean => {
    if (!formData) return false
    const errors: ValidationErrors = {}

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

  const handleUpdate = async () => {
    if (!project || !formData) return

    setGeneralError(null)

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      const request: UpdateProjectMasterRequest = {
        ifMatchVersion: project.version,
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

      const updated = await bffClient.update(projectId, request)
      setProject(updated)
      initializeFormData(updated)
      setIsEditing(false)
    } catch (error: any) {
      console.error("[v0] Update project failed:", error)
      if (error.code === "STALE_UPDATE") {
        setGeneralError("データが更新されています。最新の情報を取得してから再度お試しください")
        await loadProject()
      } else if (error.status === 403) {
        setGeneralError("この操作を実行する権限がありません")
      } else {
        setGeneralError("プロジェクトの更新に失敗しました")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeactivate = async () => {
    if (!project) return

    setIsSubmitting(true)
    setGeneralError(null)

    try {
      const updated = await bffClient.deactivate(projectId, project.version)
      setProject(updated)
      initializeFormData(updated)
    } catch (error: any) {
      console.error("[v0] Deactivate project failed:", error)
      if (error.code === "PROJECT_ALREADY_INACTIVE") {
        setGeneralError("このプロジェクトは既に無効化されています")
      } else if (error.status === 403) {
        setGeneralError("この操作を実行する権限がありません")
      } else {
        setGeneralError("プロジェクトの無効化に失敗しました")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReactivate = async () => {
    if (!project) return

    setIsSubmitting(true)
    setGeneralError(null)

    try {
      const updated = await bffClient.reactivate(projectId, project.version)
      setProject(updated)
      initializeFormData(updated)
    } catch (error: any) {
      console.error("[v0] Reactivate project failed:", error)
      if (error.code === "PROJECT_ALREADY_ACTIVE") {
        setGeneralError("このプロジェクトは既に有効化されています")
      } else if (error.status === 403) {
        setGeneralError("この操作を実行する権限がありません")
      } else {
        setGeneralError("プロジェクトの再有効化に失敗しました")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (project) {
      initializeFormData(project)
    }
    setIsEditing(false)
    setValidationErrors({})
    setGeneralError(null)
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <div className="p-6 flex items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </Dialog>
    )
  }

  if (!project || !formData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <div className="p-6">
          <Alert variant="destructive">
            <p className="text-sm">{generalError || "プロジェクトの読み込みに失敗しました"}</p>
          </Alert>
        </div>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">プロジェクト詳細</h2>
            <p className="text-sm text-muted-foreground mt-1">{project.projectCode}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={project.isActive ? "default" : "secondary"}>{project.isActive ? "有効" : "無効"}</Badge>
            <Badge variant="outline" className="font-mono">
              v{project.version}
            </Badge>
          </div>
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
              <Label>プロジェクトコード</Label>
              <Input value={project.projectCode} disabled className="font-mono" />
              <p className="text-xs text-muted-foreground">※ プロジェクトコードは変更できません</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-projectName">
                プロジェクト正式名 <span className="text-error">*</span>
              </Label>
              <Input
                id="edit-projectName"
                value={formData.projectName}
                onChange={(e) => handleChange("projectName", e.target.value)}
                disabled={!isEditing}
                className={validationErrors.projectName ? "border-error" : ""}
              />
              {validationErrors.projectName && <p className="text-sm text-error">{validationErrors.projectName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-projectShortName">プロジェクト略名</Label>
              <Input
                id="edit-projectShortName"
                value={formData.projectShortName}
                onChange={(e) => handleChange("projectShortName", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-projectKanaName">プロジェクトカナ名</Label>
              <Input
                id="edit-projectKanaName"
                value={formData.projectKanaName}
                onChange={(e) => handleChange("projectKanaName", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-departmentCode">部門コード</Label>
              <Input
                id="edit-departmentCode"
                value={formData.departmentCode}
                onChange={(e) => handleChange("departmentCode", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-responsibleEmployeeCode">担当者コード</Label>
              <Input
                id="edit-responsibleEmployeeCode"
                value={formData.responsibleEmployeeCode}
                onChange={(e) => handleChange("responsibleEmployeeCode", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-responsibleEmployeeName">担当者名</Label>
              <Input
                id="edit-responsibleEmployeeName"
                value={formData.responsibleEmployeeName}
                onChange={(e) => handleChange("responsibleEmployeeName", e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-plannedPeriodFrom">
                予定期間 From <span className="text-error">*</span>
              </Label>
              <Input
                id="edit-plannedPeriodFrom"
                type="date"
                value={formData.plannedPeriodFrom}
                onChange={(e) => handleChange("plannedPeriodFrom", e.target.value)}
                disabled={!isEditing}
                className={validationErrors.plannedPeriodFrom ? "border-error" : ""}
              />
              {validationErrors.plannedPeriodFrom && (
                <p className="text-sm text-error">{validationErrors.plannedPeriodFrom}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-plannedPeriodTo">
                予定期間 To <span className="text-error">*</span>
              </Label>
              <Input
                id="edit-plannedPeriodTo"
                type="date"
                value={formData.plannedPeriodTo}
                onChange={(e) => handleChange("plannedPeriodTo", e.target.value)}
                disabled={!isEditing}
                className={validationErrors.plannedPeriodTo ? "border-error" : ""}
              />
              {validationErrors.plannedPeriodTo && (
                <p className="text-sm text-error">{validationErrors.plannedPeriodTo}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-actualPeriodFrom">実績 From</Label>
              <Input
                id="edit-actualPeriodFrom"
                type="date"
                value={formData.actualPeriodFrom}
                onChange={(e) => handleChange("actualPeriodFrom", e.target.value)}
                disabled={!isEditing}
                className={validationErrors.actualPeriodFrom ? "border-error" : ""}
              />
              {validationErrors.actualPeriodFrom && (
                <p className="text-sm text-error">{validationErrors.actualPeriodFrom}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-actualPeriodTo">実績 To</Label>
              <Input
                id="edit-actualPeriodTo"
                type="date"
                value={formData.actualPeriodTo}
                onChange={(e) => handleChange("actualPeriodTo", e.target.value)}
                disabled={!isEditing}
                className={validationErrors.actualPeriodTo ? "border-error" : ""}
              />
              {validationErrors.actualPeriodTo && (
                <p className="text-sm text-error">{validationErrors.actualPeriodTo}</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="edit-budgetAmount">
              予算金額 <span className="text-error">*</span>
            </Label>
            <Input
              id="edit-budgetAmount"
              type="number"
              step="0.01"
              value={formData.budgetAmount}
              onChange={(e) => handleChange("budgetAmount", e.target.value)}
              disabled={!isEditing}
              className={validationErrors.budgetAmount ? "border-error" : ""}
            />
            {validationErrors.budgetAmount && <p className="text-sm text-error">{validationErrors.budgetAmount}</p>}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">作成日時</p>
              <p className="font-mono">{new Date(project.createdAt).toLocaleString("ja-JP")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">作成者</p>
              <p>{project.createdBy}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">更新日時</p>
              <p className="font-mono">{new Date(project.updatedAt).toLocaleString("ja-JP")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">更新者</p>
              <p>{project.updatedBy}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between">
          <div className="flex gap-2">
            {project.isActive ? (
              <Button variant="destructive" onClick={handleDeactivate} disabled={isSubmitting || isEditing}>
                無効化
              </Button>
            ) : (
              <Button variant="default" onClick={handleReactivate} disabled={isSubmitting || isEditing}>
                再有効化
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                  キャンセル
                </Button>
                <Button onClick={handleUpdate} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner className="h-4 w-4 mr-2" />
                      更新中...
                    </>
                  ) : (
                    "更新"
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  閉じる
                </Button>
                <Button onClick={() => setIsEditing(true)}>編集</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  )
}
