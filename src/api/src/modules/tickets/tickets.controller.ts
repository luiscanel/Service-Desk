import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common'
import { TicketsService } from './tickets.service'
import { ApiTags, ApiOperation } from '@nestjs/swagger'

@ApiTags('tickets')  
@Controller('api/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.ticketsService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.ticketsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }

  // === Endpoints de aprobación ===
  @Post(':id/request-approval')
  @ApiOperation({ summary: 'Request approval for ticket' })
  requestApproval(
    @Param('id') id: string,
    @Body() body: { approverEmail: string; requestedBy: string },
  ) {
    return this.ticketsService.requestApproval(id, body.approverEmail, body.requestedBy);
  }

  @Post(':id/respond-approval')
  @ApiOperation({ summary: 'Respond to approval request' })
  respondApproval(
    @Param('id') id: string,
    @Body() body: { approved: boolean; comment?: string },
  ) {
    return this.ticketsService.respondToApproval(id, body.approved, body.comment);
  }

  @Get('stats/approvals')
  @ApiOperation({ summary: 'Get approval statistics' })
  getApprovalsStats() {
    return this.ticketsService.getApprovalsStats();
  }

  // === Endpoints de encuesta ===
  @Post(':id/close')
  @ApiOperation({ summary: 'Close ticket and send survey' })
  closeTicket(@Param('id') id: string) {
    return this.ticketsService.closeTicket(id);
  }

  @Post(':id/send-survey')
  @ApiOperation({ summary: 'Send satisfaction survey manually' })
  sendSurvey(@Param('id') id: string) {
    return this.ticketsService.findOne(id).then(ticket => 
      this.ticketsService.sendSatisfactionSurvey(ticket)
    );
  }

  @Post(':id/survey')
  @ApiOperation({ summary: 'Submit satisfaction survey' })
  submitSurvey(
    @Param('id') id: string,
    @Body() body: { satisfactionRating?: number; technicalRating?: number; responseTimeRating?: number; surveyComment?: string },
  ) {
    return this.ticketsService.submitSurvey(id, body);
  }

  @Get('stats/satisfaction')
  @ApiOperation({ summary: 'Get satisfaction metrics' })
  getSatisfactionMetrics() {
    return this.ticketsService.getSatisfactionMetrics();
  }
}
