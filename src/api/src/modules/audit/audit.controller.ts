import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuditService } from './audit.service';

@ApiTags('Audit')
@Controller('api/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs' })
  async findAll(
    @Query('entity') entity?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.findAll({
      entity,
      userId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get audit statistics' })
  async getStats(@Query('days') days?: number) {
    return this.auditService.getStats(days || 30);
  }

  @Get('entity/:entity/:id')
  @ApiOperation({ summary: 'Get audit logs for entity' })
  async getByEntity(@Param('entity') entity: string, @Param('id') id: string) {
    return this.auditService.getByEntityId(entity, id);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export audit logs to CSV' })
  async export(@Query('entity') entity?: string) {
    const csv = await this.auditService.exportToCsv({ entity });
    return { csv };
  }
}
