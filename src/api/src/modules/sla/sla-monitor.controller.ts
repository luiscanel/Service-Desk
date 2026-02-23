import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SlaMonitorService } from './sla-monitor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('SLA Monitor')
@ApiBearerAuth()
@Controller('sla-monitor')
@UseGuards(JwtAuthGuard)
export class SlaMonitorController {
  constructor(private readonly slaMonitorService: SlaMonitorService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get SLA compliance statistics' })
  getStats() {
    return this.slaMonitorService.getSLAStats();
  }

  @Get('near-breach')
  @ApiOperation({ summary: 'Get tickets near SLA breach (within 2 hours)' })
  getNearBreach() {
    return this.slaMonitorService.getTicketsNearBreach();
  }

  @Get('breached')
  @ApiOperation({ summary: 'Get breached tickets' })
  getBreached() {
    return this.slaMonitorService.getBreachedTickets();
  }

  @Get('ticket/:ticketId')
  @ApiOperation({ summary: 'Calculate SLA for a specific ticket' })
  getTicketSLA(@Param('ticketId') ticketId: string) {
    return this.slaMonitorService.calculateSLAForTicket(ticketId);
  }
}
