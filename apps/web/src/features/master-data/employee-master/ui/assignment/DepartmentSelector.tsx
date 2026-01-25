'use client';

import { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/select';
import type { DepartmentOptionDto } from '../../api/BffClient';

interface DepartmentSelectorProps {
  departments: DepartmentOptionDto[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
}

/**
 * DepartmentSelector Component
 *
 * 部門選択ドロップダウン
 * - 階層構造を視覚的に表示（インデント）
 * - 部門コード + 部門名を表示
 */
export function DepartmentSelector({
  departments,
  value,
  onValueChange,
  disabled = false,
  error,
  placeholder = '部門を選択',
}: DepartmentSelectorProps) {
  // Sort departments by hierarchyPath for proper ordering
  const sortedDepartments = useMemo(() => {
    return [...departments].sort((a, b) => {
      const pathA = a.hierarchyPath || '';
      const pathB = b.hierarchyPath || '';
      return pathA.localeCompare(pathB);
    });
  }, [departments]);

  // Get display label for selected value
  const selectedDepartment = useMemo(() => {
    return departments.find((d) => d.stableId === value);
  }, [departments, value]);

  // Format display text with hierarchy indication
  const formatDepartmentLabel = (dept: DepartmentOptionDto): string => {
    // Add indent based on hierarchy level
    const indent = '\u00A0\u00A0'.repeat(dept.hierarchyLevel);
    return `${indent}${dept.departmentCode} - ${dept.departmentName}`;
  };

  // Format trigger display (without indent)
  const triggerLabel = selectedDepartment
    ? `${selectedDepartment.departmentCode} - ${selectedDepartment.departmentName}`
    : placeholder;

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={error ? 'border-destructive' : ''}>
        <SelectValue placeholder={placeholder}>{value ? triggerLabel : placeholder}</SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {sortedDepartments.length === 0 ? (
          <div className="py-2 px-3 text-sm text-muted-foreground">
            有効な部門がありません
          </div>
        ) : (
          sortedDepartments.map((dept) => (
            <SelectItem
              key={dept.stableId}
              value={dept.stableId}
              className="font-mono text-sm"
            >
              {formatDepartmentLabel(dept)}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
