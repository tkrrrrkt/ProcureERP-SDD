/**
 * Segment Repository
 *
 * DBアクセス層（tenant_id double-guard）
 * - 階層管理機能（hierarchy_level, hierarchy_path）
 * - 祖先・子孫取得メソッド
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, Segment } from '@prisma/client';
import { SegmentSortBy, SortOrder, SegmentTreeNode } from '@procure/contracts/api/category-segment';

@Injectable()
export class SegmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * セグメント一覧取得（フラット形式）
   */
  async findMany(params: {
    tenantId: string;
    categoryAxisId: string;
    offset: number;
    limit: number;
    sortBy?: SegmentSortBy;
    sortOrder?: SortOrder;
    keyword?: string;
    isActive?: boolean;
  }): Promise<{ items: Segment[]; total: number }> {
    const { tenantId, categoryAxisId, offset, limit, sortBy, sortOrder, keyword, isActive } =
      params;

    const where: Prisma.SegmentWhereInput = {
      tenantId,
      categoryAxisId,
    };

    if (keyword) {
      where.OR = [
        { segmentCode: { contains: keyword, mode: 'insensitive' } },
        { segmentName: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const sortField = sortBy || 'displayOrder';
    const sortDirection = sortOrder || 'asc';

    const orderBy: Prisma.SegmentOrderByWithRelationInput = {
      [sortField]: sortDirection,
    };

    const [items, total] = await Promise.all([
      this.prisma.segment.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
      }),
      this.prisma.segment.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * セグメント一覧取得（階層ツリー形式）
   */
  async listTree(tenantId: string, categoryAxisId: string): Promise<SegmentTreeNode[]> {
    const segments = await this.prisma.segment.findMany({
      where: {
        tenantId,
        categoryAxisId,
        isActive: true,
      },
      orderBy: [{ hierarchyLevel: 'asc' }, { displayOrder: 'asc' }],
    });

    // ツリー構造に変換
    const nodeMap = new Map<string, SegmentTreeNode>();
    const roots: SegmentTreeNode[] = [];

    // まず全ノードを作成
    for (const segment of segments) {
      nodeMap.set(segment.id, {
        id: segment.id,
        segmentCode: segment.segmentCode,
        segmentName: segment.segmentName,
        hierarchyLevel: segment.hierarchyLevel,
        children: [],
      });
    }

    // 親子関係を構築
    for (const segment of segments) {
      const node = nodeMap.get(segment.id)!;
      if (segment.parentSegmentId) {
        const parent = nodeMap.get(segment.parentSegmentId);
        if (parent) {
          parent.children.push(node);
        } else {
          // 親が見つからない場合はルートに追加
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  /**
   * IDによるセグメント取得
   */
  async findById(params: { tenantId: string; segmentId: string }): Promise<Segment | null> {
    const { tenantId, segmentId } = params;

    return this.prisma.segment.findFirst({
      where: {
        tenantId,
        id: segmentId,
      },
    });
  }

  /**
   * セグメントコードによる取得（同一軸内での重複チェック用）
   */
  async findByCode(params: {
    tenantId: string;
    categoryAxisId: string;
    segmentCode: string;
  }): Promise<Segment | null> {
    const { tenantId, categoryAxisId, segmentCode } = params;

    return this.prisma.segment.findFirst({
      where: {
        tenantId,
        categoryAxisId,
        segmentCode,
      },
    });
  }

  /**
   * セグメント作成
   */
  async create(params: {
    tenantId: string;
    categoryAxisId: string;
    segmentCode: string;
    segmentName: string;
    parentSegmentId?: string;
    hierarchyLevel: number;
    hierarchyPath: string;
    displayOrder?: number;
    description?: string;
    createdByLoginAccountId?: string;
  }): Promise<Segment> {
    const {
      tenantId,
      categoryAxisId,
      segmentCode,
      segmentName,
      parentSegmentId,
      hierarchyLevel,
      hierarchyPath,
      displayOrder = 1000,
      description,
      createdByLoginAccountId,
    } = params;

    return this.prisma.segment.create({
      data: {
        tenantId,
        categoryAxisId,
        segmentCode,
        segmentName,
        parentSegmentId,
        hierarchyLevel,
        hierarchyPath,
        displayOrder,
        description,
        createdByLoginAccountId,
        updatedByLoginAccountId: createdByLoginAccountId,
      },
    });
  }

  /**
   * セグメント更新（楽観ロック対応）
   */
  async update(params: {
    tenantId: string;
    segmentId: string;
    version: number;
    segmentName?: string;
    parentSegmentId?: string | null;
    hierarchyLevel?: number;
    hierarchyPath?: string;
    displayOrder?: number;
    description?: string;
    isActive?: boolean;
    updatedByLoginAccountId?: string;
  }): Promise<Segment | null> {
    const {
      tenantId,
      segmentId,
      version,
      segmentName,
      parentSegmentId,
      hierarchyLevel,
      hierarchyPath,
      displayOrder,
      description,
      isActive,
      updatedByLoginAccountId,
    } = params;

    try {
      return await this.prisma.segment.update({
        where: {
          id: segmentId,
          tenantId,
          version,
        },
        data: {
          ...(segmentName !== undefined && { segmentName }),
          ...(parentSegmentId !== undefined && { parentSegmentId }),
          ...(hierarchyLevel !== undefined && { hierarchyLevel }),
          ...(hierarchyPath !== undefined && { hierarchyPath }),
          ...(displayOrder !== undefined && { displayOrder }),
          ...(description !== undefined && { description }),
          ...(isActive !== undefined && { isActive }),
          ...(updatedByLoginAccountId && { updatedByLoginAccountId }),
          version: { increment: 1 },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  /**
   * 祖先セグメント取得（循環参照検出用）
   */
  async findAncestors(tenantId: string, segmentId: string): Promise<Segment[]> {
    const ancestors: Segment[] = [];
    let currentId: string | null = segmentId;

    while (currentId) {
      const segment: Segment | null = await this.prisma.segment.findFirst({
        where: { tenantId, id: currentId },
      });

      if (!segment || !segment.parentSegmentId) {
        break;
      }

      const parent: Segment | null = await this.prisma.segment.findFirst({
        where: { tenantId, id: segment.parentSegmentId },
      });

      if (parent) {
        ancestors.push(parent);
        currentId = parent.parentSegmentId;
      } else {
        break;
      }
    }

    return ancestors;
  }

  /**
   * 子孫セグメントID取得（階層フィルタリング用）
   * hierarchy_path の LIKE prefix 検索を使用
   */
  async findDescendantIds(tenantId: string, segmentId: string): Promise<string[]> {
    const segment = await this.findById({ tenantId, segmentId });
    if (!segment || !segment.hierarchyPath) {
      return [segmentId];
    }

    const descendants = await this.prisma.segment.findMany({
      where: {
        tenantId,
        hierarchyPath: { startsWith: segment.hierarchyPath },
        id: { not: segmentId },
        isActive: true,
      },
      select: { id: true },
    });

    return [segmentId, ...descendants.map((d) => d.id)];
  }
}
