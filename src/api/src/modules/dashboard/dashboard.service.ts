import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  getWidgets(userId: string) {
    return [
      { id: '1', widgetType: 'stats', title: 'Estadísticas', position: 0, isVisible: true },
      { id: '2', widgetType: 'ticketsChart', title: 'Tickets por Estado', position: 1, isVisible: true },
      { id: '3', widgetType: 'ticketsTrend', title: 'Tendencia de Tickets', position: 2, isVisible: true },
      { id: '4', widgetType: 'recentTickets', title: 'Tickets Recientes', position: 3, isVisible: true },
      { id: '5', widgetType: 'topAgents', title: 'Mejores Agentes', position: 4, isVisible: true },
      { id: '6', widgetType: 'priorityBreakdown', title: 'Por Prioridad', position: 5, isVisible: true },
    ];
  }

  getWidgetTypes() {
    return [
      { type: 'stats', title: 'Estadísticas', description: 'KPI principales' },
      { type: 'ticketsChart', title: 'Gráfico de Tickets', description: 'Distribución por estado' },
      { type: 'ticketsTrend', title: 'Tendencia', description: 'Evolución de tickets' },
      { type: 'recentTickets', title: 'Tickets Recientes', description: 'Últimos tickets' },
      { type: 'topAgents', title: 'Mejores Agentes', description: 'Rendimiento de agentes' },
      { type: 'priorityBreakdown', title: 'Por Prioridad', description: 'Distribución por prioridad' },
    ];
  }
}
