import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { ScheduledReport } from './entities/scheduled-report.entity';
import { Ticket, TicketStatus } from '../tickets/entities/ticket.entity';
import { EmailService } from '../email/email.service';
import { CreateScheduledReportDto, UpdateScheduledReportDto, ReportData } from './dto/report.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(ScheduledReport)
    private readonly reportRepo: Repository<ScheduledReport>,
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    private readonly emailService: EmailService,
  ) {}

  async findAll(): Promise<ScheduledReport[]> {
    return this.reportRepo.find({ order: { createdAt: 'DESC' } });
  }

  async create(dto: CreateScheduledReportDto): Promise<ScheduledReport> {
    const report = this.reportRepo.create({
      ...dto,
      nextRunAt: this.calculateNextRun(dto.frequency),
    });
    return this.reportRepo.save(report);
  }

  async update(id: string, dto: UpdateScheduledReportDto): Promise<ScheduledReport> {
    await this.reportRepo.update(id, dto as any);
    const report = await this.reportRepo.findOne({ where: { id } });
    if (!report) throw new NotFoundException(`Reporte ${id} no encontrado`);
    return report;
  }

  async delete(id: string): Promise<void> {
    const result = await this.reportRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Reporte ${id} no encontrado`);
    }
  }

  async runReport(reportId: string): Promise<boolean> {
    const report = await this.reportRepo.findOne({ where: { id: reportId } });
    if (!report || !report.isActive) return false;

    const reportData = await this.generateReport(report.reportType, report.filters);
    const recipients = report.recipients.split(',').map((r: string) => r.trim());

    const sent = await this.emailService.sendEmail({
      to: recipients,
      subject: `📊 Reporte: ${report.name}`,
      html: this.formatReportHtml(report.name, report.reportType, reportData),
    });

    if (sent) {
      // Update lastRunAt and calculate next run
      await this.reportRepo.update(reportId, { 
        lastRunAt: new Date(),
        nextRunAt: this.calculateNextRun(report.frequency),
      });
      this.logger.log(`Report ${report.name} sent successfully`);
    }

    return sent;
  }

  /**
   * Calculate next run time based on frequency
   */
  private calculateNextRun(frequency: string): Date {
    const now = new Date();
    
    switch (frequency) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        now.setHours(8, 0, 0, 0); // 8 AM
        break;
      case 'weekly':
        now.setDate(now.getDate() + (7 - now.getDay())); // Next Sunday
        now.setHours(8, 0, 0, 0);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        now.setDate(1); // First of month
        now.setHours(8, 0, 0, 0);
        break;
      default:
        now.setDate(now.getDate() + 1);
    }
    
    return now;
  }

  async generateReport(reportType: string, filters?: string): Promise<ReportData> {
    const now = new Date();
    let startDate = new Date();
    
    switch (reportType) {
      case 'daily':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    const tickets = await this.ticketRepo.find({
      where: { 
        createdAt: Between(startDate, now) 
      },
    });

    const byStatus = tickets.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPriority = tickets.reduce((acc, t) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const resolved = tickets.filter(t => t.status === TicketStatus.RESOLVED).length;

    // Calculate average resolution time
    let totalResolutionTime = 0;
    let resolvedCount = 0;
    
    for (const ticket of tickets) {
      if (ticket.resolvedAt && ticket.assignedAt) {
        const resolvedAt = new Date(ticket.resolvedAt);
        const assignedAt = new Date(ticket.assignedAt);
        totalResolutionTime += (resolvedAt.getTime() - assignedAt.getTime()) / (1000 * 60 * 60);
        resolvedCount++;
      }
    }

    const avgResolutionHours = resolvedCount > 0 
      ? Math.round(totalResolutionTime / resolvedCount * 10) / 10 
      : 0;

    return {
      period: { start: startDate, end: now },
      total: tickets.length,
      resolved,
      open: tickets.filter(t => 
        t.status === TicketStatus.NEW || t.status === TicketStatus.ASSIGNED
      ).length,
      byStatus,
      byPriority,
      resolutionRate: tickets.length > 0 
        ? ((resolved / tickets.length) * 100).toFixed(1) 
        : '0',
    };
  }

  formatReportHtml(name: string, type: string, data: ReportData): string {
    return `
      <div style="font-family: Arial, max-width: 800px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">📊 ${name}</h1>
          <p style="color: #e0e0e0; margin: 10px 0 0 0;">
            Reporte ${type} - Del ${data.period.start.toLocaleDateString()} al ${data.period.end.toLocaleDateString()}
          </p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px;">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
            <div style="background: white; padding: 25px; border-radius: 10px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="font-size: 36px; font-weight: bold; color: #2563eb;">${data.total}</div>
              <div style="color: #64748b; margin-top: 5px;">Total Tickets</div>
            </div>
            <div style="background: white; padding: 25px; border-radius: 10px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="font-size: 36px; font-weight: bold; color: #10b981;">${data.resolved}</div>
              <div style="color: #64748b; margin-top: 5px;">Resueltos</div>
            </div>
            <div style="background: white; padding: 25px; border-radius: 10px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="font-size: 36px; font-weight: bold; color: #f59e0b;">${data.resolutionRate}%</div>
              <div style="color: #64748b; margin-top: 5px;">Tasa de Resolución</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
            <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #334155; margin-top: 0;">📈 Por Estado</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                ${Object.entries(data.byStatus).map(([status, count]) => `
                  <li style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between;">
                    <span>${this.getStatusLabel(status)}</span>
                    <span style="font-weight: bold; color: #2563eb;">${count}</span>
                  </li>
                `).join('')}
              </ul>
            </div>

            <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #334155; margin-top: 0;">⚡ Por Prioridad</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                ${Object.entries(data.byPriority).map(([priority, count]) => `
                  <li style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between;">
                    <span>${this.getPriorityLabel(priority)}</span>
                    <span style="font-weight: bold; color: ${this.getPriorityColor(priority)};">${count}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>
        </div>
        
        <div style="background: #f1f5f9; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="color: #94a3b8; margin: 0; font-size: 12px;">
            Generado automáticamente por Service Desk
          </p>
        </div>
      </div>
    `;
  }

  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'new': '🆕 Nuevo',
      'assigned': '👤 Asignado',
      'in_progress': '⚙️ En Progreso',
      'pending': '⏳ Pendiente',
      'resolved': '✅ Resuelto',
      'closed': '🔒 Cerrado',
    };
    return labels[status] || status;
  }

  private getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      'critical': '🔴 Crítico',
      'high': '🟠 Alta',
      'medium': '🟡 Media',
      'low': '🟢 Baja',
    };
    return labels[priority] || priority;
  }

  private getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      'critical': '#dc2626',
      'high': '#ea580c',
      'medium': '#ca8a04',
      'low': '#16a34a',
    };
    return colors[priority] || '#64748b';
  }

  /**
   * Cron job to run due reports
   * Runs every hour to check if any reports need to be sent
   */
  @Cron(CronExpression.EVERY_HOUR)
  async runDueReports() {
    this.logger.log('Checking for due reports...');
    
    const now = new Date();
    const dueReports = await this.reportRepo
      .createQueryBuilder('report')
      .where('report.isActive = :isActive', { isActive: true })
      .andWhere('report.nextRunAt <= :now', { now })
      .getMany();

    this.logger.log(`Found ${dueReports.length} due reports`);

    for (const report of dueReports) {
      try {
        const success = await this.runReport(report.id);
        if (success) {
          this.logger.log(`Report ${report.name} executed successfully`);
        } else {
          this.logger.warn(`Report ${report.name} failed to execute`);
        }
      } catch (error) {
        this.logger.error(`Error running report ${report.name}: ${error.message}`);
      }
    }
  }
}
