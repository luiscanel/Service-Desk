import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
  ) {}

  async log(data: {
    action: string;
    entity: string;
    entityId?: string;
    userId?: string;
    userEmail?: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditLog> {
    const log = this.auditRepo.create(data);
    return this.auditRepo.save(log);
  }

  async findAll(filters?: {
    entity?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  }): Promise<AuditLog[]> {
    const query: any = {};

    if (filters?.entity) query.entity = filters.entity;
    if (filters?.userId) query.userId = filters.userId;
    if (filters?.startDate && filters?.endDate) {
      query.createdAt = Between(filters.startDate, filters.endDate);
    }

    let qb = this.auditRepo.find({
      where: query,
      order: { createdAt: 'DESC' },
      take: 500,
    });

    return qb;
  }

  async getByEntityId(entity: string, entityId: string): Promise<AuditLog[]> {
    return this.auditRepo.find({
      where: { entity, entityId },
      order: { createdAt: 'DESC' },
    });
  }

  async getStats(days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.auditRepo.find({
      where: { createdAt: Between(startDate, new Date()) },
      order: { createdAt: 'DESC' },
    });

    const byAction = logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {});

    const byEntity = logs.reduce((acc, log) => {
      acc[log.entity] = (acc[log.entity] || 0) + 1;
      return acc;
    }, {});

    const byUser = logs.reduce((acc, log) => {
      if (log.userEmail) {
        acc[log.userEmail] = (acc[log.userEmail] || 0) + 1;
      }
      return acc;
    }, {});

    return { total: logs.length, byAction, byEntity, byUser };
  }

  async exportToCsv(filters?: any): Promise<string> {
    const logs = await this.findAll(filters);
    const headers = ['Fecha', 'Acción', 'Entidad', 'Usuario', 'IP'];
    const rows = logs.map(log => [
      log.createdAt.toISOString(),
      log.action,
      log.entity,
      log.userEmail || 'System',
      log.ipAddress || '',
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}
