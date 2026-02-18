import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApprovalsService } from './approvals.service';

@ApiTags('Approvals')
@Controller('api/approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all approval requests' })
  async findAll() {
    return this.approvalsService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get approval statistics' })
  async getStats() {
    return this.approvalsService.getStats();
  }

  @Get('pending/:email')
  @ApiOperation({ summary: 'Get pending approvals for approver' })
  async findPending(@Param('email') email: string) {
    return this.approvalsService.findPending(email);
  }

  @Get('ticket/:ticketId')
  @ApiOperation({ summary: 'Get approval for ticket' })
  async findByTicket(@Param('ticketId') ticketId: string) {
    return this.approvalsService.findByTicket(ticketId);
  }

  @Post('request')
  @ApiOperation({ summary: 'Request approval for ticket' })
  async requestApproval(@Body() body: { ticketId: string; requestedBy: string; requestedByEmail: string; approverEmail: string }) {
    return this.approvalsService.requestApproval(body.ticketId, body.requestedBy, body.requestedByEmail, body.approverEmail);
  }

  @Post(':id/respond')
  @ApiOperation({ summary: 'Respond to approval request' })
  async respond(
    @Param('id') id: string,
    @Body() body: { approved: boolean; respondedBy: string; comment?: string },
  ) {
    return this.approvalsService.respond(id, body.approved, body.respondedBy, body.comment);
  }
}
