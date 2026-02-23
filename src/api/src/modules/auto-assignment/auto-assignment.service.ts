import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from '../agents/entities/agent.entity';
import { Ticket, TicketStatus, TicketPriority } from '../tickets/entities/ticket.entity';

export interface AgentScore {
  agent: Agent;
  score: number;
  skillsMatch: number;
  workloadScore: number;
  availabilityScore: number;
  slaUrgencyScore: number;
}

@Injectable()
export class AutoAssignmentService {
  private readonly logger = new Logger(AutoAssignmentService.name);

  constructor(
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
  ) {}

  private weights = {
    skillsMatch: 0.30,
    workload: 0.25,
    availability: 0.20,
    slaUrgency: 0.15,
    historicalResolution: 0.10,
  };

  /**
   * Main method to find the best agent for a ticket
   */
  async assignTicket(ticket: Ticket): Promise<Agent | null> {
    // Get available agents
    const agents = await this.agentRepository.find({ 
      where: { isAvailable: true }
    });

    if (agents.length === 0) {
      this.logger.warn('No hay agentes disponibles para asignar');
      return null;
    }

    // Get current workload for each agent
    const agentsWithWorkload = await Promise.all(
      agents.map(async (agent) => {
        const ticketCount = await this.getActiveTicketCount(agent.id);
        const agentWithWorkload = { ...agent, currentTickets: ticketCount };
        
        // Get historical resolution time for this agent
        const avgResolutionTime = await this.getAgentAvgResolutionTime(agent.id);
        
        return { agent: agentWithWorkload, avgResolutionTime };
      })
    );

    // Score each agent
    const scoredAgents: AgentScore[] = agentsWithWorkload.map(({ agent, avgResolutionTime }) => {
      const skillsMatch = this.calculateSkillsMatch(ticket.category, agent.skills);
      const workloadScore = this.calculateWorkloadScore(agent.currentTickets, agent.ticketCapacity);
      const availabilityScore = agent.isAvailable ? 1 : 0;
      const slaUrgencyScore = this.calculateSlaUrgencyScore(ticket);
      const historicalScore = this.calculateHistoricalScore(avgResolutionTime);

      // Calculate weighted total score
      const totalScore = 
        (skillsMatch * this.weights.skillsMatch) +
        (workloadScore * this.weights.workload) +
        (availabilityScore * this.weights.availability) +
        (slaUrgencyScore * this.weights.slaUrgency) +
        (historicalScore * this.weights.historicalResolution);

      return {
        agent,
        score: totalScore,
        skillsMatch,
        workloadScore,
        availabilityScore,
        slaUrgencyScore,
      };
    });

    // Sort by score descending
    scoredAgents.sort((a, b) => b.score - a.score);

    // Select best agent
    const bestAgent = scoredAgents[0];
    if (!bestAgent) {
      this.logger.warn('No se encontró el mejor agente para el ticket');
      return null;
    }

    // Update agent workload
    await this.updateAgentWorkload(bestAgent.agent.id);

    this.logger.log(
      `Ticket ${ticket.ticketNumber || ticket.id} asignado al agente ${bestAgent.agent.id} ` +
      `(score: ${bestAgent.score.toFixed(2)}, skills: ${bestAgent.skillsMatch}, workload: ${bestAgent.workloadScore})`
    );
    
    return bestAgent.agent;
  }

  /**
   * Get count of active (non-closed/non-resolved) tickets for an agent
   */
  private async getActiveTicketCount(agentId: string): Promise<number> {
    return this.ticketRepository
      .createQueryBuilder('ticket')
      .where('ticket.assignedToId = :agentId', { agentId })
      .andWhere('ticket.status NOT IN (:...statuses)', { 
        statuses: [TicketStatus.CLOSED, TicketStatus.RESOLVED] 
      })
      .getCount();
  }

  /**
   * Get average resolution time in hours for an agent
   */
  private async getAgentAvgResolutionTime(agentId: string): Promise<number> {
    const resolvedTickets = await this.ticketRepository
      .createQueryBuilder('ticket')
      .where('ticket.assignedToId = :agentId', { agentId })
      .andWhere('ticket.resolvedAt IS NOT NULL')
      .andWhere('ticket.assignedAt IS NOT NULL')
      .getMany();

    if (resolvedTickets.length === 0) return 48; // Default 48 hours

    const totalTime = resolvedTickets.reduce((sum, ticket) => {
      const resolved = new Date(ticket.resolvedAt!).getTime();
      const assigned = new Date(ticket.assignedAt!).getTime();
      return sum + (resolved - assigned);
    }, 0);

    return (totalTime / resolvedTickets.length) / (1000 * 60 * 60); // Convert to hours
  }

  /**
   * Calculate skills match score (0-1)
   */
  private calculateSkillsMatch(category: string, agentSkills: string[]): number {
    if (!agentSkills || agentSkills.length === 0) return 0.2;
    if (!category) return 0.3;

    const normalizedCategory = category.toLowerCase();
    const hasExactMatch = agentSkills.some(s => s.toLowerCase() === normalizedCategory);
    const hasPartialMatch = agentSkills.some(s => 
      s.toLowerCase().includes(normalizedCategory) || normalizedCategory.includes(s.toLowerCase())
    );

    if (hasExactMatch) return 1.0;
    if (hasPartialMatch) return 0.7;
    return 0.2;
  }

  /**
   * Calculate workload score based on current tickets vs capacity (0-1)
   */
  private calculateWorkloadScore(currentTickets: number, capacity: number): number {
    if (!capacity || capacity <= 0) capacity = 10; // Default capacity
    if (currentTickets >= capacity) return 0;
    return 1 - (currentTickets / capacity);
  }

  /**
   * Calculate SLA urgency score (0-1)
   * Higher priority tickets should be assigned to more available agents
   */
  private calculateSlaUrgencyScore(ticket: Ticket): number {
    const priorityWeights: Record<TicketPriority, number> = {
      [TicketPriority.CRITICAL]: 1.0,
      [TicketPriority.HIGH]: 0.75,
      [TicketPriority.MEDIUM]: 0.5,
      [TicketPriority.LOW]: 0.25,
    };

    // Base score from priority
    let score = priorityWeights[ticket.priority] || 0.5;

    // Boost if ticket is already past SLA deadline
    if (ticket.slaDeadline && new Date(ticket.slaDeadline) < new Date()) {
      score = 1.0;
    }

    return score;
  }

  /**
   * Calculate historical performance score (0-1)
   * Agents with faster resolution times get higher scores
   */
  private calculateHistoricalScore(avgResolutionHours: number): number {
    // Best: <4 hours = 1.0, Worst: >72 hours = 0.2
    if (avgResolutionHours <= 4) return 1.0;
    if (avgResolutionHours >= 72) return 0.2;
    
    // Linear interpolation
    return 1 - ((avgResolutionHours - 4) / 68) * 0.8;
  }

  /**
   * Update agent's current ticket count
   */
  async updateAgentWorkload(agentId: string): Promise<void> {
    const ticketCount = await this.getActiveTicketCount(agentId);
    await this.agentRepository.update(agentId, { currentTickets: ticketCount });
  }

  /**
   * Get available agents with their current workload
   */
  async getAgentsWithWorkload(): Promise<Agent[]> {
    const agents = await this.agentRepository.find();
    
    for (const agent of agents) {
      agent.currentTickets = await this.getActiveTicketCount(agent.id);
    }
    
    return agents;
  }
}
