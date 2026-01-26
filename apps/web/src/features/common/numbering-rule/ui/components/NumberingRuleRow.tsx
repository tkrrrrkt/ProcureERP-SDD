'use client';

/**
 * 採番ルール行コンポーネント（インライン編集対応）
 */

import { useState, useEffect } from 'react';
import { TableRow, TableCell } from '@/shared/ui';
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
import { Badge } from '@/shared/ui';
import { Check, X, Pencil } from 'lucide-react';

import type {
  NumberingRuleBffDto,
  PeriodKind,
  SequenceScopeKind,
} from '../types';
import { generatePreview } from '../utils/preview';
import { validatePrefix, toUpperCasePrefix } from '../utils/validation';

interface NumberingRuleRowProps {
  rule: NumberingRuleBffDto;
  canEdit: boolean;
  isUpdating: boolean;
  editingId: string | null;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
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
}

export function NumberingRuleRow({
  rule,
  canEdit,
  isUpdating,
  editingId,
  onStartEdit,
  onCancelEdit,
  onSave,
}: NumberingRuleRowProps) {
  const isEditing = editingId === rule.id;

  // Edit state
  const [prefix, setPrefix] = useState(rule.prefix);
  const [includeDepartmentSymbol, setIncludeDepartmentSymbol] = useState(
    rule.includeDepartmentSymbol
  );
  const [periodKind, setPeriodKind] = useState<PeriodKind>(rule.periodKind);
  const [sequenceScopeKind, setSequenceScopeKind] = useState<SequenceScopeKind>(
    rule.sequenceScopeKind
  );
  const [prefixError, setPrefixError] = useState<string | null>(null);

  // Reset form when rule changes or editing stops
  useEffect(() => {
    if (!isEditing) {
      setPrefix(rule.prefix);
      setIncludeDepartmentSymbol(rule.includeDepartmentSymbol);
      setPeriodKind(rule.periodKind);
      setSequenceScopeKind(rule.sequenceScopeKind);
      setPrefixError(null);
    }
  }, [rule, isEditing]);

  // Handle prefix change
  const handlePrefixChange = (value: string) => {
    const normalized = toUpperCasePrefix(value);
    setPrefix(normalized);
    if (normalized) {
      const validation = validatePrefix(normalized);
      setPrefixError(validation.error ?? null);
    } else {
      setPrefixError('prefixは必須です');
    }
  };

  // Handle save
  const handleSave = async () => {
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

  // Compute preview
  const preview = isEditing
    ? prefix
      ? generatePreview(prefix, includeDepartmentSymbol, periodKind)
      : '---'
    : rule.numberPreview;

  // Editing mode
  if (isEditing) {
    return (
      <TableRow className="bg-muted/30">
        <TableCell className="font-medium">{rule.documentTypeName}</TableCell>
        <TableCell>
          <div className="flex flex-col gap-1">
            <Input
              value={prefix}
              onChange={(e) => handlePrefixChange(e.target.value)}
              className="w-16 h-8 font-mono uppercase text-center"
              maxLength={1}
              disabled={isUpdating}
            />
            {prefixError && (
              <span className="text-xs text-destructive">{prefixError}</span>
            )}
          </div>
        </TableCell>
        <TableCell>
          <Switch
            checked={includeDepartmentSymbol}
            onCheckedChange={setIncludeDepartmentSymbol}
            disabled={isUpdating}
          />
        </TableCell>
        <TableCell>
          <Select
            value={periodKind}
            onValueChange={(v) => setPeriodKind(v as PeriodKind)}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">なし</SelectItem>
              <SelectItem value="YY">年（YY）</SelectItem>
              <SelectItem value="YYMM">年月（YYMM）</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell>
          <Select
            value={sequenceScopeKind}
            onValueChange={(v) => setSequenceScopeKind(v as SequenceScopeKind)}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COMPANY">全社連番</SelectItem>
              <SelectItem value="DEPARTMENT">部門別連番</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell>
          <code className="rounded bg-muted px-2 py-1 font-mono text-sm">
            {preview}
          </code>
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleSave}
              disabled={isUpdating || !!prefixError || !prefix}
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onCancelEdit}
              disabled={isUpdating}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  // Display mode
  return (
    <TableRow
      className={canEdit ? 'cursor-pointer hover:bg-muted/50' : ''}
      onClick={() => canEdit && onStartEdit(rule.id)}
    >
      <TableCell className="font-medium">{rule.documentTypeName}</TableCell>
      <TableCell>
        <Badge variant="outline" className="font-mono">
          {rule.prefix}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge
          variant={rule.includeDepartmentSymbol ? 'default' : 'secondary'}
        >
          {rule.includeDepartmentSymbol ? 'あり' : 'なし'}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {periodKindLabels[rule.periodKind]}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {sequenceScopeLabels[rule.sequenceScopeKind]}
      </TableCell>
      <TableCell>
        <code className="rounded bg-muted px-2 py-1 font-mono text-sm">
          {rule.numberPreview}
        </code>
      </TableCell>
      {canEdit && (
        <TableCell className="text-right">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit(rule.id);
            }}
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
}

const periodKindLabels: Record<PeriodKind, string> = {
  NONE: 'なし',
  YY: '年（YY）',
  YYMM: '年月（YYMM）',
};

const sequenceScopeLabels: Record<SequenceScopeKind, string> = {
  COMPANY: '全社連番',
  DEPARTMENT: '部門別連番',
};
