'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/components/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/components/card';
import { Layers, FolderTree, Link2 } from 'lucide-react';
import { CategoryAxisList } from './components/CategoryAxisList';
import { SegmentList } from './components/SegmentList';
import { SegmentAssignmentSection } from './components/SegmentAssignmentSection';
import { mockBffClient } from '../api/MockBffClient';
import type { BffClient } from '../api/BffClient';

interface CategorySegmentPageProps {
  /**
   * BFF Client instance to use (defaults to mockBffClient)
   * Pass httpBffClient for production
   */
  bffClient?: BffClient;
}

/**
 * Category-Segment Master Page
 *
 * This page provides UI for managing:
 * - CategoryAxis: Classification axes for different entity types
 * - Segment: Values within each axis (hierarchical for ITEM type)
 * - SegmentAssignment: Assignment of segments to entities
 */
export function CategorySegmentPage({ bffClient = mockBffClient }: CategorySegmentPageProps) {
  const [activeTab, setActiveTab] = useState('axes');

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          カテゴリ・セグメントマスタ
        </h1>
        <p className="text-muted-foreground">
          品目・取引先法人・仕入先拠点を分類するためのカテゴリ軸とセグメントを管理します。
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="axes" className="gap-2">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">カテゴリ軸</span>
            <span className="sm:hidden">軸</span>
          </TabsTrigger>
          <TabsTrigger value="segments" className="gap-2">
            <FolderTree className="h-4 w-4" />
            <span className="hidden sm:inline">セグメント</span>
            <span className="sm:hidden">セグ</span>
          </TabsTrigger>
          <TabsTrigger value="demo" className="gap-2">
            <Link2 className="h-4 w-4" />
            <span className="hidden sm:inline">割当デモ</span>
            <span className="sm:hidden">デモ</span>
          </TabsTrigger>
        </TabsList>

        {/* Category Axis Tab */}
        <TabsContent value="axes">
          <CategoryAxisList bffClient={bffClient} />
        </TabsContent>

        {/* Segment Tab */}
        <TabsContent value="segments">
          <SegmentList bffClient={bffClient} />
        </TabsContent>

        {/* Assignment Demo Tab */}
        <TabsContent value="demo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>セグメント割当デモ</CardTitle>
              <CardDescription>
                エンティティ詳細画面に埋め込むセグメント割当セクションのデモです。
                実際の使用時は、各エンティティ詳細画面（取引先法人詳細、品目詳細など）に配置します。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Demo: Party Entity */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  取引先法人 (party-001) のセグメント
                </h3>
                <SegmentAssignmentSection
                  bffClient={bffClient}
                  entityKind="PARTY"
                  entityId="party-001"
                />
              </div>

              {/* Demo: Item Entity (Empty) */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  品目 (item-001) のセグメント（割当なし）
                </h3>
                <SegmentAssignmentSection
                  bffClient={bffClient}
                  entityKind="ITEM"
                  entityId="item-001"
                />
              </div>

              {/* Demo: Read-only mode */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  読み取り専用モード
                </h3>
                <SegmentAssignmentSection
                  bffClient={bffClient}
                  entityKind="PARTY"
                  entityId="party-001"
                  readOnly
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
