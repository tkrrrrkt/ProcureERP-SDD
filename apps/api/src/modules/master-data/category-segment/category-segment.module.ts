/**
 * CategorySegment Module
 *
 * カテゴリ・セグメントマスタの Domain API モジュール
 */

import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';

// Controllers
import { CategoryAxisController } from './controllers/category-axis.controller';
import { SegmentController } from './controllers/segment.controller';
import { SegmentAssignmentController } from './controllers/segment-assignment.controller';

// Services
import { CategoryAxisService } from './services/category-axis.service';
import { SegmentService } from './services/segment.service';
import { SegmentAssignmentService } from './services/segment-assignment.service';

// Repositories
import { CategoryAxisRepository } from './repositories/category-axis.repository';
import { SegmentRepository } from './repositories/segment.repository';
import { SegmentAssignmentRepository } from './repositories/segment-assignment.repository';

// Common
import { EntityValidatorService } from '../../../common/validators/entity-validator.service';

// 依存モジュール（EntityValidatorService が必要とする Repository）
import { BusinessPartnerModule } from '../business-partner/business-partner.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => BusinessPartnerModule), // EntityValidatorService の依存
  ],
  controllers: [CategoryAxisController, SegmentController, SegmentAssignmentController],
  providers: [
    // Services
    CategoryAxisService,
    SegmentService,
    SegmentAssignmentService,
    // Repositories
    CategoryAxisRepository,
    SegmentRepository,
    SegmentAssignmentRepository,
    // Common
    EntityValidatorService,
  ],
  exports: [
    CategoryAxisService,
    SegmentService,
    SegmentAssignmentService,
    CategoryAxisRepository,
    SegmentRepository,
    SegmentAssignmentRepository,
  ],
})
export class CategorySegmentModule {}
