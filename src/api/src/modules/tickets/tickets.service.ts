import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket) 
    private ticketRepository: Repository<Ticket>,
    private emailService: EmailService,
  ) {}

  async findAll(): Promise<Ticket[]> {
    return this.ticketRepository.find();
  }

  async findOne(id: string): Promise<Ticket> {
    return this.ticketRepository.findOne({ where: { id } });
  }

  async create(data: Partial<Ticket>): Promise<Ticket> {
    const ticket = this.ticketRepository.create(data);
    return this.ticketRepository.save(ticket);
  }

  async update(id: string, data: Partial<Ticket>): Promise<Ticket> {
    await this.ticketRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.ticketRepository.delete(id);
  }

  // === Cerrar ticket y enviar encuesta ===
  async closeTicket(id: string): Promise<Ticket> {
    const ticket = await this.findOne(id);
    if (!ticket) return null;

    // Marcar como cerrado
    await this.ticketRepository.update(id, {
      status: TicketStatus.CLOSED,
      closedAt: new Date(),
    } as any);

    const updatedTicket = await this.findOne(id);

    // Enviar encuesta de satisfacción
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
    } as any);

    await this.emailService.sendEmail({
      to: ticket.requesterEmail,
      subject: `¿Cómo fue tu experiencia? - Ticket ${ticket.ticketNumber}`,
      html: `
        <div style="font-family: Arial, max-width: 600px;">
          <h2>¡Gracias por contactarnos!</h2>
          <p>Tu ticket <strong>${ticket.ticketNumber}</strong> ha sido cerrado.</p>
          <p>Nos gustaría saber tu opinión sobre el servicio recibido.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Ticket: ${ticket.ticketNumber}</h3>
            <p><strong>Título:</strong> ${ticket.title}</p>
            <p><strong>Categoría:</strong> ${ticket.category || 'Sin categoría'}</p>
          </div>

          <h3>Por favor, evalúa tu experiencia:</h3>
          
          <div style="margin: 20px 0;">
            <p><strong>1. ¿Qué tan satisfecho estás con la solución?</strong></p>
            <p>Del 1 (muy insatisfecho) al 5 (muy satisfecho)</p>
          </div>

          <div style="margin: 20px 0;">
            <p><strong>2. ¿Qué tan bien resolvió el agente tu problema?</strong></p>
            <p>Del 1 al 5</p>
          </div>

          <div style="margin: 20px 0;">
            <p><strong>3. ¿Qué tan satisfecho estás con el tiempo de respuesta?</strong></p>
            <p>Del 1 al 5</p>
          </div>

          <p>Responde a este email con tus respuestas del 1 al 5.</p>
          <p>También puedes escribirnos tus comentarios adicionales.</p>
        </div>
      `,
    });
  }

  // === Responder encuesta ===
  async submitSurvey(id: string, data: {
    satisfactionRating?: number;
    technicalRating?: number;
    responseTimeRating?: number;
    surveyComment?: string;
  }): Promise<Ticket> {
    await this.ticketRepository.update(id, {
      ...data,
      surveyAnsweredAt: new Date(),
    } as any);

    return this.findOne(id);
  }

  // === Métricas de satisfacción ===
  async getSatisfactionMetrics(): Promise<any> {
    const ticketsWithSurvey = await this.ticketRepository.find({
      where: { surveySent: true },
    });

    const answered = ticketsWithSurvey.filter(t => t.surveyAnsweredAt !== null);
    const notAnswered = ticketsWithSurvey.filter(t => !t.surveyAnsweredAt);

    // Calcular promedios
    const avgSatisfaction = answered.length > 0
      ? answered.reduce((sum, t) => sum + (t.satisfactionRating || 0), 0) / answered.length
      : 0;

    const avgTechnical = answered.length > 0
      ? answered.reduce((sum, t) => sum + (t.technicalRating || 0), 0) / answered.length
      : 0;

    const avgResponseTime = answered.length > 0
      ? answered.reduce((sum, t) => sum + (t.responseTimeRating || 0), 0) / answered.length
      : 0;

    // Distribución de ratings
    const distribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: answered.filter(t => t.satisfactionRating === rating).length,
    }));

    return {
      totalSent: ticketsWithSurvey.length,
      totalAnswered: answered.length,
      responseRate: ticketsWithSurvey.length > 0 
        ? ((answered.length / ticketsWithSurvey.length) * 100).toFixed(1) 
        : 0,
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
    } as any);

    const ticket = await this.findOne(id);
    
    // Enviar email al aprobador
    await this.emailService.sendEmail({
      to: approverEmail,
      subject: `📋 Solicitud de Aprobación - Ticket ${ticket.ticketNumber}`,
      html: `
        <div style="font-family: Arial, max-width: 600px;">
          <h2>Solicitud de Aprobación</h2>
          <p>Se ha solicitado tu aprobación para el ticket:</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Ticket:</strong> ${ticket.ticketNumber}</p>
            <p><strong>Título:</strong> ${ticket.title}</p>
            <p><strong>Solicitado por:</strong> ${requestedBy}</p>
            <p><strong>Descripción:</strong> ${ticket.description}</p>
          </div>
          <p>Para aprobar o rechazar, responde a este email o accede al sistema.</p>
        </div>
      `,
    });

    return ticket;
  }

  async respondToApproval(id: string, approved: boolean, comment?: string): Promise<Ticket> {
    await this.ticketRepository.update(id, {
      approved,
      approvalComment: comment,
      approvalRespondedAt: new Date(),
    } as any);

    const ticket = await this.findOne(id);

    // Notificar al solicitante
    if (ticket.approvalRequestedBy) {
      await this.emailService.sendEmail({
        to: ticket.approvalRequestedBy,
        subject: `Tu solicitud de aprobación ha sido ${approved ? 'aprobada' : 'rechazada'}`,
        html: `
          <div style="font-family: Arial, max-width: 600px;">
            <h2>${approved ? '✅ Aprobado' : '❌ Rechazado'}</h2>
            <p>Tu solicitud de aprobación para el ticket ${ticket.ticketNumber} ha sido ${approved ? 'aprobada' : 'rechazada'}.</p>
            ${comment ? `<p><strong>Comentario:</strong> ${comment}</p>` : ''}
          </div>
        `,
      });
    }

    return ticket;
  }

  async getApprovalsStats(): Promise<any> {
    const all = await this.ticketRepository.find({ 
      where: { approvalRequired: true } 
    });
    
    const pending = all.filter(t => !t.approved && t.approvalRespondedAt === null).length;
    const approved = all.filter(t => t.approved).length;
    const rejected = all.filter(t => t.approvalRequired && t.approved === false && t.approvalRespondedAt !== null).length;

    return { total: all.length, pending, approved, rejected };
  }
}
