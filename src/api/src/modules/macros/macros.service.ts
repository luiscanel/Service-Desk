import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Macro } from './entities/macro.entity';

@Injectable()
export class MacrosService {
  constructor(
    @InjectRepository(Macro)
    private macrosRepo: Repository<Macro>,
  ) {}

  async findAll(): Promise<Macro[]> {
    return this.macrosRepo.find({ order: { usageCount: 'DESC', name: 'ASC' } });
  }

  async findById(id: string): Promise<Macro> {
    return this.macrosRepo.findOne({ where: { id } });
  }

  async findByCategory(category: string): Promise<Macro[]> {
    return this.macrosRepo.find({ where: { category, isActive: true } });
  }

  async create(data: Partial<Macro>): Promise<Macro> {
    const macro = this.macrosRepo.create(data);
    return this.macrosRepo.save(macro);
  }

  async update(id: string, data: Partial<Macro>): Promise<Macro> {
    await this.macrosRepo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.macrosRepo.delete(id);
  }

  async incrementUsage(id: string): Promise<void> {
    await this.macrosRepo.increment({ id }, 'usageCount', 1);
  }

  async getCategories(): Promise<string[]> {
    const macros = await this.macrosRepo.find({ select: ['category'], where: { isActive: true } });
    const categories = [...new Set(macros.map(m => m.category).filter(Boolean))];
    return categories;
  }
}
