import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalRequest } from './entities/approval-request.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class ApprovalsService {
  constructor(
    @InjectRepository(ApprovalRequest)
    private approvalRepo: Repository<ApprovalRequest>,
    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,
    private emailService: EmailService,
  ) {}

  async requestApproval(ticketId: string, requestedBy: string, requestedByEmail: string, approverEmail: string): Promise<ApprovalRequest> {
    const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
    if (!ticket) return null;

    const approval = this.approvalRepo.create({
      ticketId,
      ticketNumber: ticket.ticketNumber,
      requestedBy,
      requestedByEmail,
      approverEmail,
      status: 'pending',
    });
    await this.approvalRepo.save(approval);

    // Send email to approver
    await this.emailService.sendEmail({
      to: approverEmail,
      subject: `📋 Solicitud de Aprobación - Ticket ${ticket.ticketNumber}`,
      html: `
        <div style="font-family: Arial, max-width: 600px;">
          <h2>Solicitud de Aprobación</h2>
          <p>Se ha solicitado tu aprobación para cerrar el ticket:</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Ticket:</strong> ${ticket.ticketNumber}</p>
            <p><strong>Título:</strong> ${ticket.title}</p>
            <p><strong>Solicitado por:</strong> ${requestedByEmail}</p>
          </div>
          <p>Por favor, responde a este email approvesdo o rechazando la solicitud.</p>
        </div>
      `,
    });

    // Mark ticket as requiring approval
    await this.ticketRepo.update(ticketId, { approvalRequired: true } as any);

    return approval;
  }

  async respond(approvalId: string, approved: boolean, respondedBy: string, comment?: string): Promise<ApprovalRequest> {
    const approval = await this.approvalRepo.findOne({ where: { id: approvalId } });
    if (!approval || approval.status !== 'pending') return null;

    approval.status = approved ? 'approved' : 'rejected';
    approval.respondedAt = new Date();
    approval.respondedBy = respondedBy;
    approval.comment = comment;

    await this.approvalRepo.save(approval);

    // Update ticket
    await this.ticketRepo.update(approval.ticketId, { 
      approved,
      approvalRequired: false,
    } as any);

    // Notify requester
    await this.emailService.sendEmail({
      to: approval.requestedByEmail,
      subject: `✅ Tu solicitud de aprobación ha sido ${approved ? 'aprobada' : 'rechazada'}`,
      html: `
        <div style="font-family: Arial, max-width: 600px;">
          <h2>${approved ? '✅ Aprobado' : '❌ Rechazado'}</h2>
          <p>Tu solicitud de aprobación para el ticket ${approval.ticketNumber} ha sido:</p>
          <p><strong>Estado:</strong> ${approval.status}</p>
          ${comment ? `<p><strong>Comentario:</strong> ${comment}</p>` : ''}
        </div>
      `,
    });

    return approval;
  }

  async findAll(): Promise<ApprovalRequest[]> {
    return this.approvalRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findByTicket(ticketId: string): Promise<ApprovalRequest> {
    return this.approvalRepo.findOne({ where: { ticketId } });
  }

  async findPending(approverEmail: string): Promise<ApprovalRequest[]> {
    return this.approvalRepo.find({
      where: { approverEmail, status: 'pending' },
      order: { createdAt: 'DESC' },
    });
  }

  async getStats(): Promise<any> {
    const all = await this.approvalRepo.find();
    const pending = all.filter(a => a.status === 'pending').length;
    const approved = all.filter(a => a.status === 'approved').length;
    const rejected = all.filter(a => a.status === 'rejected').length;

    return {
      total: all.length,
      pending,
      approved,
      rejected,
      approvalRate: all.length > 0 ? ((approved / all.length) * 100).toFixed(1) : 0,
    };
  }
}
