import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { SlaPolicy } from './entities/sla-policy.entity';
import { Ticket, TicketStatus, TicketPriority } from '../tickets/entities/ticket.entity';
import { EmailService } from '../email/email.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SlaService implements OnModuleInit {
  constructor(
    @InjectRepository(SlaPolicy)
    private slaRepo: Repository<SlaPolicy>,
    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,
    private emailService: EmailService,
  ) {}

  async onModuleInit() {
    await this.initDefaultPolicies();
  }

  async initDefaultPolicies() {
    const count = await this.slaRepo.count();
    if (count === 0) {
      const defaults = [
        { name: 'Crítico', priority: 'critical', responseTimeHours: 1, resolutionTimeHours: 4, description: 'Para problemas críticos que afectan operaciones' },
        { name: 'Alta', priority: 'high', responseTimeHours: 4, resolutionTimeHours: 24, description: 'Para problemas de alta prioridad' },
        { name: 'Media', priority: 'medium', responseTimeHours: 8, resolutionTimeHours: 48, description: 'Para problemas de prioridad media' },
        { name: 'Baja', priority: 'low', responseTimeHours: 24, resolutionTimeHours: 72, description: 'Para problemas de baja prioridad' },
      ];
      for (const p of defaults) {
        await this.slaRepo.save(this.slaRepo.create(p));
      }
    }
  }

  // Calculate SLA deadline for a ticket
  async applySlaToTicket(ticket: Ticket): Promise<Date | null> {
    const policy = await this.slaRepo.findOne({ where: { priority: ticket.priority, isActive: true } });
    if (!policy) return null;

    const deadline = new Date();
    deadline.setHours(deadline.getHours() + policy.resolutionTimeHours);
    return deadline;
  }

  async getPolicies(): Promise<SlaPolicy[]> {
    return this.slaRepo.find({ order: { priority: 'ASC' } });
  }

  async getPolicyById(id: string): Promise<SlaPolicy> {
    return this.slaRepo.findOne({ where: { id } });
  }

  async createPolicy(data: Partial<SlaPolicy>): Promise<SlaPolicy> {
    const policy = this.slaRepo.create(data);
    return this.slaRepo.save(policy);
  }

  async updatePolicy(id: string, data: Partial<SlaPolicy>): Promise<SlaPolicy> {
    await this.slaRepo.update(id, data);
    return this.getPolicyById(id);
  }

  async deletePolicy(id: string): Promise<void> {
    await this.slaRepo.delete(id);
  }

  // Check for SLA breaches
  @Cron(CronExpression.EVERY_10_MINUTES)
  async checkSlaBreaches() {
    const now = new Date();
    const breached = await this.ticketRepo.find({
      where: {
        slaDeadline: LessThan(now),
        status: TicketStatus.RESOLVED,
      },
    });

    for (const ticket of breached) {
      if (ticket.status !== TicketStatus.RESOLVED && ticket.status !== TicketStatus.CLOSED) {
        // SLA breached - send alert
        const policy = await this.slaRepo.findOne({ where: { priority: ticket.priority, isActive: true } });
        if (policy?.notifyOnBreach && policy.escalationEmail) {
          await this.emailService.sendEmail({
            to: policy.escalationEmail,
            subject: `⚠️ SLA Incumplido: ${ticket.ticketNumber}`,
            html: `<h2>SLA Incumplido</h2><p>El ticket ${ticket.ticketNumber} ha superado su deadline SLA.</p>`,
          });
        }
      }
    }
  }

  async getSlaStatus(ticket: Ticket): Promise<{ status: string; remaining: number; percentage: number }> {
    if (!ticket.slaDeadline) return { status: 'no_sla', remaining: 0, percentage: 100 };
    
    const now = new Date();
    const total = new Date(ticket.slaDeadline).getTime() - new Date(ticket.createdAt).getTime();
    const elapsed = now.getTime() - new Date(ticket.createdAt).getTime();
    const remaining = ticket.slaDeadline.getTime() - now.getTime();
    const percentage = Math.max(0, Math.min(100, (elapsed / total) * 100));

    if (remaining < 0) return { status: 'breached', remaining: 0, percentage: 100 };
    if (percentage > 80) return { status: 'warning', remaining, percentage };
    return { status: 'ok', remaining, percentage };
  }
}
