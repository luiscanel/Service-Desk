import { 
  Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus 
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { 
  CreateTicketDto, UpdateTicketDto, SurveyResponseDto, 
  ApprovalRequestDto, ApprovalResponseDto 
} from './dto/ticket.dto';

@ApiTags('tickets')  
@Controller('api/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los tickets' })
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener ticket por ID' })
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo ticket' })
  create(@Body() dto: CreateTicketDto) {
    return this.ticketsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar ticket' })
  update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.ticketsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar ticket' })
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }

  // === Endpoints de aprobación ===
  @Post(':id/request-approval')
  @ApiOperation({ summary: 'Solicitar aprobación para ticket' })
  requestApproval(
    @Param('id') id: string,
    @Body() dto: ApprovalRequestDto,
  ) {
    return this.ticketsService.requestApproval(id, dto.approverEmail, dto.requestedBy);
  }

  @Post(':id/respond-approval')
  @ApiOperation({ summary: 'Responder a solicitud de aprobación' })
  respondApproval(
    @Param('id') id: string,
    @Body() dto: ApprovalResponseDto,
  ) {
    return this.ticketsService.respondToApproval(id, dto.approved, dto.comment);
  }

  @Get('stats/approvals')
  @ApiOperation({ summary: 'Obtener estadísticas de aprobaciones' })
  getApprovalsStats() {
    return this.ticketsService.getApprovalsStats();
  }

  // === Endpoints de encuesta ===
  @Post(':id/close')
  @ApiOperation({ summary: 'Cerrar ticket y enviar encuesta' })
  closeTicket(@Param('id') id: string) {
    return this.ticketsService.closeTicket(id);
  }

  @Post(':id/send-survey')
  @ApiOperation({ summary: 'Enviar encuesta de satisfacción manualmente' })
  sendSurvey(@Param('id') id: string) {
    return this.ticketsService.findOne(id).then(ticket => 
      this.ticketsService.sendSatisfactionSurvey(ticket)
    );
  }

  @Post(':id/survey')
  @ApiOperation({ summary: 'Enviar respuesta de encuesta' })
  submitSurvey(
    @Param('id') id: string,
    @Body() dto: SurveyResponseDto,
  ) {
    return this.ticketsService.submitSurvey(id, dto);
  }

  @Get('stats/satisfaction')
  @ApiOperation({ summary: 'Obtener métricas de satisfacción' })
  getSatisfactionMetrics() {
    return this.ticketsService.getSatisfactionMetrics();
  }

  // === Endpoint de tiempos SLA ===
  @Get(':id/sla-times')
  @ApiOperation({ summary: 'Obtener métricas de tiempo SLA' })
  getSlaTimes(@Param('id') id: string) {
    return this.ticketsService.findOne(id).then(ticket => {
      if (!ticket) return { error: 'Ticket no encontrado' };
      return this.ticketsService.calculateSlaTimes(ticket);
    });
  }
}
