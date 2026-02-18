import { Controller, Get, Post, Body, Put, Param, UseGuards, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PortalService } from './portal.service';

@ApiTags('Portal')
@Controller('api/portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  // Client Management (Admin)
  @Get('clients')
  @ApiOperation({ summary: 'Get all portal clients' })
  async getClients() {
    return this.portalService.getClients();
  }

  @Post('clients')
  @ApiOperation({ summary: 'Create portal client' })
  async createClient(@Body() data: { email: string; name: string; company?: string; phone?: string }) {
    return this.portalService.createClient(data);
  }

  @Put('clients/:id')
  @ApiOperation({ summary: 'Update portal client' })
  async updateClient(@Param('id') id: string, @Body() data: any) {
    return this.portalService.updateClient(id, data);
  }

  @Post('clients/:id/regenerate-token')
  @ApiOperation({ summary: 'Regenerate client access token' })
  async regenerateToken(@Param('id') id: string) {
    const token = await this.portalService.regenerateToken(id);
    return { accessToken: token };
  }

  @Post('clients/:id/delete')
  @ApiOperation({ summary: 'Deactivate portal client' })
  async deleteClient(@Param('id') id: string) {
    await this.portalService.deleteClient(id);
    return { success: true };
  }

  // Client Portal API (Public with token)
  @Post('tickets')
  @ApiOperation({ summary: 'Create ticket from portal' })
  async createTicket(
    @Body() data: { email: string; title: string; description: string; category: string; priority: string },
  ) {
    return this.portalService.createTicketFromPortal({
      clientEmail: data.email,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
    });
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Get client tickets' })
  async getTickets(@Headers('x-client-email') email: string) {
    if (!email) throw new UnauthorizedException('Client email required');
    return this.portalService.getClientTickets(email);
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Get ticket detail' })
  async getTicket(@Param('id') id: string, @Headers('x-client-email') email: string) {
    if (!email) throw new UnauthorizedException('Client email required');
    return this.portalService.getTicketByIdForPortal(id, email);
  }

  @Post('tickets/:id/comments')
  @ApiOperation({ summary: 'Add comment to ticket' })
  async addComment(
    @Param('id') id: string,
    @Headers('x-client-email') email: string,
    @Body() body: { comment: string },
  ) {
    if (!email) throw new UnauthorizedException('Client email required');
    return this.portalService.addCommentToTicket(id, email, body.comment);
  }

  @Post('tickets/:id/rate')
  @ApiOperation({ summary: 'Rate ticket' })
  async rateTicket(
    @Param('id') id: string,
    @Headers('x-client-email') email: string,
    @Body() body: { rating: number; feedback?: string },
  ) {
    if (!email) throw new UnauthorizedException('Client email required');
    return this.portalService.rateTicket(id, email, body.rating, body.feedback);
  }
}
