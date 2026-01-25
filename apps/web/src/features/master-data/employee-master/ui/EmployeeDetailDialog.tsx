'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/components/dialog';
import { Button } from '@/shared/ui/components/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/components/tabs';
import { Pencil } from 'lucide-react';
import type { EmployeeDto, BffClient } from '../api/BffClient';
import { BasicInfoTab } from './tabs/BasicInfoTab';
import { AssignmentTab } from './tabs/AssignmentTab';
import { EmployeeFormDialog } from './EmployeeFormDialog';

interface EmployeeDetailDialogProps {
  employee: EmployeeDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  bffClient: BffClient;
}

/**
 * EmployeeDetailDialog Component
 *
 * 社員詳細ダイアログ（タブ構造）
 * - 基本情報タブ: 社員基本情報の表示
 * - 所属情報タブ: 所属履歴の管理
 */
export function EmployeeDetailDialog({
  employee,
  open,
  onOpenChange,
  onUpdate,
  bffClient,
}: EmployeeDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Handle edit
  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  // Handle edit success
  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    onUpdate();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="!max-w-none w-[calc(100vw-32px)] h-[57vh] overflow-hidden flex flex-col mx-4">
          <DialogHeader className="flex-shrink-0 pb-4 border-b">
            <div className="flex items-center justify-between pr-8">
              <DialogTitle className="text-xl font-semibold">
                {employee.employeeName}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({employee.employeeCode})
                </span>
              </DialogTitle>
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                編集
              </Button>
            </div>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 overflow-hidden flex flex-col min-h-0"
          >
            <TabsList className="flex-shrink-0 w-fit">
              <TabsTrigger value="basic">基本情報</TabsTrigger>
              <TabsTrigger value="assignment">所属情報</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto overflow-x-hidden mt-4 min-h-0">
              <TabsContent value="basic" className="mt-0 min-h-[400px]">
                <BasicInfoTab employee={employee} />
              </TabsContent>

              <TabsContent value="assignment" className="mt-0 min-h-[400px]">
                <AssignmentTab employeeId={employee.id} bffClient={bffClient} />
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <EmployeeFormDialog
        mode="edit"
        employee={employee}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleEditSuccess}
        bffClient={bffClient}
      />
    </>
  );
}
