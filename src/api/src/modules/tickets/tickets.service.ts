import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { EmailService } from '../email/email.service';
import { SlaService } from '../sla/sla.service';
import { AutoAssignmentService } from '../auto-assignment/auto-assignment.service';
import { EMAIL_TEMPLATES } from '../../common/constants';
import { CreateTicketDto, UpdateTicketDto, SurveyResponseDto } from './dto/ticket.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket) 
    private readonly ticketRepository: Repository<Ticket>,
    private readonly emailService: EmailService,
    private readonly slaService: SlaService,
    private readonly autoAssignmentService: AutoAssignmentService,
  ) {}

  async findAll(): Promise<Ticket[]> {
    return this.ticketRepository.find();
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`Ticket ${id} no encontrado`);
    }
    return ticket;
  }

  async create(dto: CreateTicketDto): Promise<Ticket> {
    // Generate ticket number
    const count = await this.ticketRepository.count();
    const year = new Date().getFullYear();
    const ticketNumber = `TKT-${year}-${String(count + 1).padStart(4, '0')}`;
    
    const ticket = this.ticketRepository.create({
      ...dto,
      ticketNumber,
    });
    
    // Calculate SLA deadline based on priority
    const slaDeadline = await this.slaService.applySlaToTicket(ticket);
    if (slaDeadline) {
      ticket.slaDeadline = slaDeadline;
    }
    
    const savedTicket = await this.ticketRepository.save(ticket);
    
    // Auto-assign ticket if no agent is assigned
    if (!savedTicket.assignedToId) {
      const assignedAgent = await this.autoAssignmentService.assignTicket(savedTicket);
      if (assignedAgent) {
        savedTicket.assignedToId = assignedAgent.id;
        savedTicket.status = TicketStatus.ASSIGNED;
        savedTicket.assignedAt = new Date();
        await this.ticketRepository.save(savedTicket);
      }
    }
    
    return savedTicket;
  }

  async update(id: string, dto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findOne(id);
    const updates = this.calculateTimestampTransitions(ticket, dto);
    
    await this.ticketRepository.update(id, { ...dto, ...updates });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.ticketRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Ticket ${id} no encontrado`);
    }
  }

  // === Calcular timestamps según transición de estado ===
  private calculateTimestampTransitions(ticket: Ticket, updates: Partial<Ticket>): Partial<Ticket> {
    const result: Partial<Ticket> = {};

    // NEW → ASSIGNED
    if (updates.status && updates.status !== TicketStatus.NEW && !ticket.assignedAt) {
      result.assignedAt = new Date();
    }

    // ASSIGNED → IN_PROGRESS
    if (updates.status === TicketStatus.IN_PROGRESS && !ticket.attendingAt) {
      result.attendingAt = new Date();
    }

    // IN_PROGRESS → RESOLVED
    if (updates.status === TicketStatus.RESOLVED && !ticket.resolvedAt) {
      result.resolvedAt = new Date();
    }

    // RESOLVED → CLOSED
    if (updates.status === TicketStatus.CLOSED && !ticket.closedAt) {
      result.closedAt = new Date();
    }

    return result;
  }

  // === Cerrar ticket y enviar encuesta ===
  async closeTicket(id: string): Promise<Ticket> {
    const ticket = await this.findOne(id);

    await this.ticketRepository.update(id, {
      status: TicketStatus.CLOSED,
      closedAt: new Date(),
    });

    const updatedTicket = await this.findOne(id);

    // Enviar encuesta si no se ha enviado
    if (ticket.requesterEmail && !ticket.surveySent) {
      await this.sendSatisfactionSurvey(ticket);
    }

    return updatedTicket;
  }

  // === Enviar encuesta de satisfacción ===
  async sendSatisfactionSurvey(ticket: Ticket): Promise<void> {
    await this.ticketRepository.update(ticket.id, {
      surveySent: true,
      surveySentAt: new Date(),
    });

    await this.emailService.sendEmail({
      to: ticket.requesterEmail,
      subject: `¿Cómo fue tu experiencia? - Ticket ${ticket.ticketNumber}`,
      html: EMAIL_TEMPLATES.satisfactionSurvey({
        ticketNumber: ticket.ticketNumber,
        title: ticket.title,
        category: ticket.category,
      }),
    });
  }

  // === Responder encuesta ===
  async submitSurvey(id: string, dto: SurveyResponseDto): Promise<Ticket> {
    await this.ticketRepository.update(id, {
      ...dto,
      surveyAnsweredAt: new Date(),
    });

    return this.findOne(id);
  }

  // === Métricas de satisfacción ===
  async getSatisfactionMetrics(): Promise<{
    totalSent: number;
    totalAnswered: number;
    responseRate: string;
    notAnswered: number;
    averages: { satisfaction: string; technical: string; responseTime: string; overall: string };
    distribution: Array<{ rating: number; count: number }>;
  }> {
    const ticketsWithSurvey = await this.ticketRepository.find({
      where: { surveySent: true },
    });

    const answered = ticketsWithSurvey.filter(t => t.surveyAnsweredAt !== null);
    const notAnswered = ticketsWithSurvey.filter(t => !t.surveyAnsweredAt);

    // Calcular promedio
    const avg = (arr: Ticket[], field: keyof Ticket): number => {
      if (arr.length === 0) return 0;
      const sum = arr.reduce((acc, t) => acc + (Number(t[field]) || 0), 0);
      return sum / arr.length;
    };

    const avgSatisfaction = avg(answered, 'satisfactionRating');
    const avgTechnical = avg(answered, 'technicalRating');
    const avgResponseTime = avg(answered, 'responseTimeRating');

    // Distribución
    const distribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: answered.filter(t => t.satisfactionRating === rating).length,
    }));

    return {
      totalSent: ticketsWithSurvey.length,
      totalAnswered: answered.length,
      responseRate: ticketsWithSurvey.length > 0
        ? ((answered.length / ticketsWithSurvey.length) * 100).toFixed(1)
        : '0',
      notAnswered: notAnswered.length,
      averages: {
        satisfaction: avgSatisfaction.toFixed(1),
        technical: avgTechnical.toFixed(1),
        responseTime: avgResponseTime.toFixed(1),
        overall: ((avgSatisfaction + avgTechnical + avgResponseTime) / 3).toFixed(1),
      },
      distribution,
    };
  }

  // === Flujo de aprobaciones ===
  async requestApproval(id: string, approverEmail: string, requestedBy: string): Promise<Ticket> {
    await this.ticketRepository.update(id, {
      approvalRequired: true,
      approved: false,
      approverEmail,
      approvalRequestedBy: requestedBy,
      approvalRequestedAt: new Date(),
    });

    const ticket = await this.findOne(id);
    
    await this.emailService.sendEmail({
      to: approverEmail,
      subject: `📋 Solicitud de Aprobación - Ticket ${ticket.ticketNumber}`,
      html: EMAIL_TEMPLATES.approvalRequest(
        { ticketNumber: ticket.ticketNumber, title: ticket.title, description: ticket.description },
        requestedBy,
      ),
    });

    return ticket;
  }

  async respondToApproval(id: string, approved: boolean, comment?: string): Promise<Ticket> {
    await this.ticketRepository.update(id, {
      approved,
      approvalComment: comment,
      approvalRespondedAt: new Date(),
    });

    const ticket = await this.findOne(id);

    if (ticket.approvalRequestedBy) {
      await this.emailService.sendEmail({
        to: ticket.approvalRequestedBy,
        subject: `Tu solicitud de aprobación ha sido ${approved ? 'aprobada' : 'rechazada'}`,
        html: EMAIL_TEMPLATES.approvalResponse(ticket.ticketNumber, approved, comment),
      });
    }

    return ticket;
  }

  async getApprovalsStats(): Promise<{ total: number; pending: number; approved: number; rejected: number }> {
    const all = await this.ticketRepository.find({ 
      where: { approvalRequired: true },
    });
    
    const pending = all.filter(t => !t.approved && t.approvalRespondedAt === null).length;
    const approved = all.filter(t => t.approved).length;
    const rejected = all.filter(t => t.approvalRequired && t.approved === false && t.approvalRespondedAt !== null).length;

    return { total: all.length, pending, approved, rejected };
  }

  // === Calcular tiempos para SLA ===
  calculateSlaTimes(ticket: Ticket): { totalTime: number; responseTime: number; resolutionTime: number; waitTime: number } {
    const defaultResult = { totalTime: 0, responseTime: 0, resolutionTime: 0, waitTime: 0 };

    if (!ticket.assignedAt) return defaultResult;

    const toMinutes = (date: Date): number => Math.floor(date.getTime() / 60000);
    const now = toMinutes(ticket.closedAt || ticket.resolvedAt || new Date());
    const assigned = toMinutes(new Date(ticket.assignedAt));

    const result = { ...defaultResult };
    result.totalTime = now - assigned;

    // Tiempo de espera (asignado → atendiendo)
    if (ticket.attendingAt) {
      const attending = toMinutes(new Date(ticket.attendingAt));
      result.waitTime = attending - assigned;
      result.responseTime = result.waitTime;
    }

    // Tiempo de resolución (atendiendo → resuelto)
    if (ticket.attendingAt && ticket.resolvedAt) {
      const resolved = toMinutes(new Date(ticket.resolvedAt));
      const attending = toMinutes(new Date(ticket.attendingAt));
      result.resolutionTime = resolved - attending;
    }

    return result;
  }
}
