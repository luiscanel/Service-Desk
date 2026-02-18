import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateScheduledReportDto, UpdateScheduledReportDto } from './dto/report.dto';

@ApiTags('Reports')
@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('scheduled')
  @ApiOperation({ summary: 'Get all scheduled reports' })
  async findAll() {
    return this.reportsService.findAll();
  }

  @Post('scheduled')
  @ApiOperation({ summary: 'Create scheduled report' })
  async create(@Body() dto: CreateScheduledReportDto) {
    return this.reportsService.create(dto);
  }

  @Put('scheduled/:id')
  @ApiOperation({ summary: 'Update scheduled report' })
  async update(@Param('id') id: string, @Body() dto: UpdateScheduledReportDto) {
    return this.reportsService.update(id, dto);
  }

  @Delete('scheduled/:id')
  @ApiOperation({ summary: 'Delete scheduled report' })
  async delete(@Param('id') id: string) {
    await this.reportsService.delete(id);
    return { success: true };
  }

  @Post('scheduled/:id/run')
  @ApiOperation({ summary: 'Run scheduled report now' })
  async runNow(@Param('id') id: string) {
    const result = await this.reportsService.runReport(id);
    return { success: result };
  }

  @Get('generate/:type')
  @ApiOperation({ summary: 'Generate report on demand' })
  async generateReport(@Param('type') type: string) {
    return this.reportsService.generateReport(type);
  }
}
