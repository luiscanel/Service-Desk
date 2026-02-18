import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ScheduledReport } from './entities/scheduled-report.entity';
import { Ticket, TicketStatus } from '../tickets/entities/ticket.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ScheduledReport)
    private reportRepo: Repository<ScheduledReport>,
    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,
    private emailService: EmailService,
  ) {}

  async findAll(): Promise<ScheduledReport[]> {
    return this.reportRepo.find({ order: { createdAt: 'DESC' } });
  }

  async create(data: Partial<ScheduledReport>): Promise<ScheduledReport> {
    const report = this.reportRepo.create(data);
    return this.reportRepo.save(report);
  }

  async update(id: string, data: Partial<ScheduledReport>): Promise<ScheduledReport> {
    await this.reportRepo.update(id, data);
    return this.reportRepo.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.reportRepo.delete(id);
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
      await this.reportRepo.update(reportId, { lastRunAt: new Date() });
    }

    return sent;
  }

  async generateReport(reportType: string, filters?: any): Promise<any> {
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
      where: { createdAt: Between(startDate, now) },
    });

    const byStatus = tickets.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});

    const byPriority = tickets.reduce((acc, t) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1;
      return acc;
    }, {});

    const resolved = tickets.filter(t => t.status === TicketStatus.RESOLVED).length;
    const avgTime = resolved > 0 ? 'N/A' : 'Sin datos';

    return {
      period: { start: startDate, end: now },
      total: tickets.length,
      resolved,
      open: tickets.filter(t => t.status === TicketStatus.NEW || t.status === TicketStatus.ASSIGNED).length,
      byStatus,
      byPriority,
      resolutionRate: tickets.length > 0 ? ((resolved / tickets.length) * 100).toFixed(1) : 0,
    };
  }

  formatReportHtml(name: string, type: string, data: any): string {
    return `
      <div style="font-family: Arial, max-width: 800px;">
        <h2>📊 ${name}</h2>
        <p>Reporte ${type} - Del ${data.period.start.toLocaleDateString()} al ${data.period.end.toLocaleDateString()}</p>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0;">
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #2563eb;">${data.total}</h3>
            <p style="margin: 5px 0;">Total Tickets</p>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #10b981;">${data.resolved}</h3>
            <p style="margin: 5px 0;">Resueltos</p>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #f59e0b;">${data.resolutionRate}%</h3>
            <p style="margin: 5px 0;">Tasa de Resolución</p>
          </div>
        </div>

        <h3>Por Estado</h3>
        <ul>
          ${Object.entries(data.byStatus).map(([k, v]) => `<li>${k}: ${v}</li>`).join('')}
        </ul>

        <h3>Por Prioridad</h3>
        <ul>
          ${Object.entries(data.byPriority).map(([k, v]) => `<li>${k}: ${v}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  // Cron job to run scheduled reports
  async runDueReports() {
    const now = new Date();
    const reports = await this.reportRepo.find({
      where: { isActive: true, nextRunAt: undefined },
    });

    // Run all active reports
    for (const report of reports) {
      await this.runReport(report.id);
    }
  }
}
