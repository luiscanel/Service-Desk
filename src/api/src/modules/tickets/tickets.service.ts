import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
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
