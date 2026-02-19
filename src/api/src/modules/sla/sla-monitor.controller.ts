import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SlaMonitorService } from './sla-monitor.service';

@ApiTags('SLA Monitor')
@Controller('sla-monitor')
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
  getTicketSLA(@Param('ticketId', ParseUUIDPipe) ticketId: string) {
    return this.slaMonitorService.calculateSLAForTicket(ticketId);
  }
}
