import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Macro } from './entities/macro.entity';
import { CreateMacroDto, UpdateMacroDto } from './dto/macro.dto';

@Injectable()
export class MacrosService {
  constructor(
    @InjectRepository(Macro)
    private readonly macrosRepo: Repository<Macro>,
  ) {}

  async findAll(): Promise<Macro[]> {
    return this.macrosRepo.find({ order: { usageCount: 'DESC', name: 'ASC' } });
  }

  async findById(id: string): Promise<Macro> {
    const macro = await this.macrosRepo.findOne({ where: { id } });
    if (!macro) {
      throw new NotFoundException(`Macro ${id} no encontrado`);
    }
    return macro;
  }

  async findByCategory(category: string): Promise<Macro[]> {
    return this.macrosRepo.find({ where: { category, isActive: true } });
  }

  async create(dto: CreateMacroDto): Promise<Macro> {
    const macro = this.macrosRepo.create(dto);
    return this.macrosRepo.save(macro);
  }

  async update(id: string, dto: UpdateMacroDto): Promise<Macro> {
    await this.findById(id); // Verifica que existe
    await this.macrosRepo.update(id, dto);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const result = await this.macrosRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Macro ${id} no encontrado`);
    }
  }

  async incrementUsage(id: string): Promise<void> {
    await this.macrosRepo.increment({ id }, 'usageCount', 1);
  }

  async getCategories(): Promise<string[]> {
    const macros = await this.macrosRepo.find({ 
      select: ['category'], 
      where: { isActive: true } 
    });
    return [...new Set(macros.map(m => m.category).filter(Boolean))];
  }
}
