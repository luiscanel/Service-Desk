import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Public')
@Controller('api/public')
export class PublicController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('tickets')
  @ApiOperation({ summary: 'Crear ticket sin login (Portal público)' })
  async createPublicTicket(@Body() dto: CreateTicketDto) {
    // Crear ticket sin usuario autenticado
    const ticket = await this.ticketsService.createPublic(dto);
    return {
      success: true,
      ticketNumber: ticket.ticketNumber,
      message: 'Ticket creado exitosamente. Use este número para dar seguimiento.',
    };
  }

  @Get('tickets/:ticketNumber')
  @ApiOperation({ summary: 'Consultar ticket por número (Portal público)' })
  async getPublicTicket(@Param('ticketNumber') ticketNumber: string) {
    const ticket = await this.ticketsService.findByTicketNumber(ticketNumber);
    if (!ticket) {
      return { success: false, message: 'Ticket no encontrado' };
    }
    return {
      success: true,
      ticket: {
        ticketNumber: ticket.ticketNumber,
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      },
    };
  }

  @Post('tickets/:ticketNumber/comment')
  @ApiOperation({ summary: 'Agregar comentario a ticket (Portal público)' })
  async addPublicComment(
    @Param('ticketNumber') ticketNumber: string,
    @Body() body: { comment: string; email: string },
  ) {
    const result = await this.ticketsService.addPublicComment(
      ticketNumber,
      body.comment,
      body.email,
    );
    return result;
  }
}
