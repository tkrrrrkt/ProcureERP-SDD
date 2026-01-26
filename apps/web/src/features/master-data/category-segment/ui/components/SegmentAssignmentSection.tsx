'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/shared/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/components/card';
import { Badge } from '@/shared/ui/components/badge';
import { Alert, AlertDescription } from '@/shared/ui/components/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/components/alert-dialog';
import { Plus, X, AlertTriangle, Tag } from 'lucide-react';
import type { EntitySegmentInfo, SegmentAssignmentDto, TargetEntityKind, BffClient } from '../../api/BffClient';
import { SegmentAssignmentDialog } from './SegmentAssignmentDialog';

// Extended type to include assignment ID for deletion
interface EntitySegmentInfoWithAssignment extends EntitySegmentInfo {
  assignmentId: string;
}

interface SegmentAssignmentSectionProps {
  bffClient: BffClient;
  entityKind: TargetEntityKind;
  entityId: string;
  readOnly?: boolean;
}

export function SegmentAssignmentSection({
  bffClient,
  entityKind,
  entityId,
  readOnly = false,
}: SegmentAssignmentSectionProps) {
  // State
  const [segments, setSegments] = useState<EntitySegmentInfoWithAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialogs
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState<EntitySegmentInfoWithAssignment | null>(null);

  // Fetch data - get both entity segments (for display) and assignments (for IDs)
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch display info and assignments in parallel
      const [entityResponse, assignmentsResponse] = await Promise.all([
        bffClient.getEntitySegments(entityKind, entityId),
        bffClient.listSegmentAssignments({ entityKind, entityId }),
      ]);

      // Merge assignment IDs into entity segment info
      const segmentsWithAssignment: EntitySegmentInfoWithAssignment[] = entityResponse.segments.map((seg) => {
        const assignment = assignmentsResponse.items.find(
          (a) => a.categoryAxisId === seg.categoryAxisId && a.segmentId === seg.segmentId
        );
        return {
          ...seg,
          assignmentId: assignment?.id ?? '',
        };
      });

      setSegments(segmentsWithAssignment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'セグメント情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [bffClient, entityKind, entityId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleRemove = (info: EntitySegmentInfoWithAssignment) => {
    setSelectedInfo(info);
    setRemoveDialogOpen(true);
  };

  const confirmRemove = async () => {
    if (!selectedInfo || !selectedInfo.assignmentId) return;
    try {
      await bffClient.deleteSegmentAssignment(selectedInfo.assignmentId);
      setRemoveDialogOpen(false);
      setSelectedInfo(null);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : '解除に失敗しました');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          セグメント情報
        </CardTitle>
        {!readOnly && (
          <Button size="sm" variant="outline" onClick={() => setAssignDialogOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            追加・変更
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-sm text-muted-foreground py-4 text-center">
            読み込み中...
          </div>
        ) : segments.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4 text-center">
            セグメントが割り当てられていません
          </div>
        ) : (
          <div className="space-y-2">
            {segments.map((info) => (
              <div
                key={info.categoryAxisId}
                className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="font-normal">
                    {info.categoryAxisName}
                  </Badge>
                  <span className="text-sm font-medium text-foreground">
                    {info.segmentName}
                  </span>
                </div>
                {!readOnly && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(info)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">解除</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Assignment Dialog */}
      <SegmentAssignmentDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        bffClient={bffClient}
        entityKind={entityKind}
        entityId={entityId}
        currentAssignments={segments}
        onSuccess={fetchData}
      />

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>セグメント割当を解除</AlertDialogTitle>
            <AlertDialogDescription>
              「{selectedInfo?.categoryAxisName}: {selectedInfo?.segmentName}」
              の割当を解除しますか？この操作は取り消せます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove}>解除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
