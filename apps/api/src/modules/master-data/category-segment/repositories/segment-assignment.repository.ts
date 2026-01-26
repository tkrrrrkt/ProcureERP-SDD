/**
 * SegmentAssignment Repository
 *
 * DBアクセス層（tenant_id double-guard）
 * - 1軸1値制約のUpsert対応
 * - エンティティ別・セグメント別の割当検索
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, SegmentAssignment, TargetEntityKind } from '@prisma/client';

export type SegmentAssignmentWithRelations = SegmentAssignment & {
  categoryAxis?: {
    id: string;
    axisName: string;
  };
  segment?: {
    id: string;
    segmentCode: string;
    segmentName: string;
  };
};

@Injectable()
export class SegmentAssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * IDによる割当取得
   */
  async findById(params: {
    tenantId: string;
    assignmentId: string;
  }): Promise<SegmentAssignment | null> {
    const { tenantId, assignmentId } = params;

    return this.prisma.segmentAssignment.findFirst({
      where: {
        tenantId,
        id: assignmentId,
      },
    });
  }

  /**
   * エンティティ×カテゴリ軸による割当検索（1軸1値 Upsert用）
   */
  async findByEntityAndAxis(params: {
    tenantId: string;
    entityKind: TargetEntityKind;
    entityId: string;
    categoryAxisId: string;
  }): Promise<SegmentAssignment | null> {
    const { tenantId, entityKind, entityId, categoryAxisId } = params;

    return this.prisma.segmentAssignment.findFirst({
      where: {
        tenantId,
        entityKind,
        entityId,
        categoryAxisId,
      },
    });
  }

  /**
   * エンティティに対する全割当を取得
   */
  async listByEntity(params: {
    tenantId: string;
    entityKind: TargetEntityKind;
    entityId: string;
  }): Promise<SegmentAssignmentWithRelations[]> {
    const { tenantId, entityKind, entityId } = params;

    return this.prisma.segmentAssignment.findMany({
      where: {
        tenantId,
        entityKind,
        entityId,
        isActive: true,
      },
      include: {
        categoryAxis: {
          select: {
            id: true,
            axisName: true,
          },
        },
        segment: {
          select: {
            id: true,
            segmentCode: true,
            segmentName: true,
          },
        },
      },
    });
  }

  /**
   * セグメントに対する全割当を取得
   */
  async listBySegment(params: {
    tenantId: string;
    segmentId: string;
    offset: number;
    limit: number;
  }): Promise<{ items: SegmentAssignment[]; total: number }> {
    const { tenantId, segmentId, offset, limit } = params;

    const where: Prisma.SegmentAssignmentWhereInput = {
      tenantId,
      segmentId,
      isActive: true,
    };

    const [items, total] = await Promise.all([
      this.prisma.segmentAssignment.findMany({
        where,
        skip: offset,
        take: limit,
      }),
      this.prisma.segmentAssignment.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * セグメントに対する全割当を取得（子孫セグメント含む）
   */
  async listBySegmentWithDescendants(params: {
    tenantId: string;
    segmentIds: string[];
    offset: number;
    limit: number;
  }): Promise<{ items: SegmentAssignment[]; total: number }> {
    const { tenantId, segmentIds, offset, limit } = params;

    const where: Prisma.SegmentAssignmentWhereInput = {
      tenantId,
      segmentId: { in: segmentIds },
      isActive: true,
    };

    const [items, total] = await Promise.all([
      this.prisma.segmentAssignment.findMany({
        where,
        skip: offset,
        take: limit,
      }),
      this.prisma.segmentAssignment.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * 割当作成
   */
  async create(params: {
    tenantId: string;
    entityKind: TargetEntityKind;
    entityId: string;
    categoryAxisId: string;
    segmentId: string;
    createdByLoginAccountId?: string;
  }): Promise<SegmentAssignment> {
    const {
      tenantId,
      entityKind,
      entityId,
      categoryAxisId,
      segmentId,
      createdByLoginAccountId,
    } = params;

    return this.prisma.segmentAssignment.create({
      data: {
        tenantId,
        entityKind,
        entityId,
        categoryAxisId,
        segmentId,
        createdByLoginAccountId,
        updatedByLoginAccountId: createdByLoginAccountId,
      },
    });
  }

  /**
   * 割当更新（セグメント変更）
   */
  async update(params: {
    tenantId: string;
    assignmentId: string;
    version: number;
    segmentId: string;
    updatedByLoginAccountId?: string;
  }): Promise<SegmentAssignment | null> {
    const { tenantId, assignmentId, version, segmentId, updatedByLoginAccountId } = params;

    try {
      return await this.prisma.segmentAssignment.update({
        where: {
          id: assignmentId,
          tenantId,
          version,
        },
        data: {
          segmentId,
          updatedByLoginAccountId,
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
   * 割当論理削除
   */
  async softDelete(params: {
    tenantId: string;
    assignmentId: string;
    version: number;
    updatedByLoginAccountId?: string;
  }): Promise<SegmentAssignment | null> {
    const { tenantId, assignmentId, version, updatedByLoginAccountId } = params;

    try {
      return await this.prisma.segmentAssignment.update({
        where: {
          id: assignmentId,
          tenantId,
          version,
        },
        data: {
          isActive: false,
          updatedByLoginAccountId,
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
}
