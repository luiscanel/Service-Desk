import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { SlaPolicy } from './entities/sla-policy.entity';
import { Ticket, TicketStatus, TicketPriority } from '../tickets/entities/ticket.entity';
import { EmailService } from '../email/email.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { WorkflowsService } from '../workflows/workflows.service';
import { WorkflowTrigger } from '../workflows/entities/workflow.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SlaService implements OnModuleInit {
  private readonly logger = new Logger(SlaService.name);

  constructor(
    @InjectRepository(SlaPolicy)
    private slaRepo: Repository<SlaPolicy>,
    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,
    private emailService: EmailService,
    private notificationsGateway: NotificationsGateway,
    private workflowsService: WorkflowsService,
  ) {}

  async onModuleInit() {
    await this.initDefaultPolicies();
  }

  async initDefaultPolicies() {
    const count = await this.slaRepo.count();
    if (count === 0) {
      const defaults = [
        { name: 'Crítico', priority: 'critical', responseTimeHours: 1, resolutionTimeHours: 4, description: 'Para problemas críticos que afectan operaciones', notifyOnBreach: true },
        { name: 'Alta', priority: 'high', responseTimeHours: 4, resolutionTimeHours: 24, description: 'Para problemas de alta prioridad', notifyOnBreach: true },
        { name: 'Media', priority: 'medium', responseTimeHours: 8, resolutionTimeHours: 48, description: 'Para problemas de prioridad media', notifyOnBreach: false },
        { name: 'Baja', priority: 'low', responseTimeHours: 24, resolutionTimeHours: 72, description: 'Para problemas de baja prioridad', notifyOnBreach: false },
      ];
      for (const p of defaults) {
        await this.slaRepo.save(this.slaRepo.create(p));
      }
      this.logger.log('Default SLA policies created');
    }
  }

  // Calculate SLA deadline for a ticket based on priority
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

  /**
   * Cron job to check for SLA breaches every 10 minutes
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async checkSlaBreaches() {
    this.logger.log('Checking SLA breaches...');
    
    const now = new Date();
    const activeStatuses = [TicketStatus.NEW, TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS, TicketStatus.PENDING];
    
    // Find tickets that have breached SLA (deadline passed and still active)
    const breachedTickets = await this.ticketRepo
      .createQueryBuilder('ticket')
      .where('ticket.slaDeadline IS NOT NULL')
      .andWhere('ticket.slaDeadline < :now', { now })
      .andWhere('ticket.status IN (:...statuses)', { statuses: activeStatuses })
      .getMany();

    for (const ticket of breachedTickets) {
      this.logger.warn(`SLA breached for ticket ${ticket.ticketNumber}`);
      
      // Get SLA policy
      const policy = await this.slaRepo.findOne({ 
        where: { priority: ticket.priority, isActive: true } 
      });
      
      // Send email notification if enabled
      if (policy?.notifyOnBreach && policy.escalationEmail) {
        await this.emailService.sendEmail({
          to: policy.escalationEmail,
          subject: `⚠️ SLA Incumplido: ${ticket.ticketNumber}`,
          html: this.buildSlaBreachEmailHtml(ticket, policy),
        });
      }
      
      // Send WebSocket notification
      this.notificationsGateway.emitSlaBreached(ticket);
      
      // Execute workflows - SLA breached
      this.workflowsService.executeWorkflow(WorkflowTrigger.SLA_BREACHED, {
        ticketId: ticket.id,
        ticket,
        policy,
      }).catch(err => this.logger.error('Workflow error:', err));
    }

    // Check for tickets near breach (within 2 hours)
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    const nearBreachTickets = await this.ticketRepo
      .createQueryBuilder('ticket')
      .where('ticket.slaDeadline IS NOT NULL')
      .andWhere('ticket.slaDeadline >= :now', { now })
      .andWhere('ticket.slaDeadline <= :twoHours', { twoHours: twoHoursFromNow })
      .andWhere('ticket.status IN (:...statuses)', { statuses: activeStatuses })
      .getMany();

    for (const ticket of nearBreachTickets) {
      this.logger.log(`SLA warning for ticket ${ticket.ticketNumber}`);
      this.notificationsGateway.emitSlaWarning(ticket);
      
      // Execute workflows - SLA warning
      this.workflowsService.executeWorkflow(WorkflowTrigger.SLA_WARNING, {
        ticketId: ticket.id,
        ticket,
      }).catch(err => this.logger.error('Workflow error:', err));
    }
  }

  private buildSlaBreachEmailHtml(ticket: Ticket, policy: SlaPolicy): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">⚠️ SLA Incumplido</h2>
        <p>El ticket ha superado su deadline SLA.</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p><strong>Ticket:</strong> ${ticket.ticketNumber}</p>
          <p><strong>Título:</strong> ${ticket.title}</p>
          <p><strong>Prioridad:</strong> ${ticket.priority}</p>
          <p><strong>Estado:</strong> ${ticket.status}</p>
          <p><strong>Deadline SLA:</strong> ${new Date(ticket.slaDeadline!).toLocaleString()}</p>
          <p><strong>Agente asignado:</strong> ${ticket.assignedToId || 'Sin asignar'}</p>
        </div>
        
        <p style="color: #64748b; font-size: 14px;">
          Este es un aviso automático del sistema Service Desk.
        </p>
      </div>
    `;
  }

  async getSlaStatus(ticket: Ticket): Promise<{ status: string; remaining: number; percentage: number }> {
    if (!ticket.slaDeadline) return { status: 'no_sla', remaining: 0, percentage: 100 };
    
    const now = new Date();
    const deadline = new Date(ticket.slaDeadline);
    const created = new Date(ticket.createdAt);
    
    const total = deadline.getTime() - created.getTime();
    const elapsed = now.getTime() - created.getTime();
    const remaining = deadline.getTime() - now.getTime();
    const percentage = Math.max(0, Math.min(100, (elapsed / total) * 100));

    if (remaining < 0) return { status: 'breached', remaining: 0, percentage: 100 };
    if (percentage > 80) return { status: 'warning', remaining, percentage };
    return { status: 'ok', remaining, percentage };
  }
}
