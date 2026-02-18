import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortalClient } from './entities/portal-client.entity';
import { Ticket, TicketStatus, TicketPriority } from '../tickets/entities/ticket.entity';
import { EmailService } from '../email/email.service';
import { randomUUID } from 'crypto';

@Injectable()
export class PortalService {
  constructor(
    @InjectRepository(PortalClient)
    private portalRepo: Repository<PortalClient>,
    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,
    private emailService: EmailService,
  ) {}

  // Client Management
  async createClient(data: { email: string; name: string; company?: string; phone?: string }): Promise<PortalClient> {
    const client = this.portalRepo.create({
      ...data,
      accessToken: randomUUID(),
    });
    return this.portalRepo.save(client);
  }

  async getClients(): Promise<PortalClient[]> {
    return this.portalRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getClientById(id: string): Promise<PortalClient> {
    return this.portalRepo.findOne({ where: { id } });
  }

  async getClientByToken(token: string): Promise<PortalClient> {
    return this.portalRepo.findOne({ where: { accessToken: token, isActive: true } });
  }

  async updateClient(id: string, data: Partial<PortalClient>): Promise<PortalClient> {
    await this.portalRepo.update(id, data);
    return this.getClientById(id);
  }

  async regenerateToken(id: string): Promise<string> {
    const newToken = randomUUID();
    await this.portalRepo.update(id, { accessToken: newToken });
    return newToken;
  }

  async deleteClient(id: string): Promise<void> {
    await this.portalRepo.update(id, { isActive: false });
  }

  // Client Tickets
  async getClientTickets(clientEmail: string): Promise<Ticket[]> {
    return this.ticketRepo.find({
      where: { requesterEmail: clientEmail },
      order: { createdAt: 'DESC' },
    });
  }

  async createTicketFromPortal(data: {
    clientEmail: string;
    title: string;
    description: string;
    category: string;
    priority: string;
  }): Promise<Ticket> {
    const ticketNumber = `TKT-${Date.now()}`;
    const ticket = new Ticket();
    ticket.ticketNumber = ticketNumber;
    ticket.title = data.title;
    ticket.description = data.description;
    ticket.category = data.category;
    ticket.priority = TicketPriority[data.priority.toUpperCase() as keyof typeof TicketPriority] || TicketPriority.MEDIUM;
    ticket.status = TicketStatus.NEW;
    ticket.requesterEmail = data.clientEmail;
    
    const saved = await this.ticketRepo.save(ticket);
    
    // Send email notification
    await this.emailService.sendTicketCreated(data.clientEmail, saved as any);
    
    return saved as Ticket;
  }

  async getTicketByIdForPortal(ticketId: string, clientEmail: string): Promise<Ticket> {
    return this.ticketRepo.findOne({
      where: { id: ticketId, requesterEmail: clientEmail },
    });
  }

  async addCommentToTicket(ticketId: string, clientEmail: string, comment: string): Promise<any> {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId, requesterEmail: clientEmail },
    });
    
    if (!ticket) return null;

    const comments = ticket.internalNotes || [];
    comments.push({
      id: randomUUID(),
      text: comment,
      author: ticket.requesterEmail,
      createdAt: new Date().toISOString(),
      isInternal: false,
    });
    
    await this.ticketRepo.update(ticketId, { internalNotes: comments });
    return { success: true };
  }

  async rateTicket(ticketId: string, clientEmail: string, rating: number, feedback?: string): Promise<any> {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId, requesterEmail: clientEmail },
    });
    
    if (!ticket) return null;

    await this.ticketRepo.update(ticketId, { 
      clientRating: rating,
      clientFeedback: feedback,
    });
    return { success: true };
  }
}
