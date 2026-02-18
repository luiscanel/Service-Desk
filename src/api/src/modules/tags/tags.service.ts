import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private repo: Repository<Tag>,
  ) {}

  findAll(entity?: string) {
    const where = entity ? { entity } : {};
    return this.repo.find({ where });
  }

  findOne(id: string) {
    return this.repo.findOneBy({ id });
  }

  create(data: Partial<Tag>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<Tag>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.repo.delete(id);
    return { success: true };
  }
}
