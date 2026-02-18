import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SlaService } from './sla.service';

@ApiTags('SLA')
@Controller('api/sla')
export class SlaController {
  constructor(private readonly slaService: SlaService) {}

  @Get('policies')
  @ApiOperation({ summary: 'Get all SLA policies' })
  async getPolicies() {
    return this.slaService.getPolicies();
  }

  @Get('policies/:id')
  @ApiOperation({ summary: 'Get SLA policy by id' })
  async getPolicyById(@Param('id') id: string) {
    return this.slaService.getPolicyById(id);
  }

  @Post('policies')
  @ApiOperation({ summary: 'Create SLA policy' })
  async createPolicy(@Body() data: {
    name: string;
    priority: string;
    responseTimeHours: number;
    resolutionTimeHours: number;
    description?: string;
    escalationEmail?: string;
  }) {
    return this.slaService.createPolicy(data);
  }

  @Put('policies/:id')
  @ApiOperation({ summary: 'Update SLA policy' })
  async updatePolicy(@Param('id') id: string, @Body() data: Partial<any>) {
    return this.slaService.updatePolicy(id, data);
  }

  @Delete('policies/:id')
  @ApiOperation({ summary: 'Delete SLA policy' })
  async deletePolicy(@Param('id') id: string) {
    await this.slaService.deletePolicy(id);
    return { success: true };
  }
}
