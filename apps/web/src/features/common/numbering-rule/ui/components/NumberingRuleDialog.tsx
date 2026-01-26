'use client';

/**
 * 採番ルール編集ダイアログ
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui';
import { Button } from '@/shared/ui';
import { Input } from '@/shared/ui';
import { Switch } from '@/shared/ui';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/shared/ui';
import { Alert, AlertTitle, AlertDescription } from '@/shared/ui';
import { Badge } from '@/shared/ui';
import { Separator } from '@/shared/ui';

import type {
  NumberingRuleBffDto,
  PeriodKind,
  SequenceScopeKind,
  BffError,
} from '../types';
import { DocumentTypeErrorCode, DocumentTypeErrorMessage } from '../types';
import { generatePreview } from '../utils/preview';
import { validatePrefix, toUpperCasePrefix } from '../utils/validation';

interface NumberingRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: NumberingRuleBffDto | null;
  onSave: (
    id: string,
    data: {
      prefix: string;
      includeDepartmentSymbol: boolean;
      periodKind: PeriodKind;
      sequenceScopeKind: SequenceScopeKind;
      version: number;
    }
  ) => Promise<void>;
  isUpdating: boolean;
  error: BffError | null;
  onClearError: () => void;
  onReload: () => void;
}

export function NumberingRuleDialog({
  open,
  onOpenChange,
  rule,
  onSave,
  isUpdating,
  error,
  onClearError,
  onReload,
}: NumberingRuleDialogProps) {
  // Form state
  const [prefix, setPrefix] = useState('');
  const [includeDepartmentSymbol, setIncludeDepartmentSymbol] = useState(false);
  const [periodKind, setPeriodKind] = useState<PeriodKind>('YYMM');
  const [sequenceScopeKind, setSequenceScopeKind] =
    useState<SequenceScopeKind>('COMPANY');

  // Validation state
  const [prefixError, setPrefixError] = useState<string | null>(null);

  // Initialize form when rule changes
  useEffect(() => {
    if (rule) {
      setPrefix(rule.prefix);
      setIncludeDepartmentSymbol(rule.includeDepartmentSymbol);
      setPeriodKind(rule.periodKind);
      setSequenceScopeKind(rule.sequenceScopeKind);
      setPrefixError(null);
    }
  }, [rule]);

  // Clear error when dialog closes
  useEffect(() => {
    if (!open) {
      onClearError();
      setPrefixError(null);
    }
  }, [open, onClearError]);

  // Generate preview in real-time
  const preview = useMemo(() => {
    if (!prefix) return '---';
    return generatePreview(prefix, includeDepartmentSymbol, periodKind);
  }, [prefix, includeDepartmentSymbol, periodKind]);

  // Handle prefix input with auto uppercase and validation
  const handlePrefixChange = (value: string) => {
    const normalized = toUpperCasePrefix(value);
    setPrefix(normalized);

    if (normalized) {
      const validation = validatePrefix(normalized);
      setPrefixError(validation.error ?? null);
    } else {
      setPrefixError(null);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!rule) return;

    // Validate
    const validation = validatePrefix(prefix);
    if (!validation.isValid) {
      setPrefixError(validation.error ?? 'Invalid prefix');
      return;
    }

    await onSave(rule.id, {
      prefix,
      includeDepartmentSymbol,
      periodKind,
      sequenceScopeKind,
      version: rule.version,
    });
  };

  // Check if this is a concurrent update error
  const isConcurrentError =
    error?.code === DocumentTypeErrorCode.CONCURRENT_UPDATE;

  // Get user-friendly error message
  const errorMessage = error?.code
    ? DocumentTypeErrorMessage[error.code] || error.message
    : error?.message;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{rule?.documentTypeName}の採番ルール編集</DialogTitle>
          <DialogDescription>
            この伝票種類の採番ルールを設定します。
          </DialogDescription>
        </DialogHeader>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <span>{errorMessage}</span>
              {isConcurrentError && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClearError();
                    onReload();
                    onOpenChange(false);
                  }}
                  className="w-fit"
                >
                  画面を再読み込み
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6 py-4">
          {/* Prefix Input */}
          <div className="space-y-2">
            <label
              htmlFor="prefix"
              className="text-sm font-medium text-foreground"
            >
              Prefix（先頭文字）
            </label>
            <Input
              id="prefix"
              value={prefix}
              onChange={(e) => handlePrefixChange(e.target.value)}
              placeholder="例: P"
              maxLength={1}
              className="w-24 uppercase"
              aria-describedby={prefixError ? 'prefix-error' : undefined}
              aria-invalid={!!prefixError}
            />
            {prefixError && (
              <p id="prefix-error" className="text-sm text-destructive">
                {prefixError}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              英大文字1文字を入力してください
            </p>
          </div>

          <Separator />

          {/* Include Department Symbol */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label
                htmlFor="dept-symbol"
                className="text-sm font-medium text-foreground"
              >
                部門記号を含める
              </label>
              <p className="text-xs text-muted-foreground">
                採番に部門記号を含めます（例: PA...）
              </p>
            </div>
            <Switch
              id="dept-symbol"
              checked={includeDepartmentSymbol}
              onCheckedChange={setIncludeDepartmentSymbol}
            />
          </div>

          <Separator />

          {/* Period Kind */}
          <div className="space-y-2">
            <label
              htmlFor="period-kind"
              className="text-sm font-medium text-foreground"
            >
              期間種別
            </label>
            <Select
              value={periodKind}
              onValueChange={(v) => setPeriodKind(v as PeriodKind)}
            >
              <SelectTrigger id="period-kind" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">なし</SelectItem>
                <SelectItem value="YY">年（YY）</SelectItem>
                <SelectItem value="YYMM">年月（YYMM）</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              採番に含める期間の形式を選択します
            </p>
          </div>

          <Separator />

          {/* Sequence Scope */}
          <div className="space-y-2">
            <label
              htmlFor="seq-scope"
              className="text-sm font-medium text-foreground"
            >
              系列分割
            </label>
            <Select
              value={sequenceScopeKind}
              onValueChange={(v) =>
                setSequenceScopeKind(v as SequenceScopeKind)
              }
            >
              <SelectTrigger id="seq-scope" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMPANY">全社連番</SelectItem>
                <SelectItem value="DEPARTMENT">部門別連番</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              連番の採番単位を選択します
            </p>
          </div>

          <Separator />

          {/* Preview */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-foreground">
              採番プレビュー
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono text-base px-3 py-1">
                {preview}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              現在の設定に基づく採番例です
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleSave}
            disabled={isUpdating || !!prefixError || !prefix}
          >
            {isUpdating ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
