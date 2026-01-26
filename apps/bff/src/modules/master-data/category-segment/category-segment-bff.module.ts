import { Module } from '@nestjs/common';
import { CategorySegmentBffController } from './controller/category-segment.controller';
import { CategorySegmentBffService } from './service/category-segment.service';
import { CategorySegmentDomainApiClient } from './clients/domain-api.client';
import { CategorySegmentMapper } from './mappers/category-segment.mapper';

/**
 * Category-Segment BFF Module
 *
 * カテゴリ・セグメントマスタ BFF モジュール
 */
@Module({
  controllers: [CategorySegmentBffController],
  providers: [
    CategorySegmentBffService,
    CategorySegmentDomainApiClient,
    CategorySegmentMapper,
  ],
  exports: [CategorySegmentBffService],
})
export class CategorySegmentBffModule {}
