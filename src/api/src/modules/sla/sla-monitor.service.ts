import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Ticket, TicketStatus } from '../tickets/entities/ticket.entity';
import { SlaPolicy } from '../sla/entities/sla-policy.entity';

export interface SLAStats {
  total: number;
  compliant: number;
  breached: number;
  atRisk: number;
  complianceRate: number;
  byPriority: {
    critical: { total: number; compliant: number; breached: number; atRisk: number };
    high: { total: number; compliant: number; breached: number; atRisk: number };
    medium: { total: number; compliant: number; breached: number; atRisk: number };
    low: { total: number; compliant: number; breached: number; atRisk: number };
  };
}

@Injectable()
export class SlaMonitorService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(SlaPolicy)
    private slaPolicyRepository: Repository<SlaPolicy>,
  ) {}

  async getSLAStats(): Promise<SLAStats> {
    const slaPolicies = await this.slaPolicyRepository.find({ where: { isActive: true } });
    const tickets = await this.ticketRepository.find();

    const policyMap = new Map(slaPolicies.map(p => [p.priority, p]));

    let compliant = 0;
    let breached = 0;
    let atRisk = 0;

    const byPriority = {
      critical: { total: 0, compliant: 0, breached: 0, atRisk: 0 },
      high: { total: 0, compliant: 0, breached: 0, atRisk: 0 },
      medium: { total: 0, compliant: 0, breached: 0, atRisk: 0 },
      low: { total: 0, compliant: 0, breached: 0, atRisk: 0 },
    };

    const now = new Date();

    for (const ticket of tickets) {
      const policy = policyMap.get(ticket.priority);
      if (!policy) continue;

      byPriority[ticket.priority as keyof typeof byPriority].total++;

      if (ticket.status === 'closed' || ticket.status === 'resolved') {
        if (ticket.slaDeadline) {
          if (new Date(ticket.slaDeadline) >= new Date(ticket.resolvedAt || ticket.closedAt)) {
            compliant++;
            byPriority[ticket.priority as keyof typeof byPriority].compliant++;
          } else {
            breached++;
            byPriority[ticket.priority as keyof typeof byPriority].breached++;
          }
        } else {
          compliant++;
          byPriority[ticket.priority as keyof typeof byPriority].compliant++;
        }
      } else if (ticket.slaDeadline) {
        const deadline = new Date(ticket.slaDeadline);
        if (now > deadline) {
          breached++;
          byPriority[ticket.priority as keyof typeof byPriority].breached++;
        } else {
          const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
          if (hoursUntilDeadline <= policy.responseTimeHours * 0.5) {
            atRisk++;
            byPriority[ticket.priority as keyof typeof byPriority].atRisk++;
          }
        }
      }
    }

    const total = tickets.length;
    const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 100;

    return {
      total,
      compliant,
      breached,
      atRisk,
      complianceRate,
      byPriority,
    };
  }

  async getTicketsNearBreach(): Promise<Ticket[]> {
    const activeStatuses = [TicketStatus.NEW, TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS];
    
    const tickets = await this.ticketRepository.find({
      where: { status: In(activeStatuses) },
    });

    const now = new Date();
    const nearBreach: Ticket[] = [];

    for (const ticket of tickets) {
      if (ticket.slaDeadline) {
        const deadline = new Date(ticket.slaDeadline);
        const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        if (hoursUntilDeadline <= 2 && hoursUntilDeadline > 0) {
          nearBreach.push(ticket);
        }
      }
    }

    return nearBreach;
  }

  async getBreachedTickets(): Promise<Ticket[]> {
    const activeStatuses = [TicketStatus.NEW, TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS];
    const tickets = await this.ticketRepository.find({
      where: { status: In(activeStatuses) },
    });

    const now = new Date();
    const breached: Ticket[] = [];

    for (const ticket of tickets) {
      if (ticket.slaDeadline && new Date(ticket.slaDeadline) < now) {
        breached.push(ticket);
      }
    }

    return breached;
  }

  async calculateSLAForTicket(ticketId: string): Promise<{ responseDeadline: Date; resolutionDeadline: Date; isBreached: boolean }> {
    const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const policy = await this.slaPolicyRepository.findOne({ 
      where: { priority: ticket.priority, isActive: true } 
    });

    if (!policy) {
      throw new Error('SLA policy not found');
    }

    const createdAt = new Date(ticket.createdAt);
    const responseDeadline = new Date(createdAt.getTime() + policy.responseTimeHours * 60 * 60 * 1000);
    const resolutionDeadline = new Date(createdAt.getTime() + policy.resolutionTimeHours * 60 * 60 * 1000);

    const now = new Date();
    const isBreached = now > resolutionDeadline && ticket.status !== 'closed' && ticket.status !== 'resolved';

    return {
      responseDeadline,
      resolutionDeadline,
      isBreached,
    };
  }
}
