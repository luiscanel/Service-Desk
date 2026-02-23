import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Ticket, TicketStatus, TicketPriority } from '../tickets/entities/ticket.entity';
import { Agent } from '../agents/entities/agent.entity';
import { User } from '../users/entities/user.entity';

export interface DashboardStats {
  // Ticket counts
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  inProgressTickets: number;
  
  // Priority breakdown
  byPriority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  
  // Status breakdown
  byStatus: {
    new: number;
    assigned: number;
    in_progress: number;
    pending: number;
    resolved: number;
    closed: number;
  };
  
  // Performance metrics
  avgResolutionTimeHours: number;
  avgResponseTimeHours: number;
  resolutionRate: string;
  
  // Agent metrics
  activeAgents: number;
  agentsWithWorkload: Array<{
    id: string;
    name: string;
    currentTickets: number;
    capacity: number;
  }>;
  
  // SLA metrics
  slaComplianceRate: string;
  ticketsNearBreach: number;
  ticketsBreached: number;
  
  // Recent activity
  recentTickets: Ticket[];
  todayCreated: number;
  todayResolved: number;
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Get comprehensive dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    const allTickets = await this.ticketRepository.find();
    const agents = await this.agentRepository.find();
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    // Ticket counts by status
    const statusCounts = {
      [TicketStatus.NEW]: 0,
      [TicketStatus.ASSIGNED]: 0,
      [TicketStatus.IN_PROGRESS]: 0,
      [TicketStatus.PENDING]: 0,
      [TicketStatus.RESOLVED]: 0,
      [TicketStatus.CLOSED]: 0,
    };

    const priorityCounts = {
      [TicketPriority.CRITICAL]: 0,
      [TicketPriority.HIGH]: 0,
      [TicketPriority.MEDIUM]: 0,
      [TicketPriority.LOW]: 0,
    };

    // Calculate metrics
    let totalResolutionTime = 0;
    let totalResponseTime = 0;
    let resolvedCount = 0;
    let respondedCount = 0;
    let todayCreated = 0;
    let todayResolved = 0;

    for (const ticket of allTickets) {
      // Status counts
      if (statusCounts[ticket.status] !== undefined) {
        statusCounts[ticket.status]++;
      }
      
      // Priority counts
      if (priorityCounts[ticket.priority] !== undefined) {
        priorityCounts[ticket.priority]++;
      }

      // Today's activity
      const createdAt = new Date(ticket.createdAt);
      if (createdAt >= startOfDay) {
        todayCreated++;
      }
      if (ticket.resolvedAt) {
        const resolvedAt = new Date(ticket.resolvedAt);
        if (resolvedAt >= startOfDay) {
          todayResolved++;
        }
        
        // Resolution time
        const assignedAt = ticket.assignedAt ? new Date(ticket.assignedAt) : createdAt;
        const resolvedAtDate = new Date(ticket.resolvedAt);
        totalResolutionTime += (resolvedAtDate.getTime() - assignedAt.getTime()) / (1000 * 60 * 60);
        resolvedCount++;
      }

      // Response time
      if (ticket.attendingAt) {
        const assignedAt = ticket.assignedAt ? new Date(ticket.assignedAt) : createdAt;
        const attendingAt = new Date(ticket.attendingAt);
        totalResponseTime += (attendingAt.getTime() - assignedAt.getTime()) / (1000 * 60 * 60);
        respondedCount++;
      }
    }

    // Calculate SLA metrics
    const activeTickets = allTickets.filter(t => 
      ![TicketStatus.RESOLVED, TicketStatus.CLOSED].includes(t.status)
    );
    
    let ticketsNearBreach = 0;
    let ticketsBreached = 0;
    
    for (const ticket of activeTickets) {
      if (ticket.slaDeadline) {
        const deadline = new Date(ticket.slaDeadline);
        const hoursUntilBreach = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        if (hoursUntilBreach < 0) {
          ticketsBreached++;
        } else if (hoursUntilBreach <= 2) {
          ticketsNearBreach++;
        }
      }
    }

    // Agent workload
    const agentsWithWorkload = await Promise.all(
      agents.map(async (agent) => {
        const activeTicketCount = await this.ticketRepository
          .createQueryBuilder('ticket')
          .where('ticket.assignedToId = :agentId', { agentId: agent.id })
          .andWhere('ticket.status NOT IN (:...statuses)', { 
            statuses: [TicketStatus.CLOSED, TicketStatus.RESOLVED] 
          })
          .getCount();
        
        return {
          id: agent.id,
          name: `Agent ${agent.id.slice(0, 8)}`,
          currentTickets: activeTicketCount,
          capacity: agent.ticketCapacity || 10,
        };
      })
    );

    return {
      // Ticket counts
      totalTickets: allTickets.length,
      openTickets: activeTickets.length,
      resolvedTickets: statusCounts[TicketStatus.RESOLVED],
      closedTickets: statusCounts[TicketStatus.CLOSED],
      inProgressTickets: statusCounts[TicketStatus.IN_PROGRESS],
      
      // Breakdown
      byPriority: priorityCounts as any,
      byStatus: statusCounts as any,
      
      // Performance
      avgResolutionTimeHours: resolvedCount > 0 
        ? Math.round(totalResolutionTime / resolvedCount * 10) / 10 
        : 0,
      avgResponseTimeHours: respondedCount > 0 
        ? Math.round(totalResponseTime / respondedCount * 10) / 10 
        : 0,
      resolutionRate: allTickets.length > 0 
        ? ((resolvedCount / allTickets.length) * 100).toFixed(1) 
        : '0',
      
      // Agents
      activeAgents: agents.filter(a => a.isAvailable).length,
      agentsWithWorkload,
      
      // SLA
      slaComplianceRate: this.calculateSlaComplianceRate(allTickets),
      ticketsNearBreach,
      ticketsBreached,
      
      // Recent
      recentTickets: await this.getRecentTickets(5),
      todayCreated,
      todayResolved,
    };
  }

  /**
   * Calculate SLA compliance rate
   */
  private calculateSlaComplianceRate(tickets: Ticket[]): string {
    const resolvedTickets = tickets.filter(t => 
      [TicketStatus.RESOLVED, TicketStatus.CLOSED].includes(t.status) && t.slaDeadline
    );
    
    if (resolvedTickets.length === 0) return '100.0';
    
    let compliant = 0;
    for (const ticket of resolvedTickets) {
      const deadline = new Date(ticket.slaDeadline!);
      const resolvedAt = new Date(ticket.resolvedAt || ticket.closedAt || new Date());
      
      if (resolvedAt <= deadline) {
        compliant++;
      }
    }
    
    return ((compliant / resolvedTickets.length) * 100).toFixed(1);
  }

  /**
   * Get recent tickets
   */
  async getRecentTickets(limit = 10): Promise<Ticket[]> {
    return this.ticketRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['assignedTo'],
    });
  }

  /**
   * Get tickets trend for charts
   */
  async getTicketsTrend(days = 7): Promise<{ date: string; created: number; resolved: number }[]> {
    const result: { date: string; created: number; resolved: number }[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const created = await this.ticketRepository.count({
        where: {
          createdAt: Between(date, nextDate),
        },
      });

      const resolved = await this.ticketRepository
        .createQueryBuilder('ticket')
        .where('ticket.resolvedAt >= :start', { start: date })
        .andWhere('ticket.resolvedAt < :end', { end: nextDate })
        .getCount();

      result.push({
        date: date.toISOString().split('T')[0],
        created,
        resolved,
      });
    }

    return result;
  }

  /**
   * Get tickets by category for pie chart
   */
  async getTicketsByCategory(): Promise<{ category: string; count: number }[]> {
    const tickets = await this.ticketRepository
      .createQueryBuilder('ticket')
      .select('ticket.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('ticket.category')
      .getRawMany();

    return tickets.map(t => ({
      category: t.category || 'Sin categoría',
      count: parseInt(t.count),
    }));
  }

  /**
   * Get top performing agents
   */
  async getTopAgents(limit = 5): Promise<{
    agentId: string;
    ticketsResolved: number;
    avgResolutionTime: number;
    rating: number;
  }[]> {
    const agents = await this.agentRepository.find();
    const result = [];

    for (const agent of agents) {
      const resolvedTickets = await this.ticketRepository
        .createQueryBuilder('ticket')
        .where('ticket.assignedToId = :agentId', { agentId: agent.id })
        .andWhere('ticket.status IN (:...statuses)', { 
          statuses: [TicketStatus.RESOLVED, TicketStatus.CLOSED] 
        })
        .getCount();

      if (resolvedTickets > 0) {
        result.push({
          agentId: agent.id,
          ticketsResolved: resolvedTickets,
          avgResolutionTime: 0, // Would need more complex query
          rating: 0,
        });
      }
    }

    return result.sort((a, b) => b.ticketsResolved - a.ticketsResolved).slice(0, limit);
  }

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
