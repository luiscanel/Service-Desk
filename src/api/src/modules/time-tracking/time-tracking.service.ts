import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeEntry } from './entities/time-entry.entity';

@Injectable()
export class TimeTrackingService {
  constructor(
    @InjectRepository(TimeEntry)
    private repo: Repository<TimeEntry>,
  ) {}

  findAll(ticketId?: string) {
    const where = ticketId ? { ticketId } : {};
    return this.repo.find({ where, relations: ['user'], order: { createdAt: 'DESC' } });
  }

  findOne(id: string) {
    return this.repo.findOneBy({ id });
  }

  create(data: Partial<TimeEntry>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<TimeEntry>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.repo.delete(id);
    return { success: true };
  }

  getStats(userId?: string) {
    const qb = this.repo.createQueryBuilder('t');
    if (userId) qb.where('t.userId = :userId', { userId });
    return qb.select('SUM(t.minutes)', 'total')
      .addSelect('t.userId', 'userId')
      .groupBy('t.userId')
      .getRawMany();
  }
}
