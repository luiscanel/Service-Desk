import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeCategoriesController } from './knowledge-categories.controller';
import { KnowledgeCategoriesService } from './knowledge-categories.service';
import { KnowledgeCategory } from './entities/knowledge-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeCategory])],
  controllers: [KnowledgeCategoriesController],
  providers: [KnowledgeCategoriesService],
  exports: [KnowledgeCategoriesService],
})
export class KnowledgeCategoriesModule {}
