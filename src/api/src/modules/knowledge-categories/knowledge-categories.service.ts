import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeCategory } from './entities/knowledge-category.entity';

@Injectable()
export class KnowledgeCategoriesService {
  constructor(
    @InjectRepository(KnowledgeCategory)
    private repo: Repository<KnowledgeCategory>,
  ) {}

  findAll() {
    return this.repo.find({ where: { isActive: true }, order: { order: 'ASC' } });
  }

  findOne(id: string) {
    return this.repo.findOneBy({ id });
  }

  create(data: Partial<KnowledgeCategory>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<KnowledgeCategory>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.repo.update(id, { isActive: false });
    return { success: true };
  }
}
