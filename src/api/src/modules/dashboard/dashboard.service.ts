import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardWidget } from './entities/dashboard-widget.entity';

const DEFAULT_WIDGETS = [
  { widgetType: 'stats', title: 'Estadísticas', config: { show: ['total', 'open', 'resolved', 'avgTime'] } },
  { widgetType: 'ticketsChart', title: 'Tickets por Estado', config: { type: 'pie' } },
  { widgetType: 'ticketsTrend', title: 'Tendencia de Tickets', config: { period: '7d' } },
  { widgetType: 'recentTickets', title: 'Tickets Recientes', config: { limit: 10 } },
  { widgetType: 'topAgents', title: 'Mejores Agentes', config: { limit: 5 } },
  { widgetType: 'priorityBreakdown', title: 'Por Prioridad', config: {} },
];

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(DashboardWidget)
    private widgetRepo: Repository<DashboardWidget>,
  ) {}

  async getUserWidgets(userId: string): Promise<DashboardWidget[]> {
    let widgets = await this.widgetRepo.find({
      where: { userId },
      order: { position: 'ASC' },
    });

    // Initialize with defaults if empty
    if (widgets.length === 0) {
      for (let i = 0; i < DEFAULT_WIDGETS.length; i++) {
        const w = DEFAULT_WIDGETS[i];
        widgets.push(
          await this.widgetRepo.save(
            this.widgetRepo.create({
              userId,
              widgetType: w.widgetType,
              title: w.title,
              config: w.config,
              position: i,
            }),
          ),
        );
      }
    }

    return widgets;
  }

  async createWidget(userId: string, data: Partial<DashboardWidget>): Promise<DashboardWidget> {
    const maxPosition = await this.widgetRepo
      .createQueryBuilder('w')
      .where('w.userId = :userId', { userId })
      .select('MAX(w.position)', 'max')
      .getRawOne();

    const widget = this.widgetRepo.create({
      ...data,
      userId,
      position: (maxPosition?.max || 0) + 1,
    });
    return this.widgetRepo.save(widget);
  }

  async updateWidget(id: string, userId: string, data: Partial<DashboardWidget>): Promise<DashboardWidget> {
    await this.widgetRepo.update({ id, userId }, data);
    return this.widgetRepo.findOne({ where: { id } });
  }

  async deleteWidget(id: string, userId: string): Promise<void> {
    await this.widgetRepo.delete({ id, userId });
  }

  async reorderWidgets(userId: string, widgetIds: string[]): Promise<void> {
    for (let i = 0; i < widgetIds.length; i++) {
      await this.widgetRepo.update({ id: widgetIds[i], userId }, { position: i });
    }
  }

  async toggleWidget(id: string, userId: string): Promise<DashboardWidget> {
    const widget = await this.widgetRepo.findOne({ where: { id, userId } });
    if (widget) {
      await this.widgetRepo.update(id, { isVisible: !widget.isVisible });
      return this.widgetRepo.findOne({ where: { id } });
    }
    return null;
  }

  async getAvailableWidgetTypes(): Promise<any[]> {
    return [
      { type: 'stats', title: 'Estadísticas', description: 'KPI principales' },
      { type: 'ticketsChart', title: 'Gráfico de Tickets', description: 'Distribución por estado' },
      { type: 'ticketsTrend', title: 'Tendencia', description: 'Evolución de tickets' },
      { type: 'recentTickets', title: 'Tickets Recientes', description: 'Últimos tickets' },
      { type: 'topAgents', title: 'Mejores Agentes', description: 'Rendimiento de agentes' },
      { type: 'priorityBreakdown', title: 'Por Prioridad', description: 'Distribución por prioridad' },
      { type: 'categoryBreakdown', title: 'Por Categoría', description: 'Tickets por categoría' },
      { type: 'slaCompliance', title: 'Cumplimiento SLA', description: 'Porcentaje de cumplimiento' },
      { type: 'satisfaction', title: 'Satisfacción', description: 'Encuestas de satisfacción' },
    ];
  }
}
