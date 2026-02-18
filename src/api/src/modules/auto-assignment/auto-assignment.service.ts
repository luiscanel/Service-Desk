import { Injectable, Logger } from '@nestjs/common';

export interface AgentScore {
  agentId: string;
  score: number;
  skillsMatch: number;
  workloadScore: number;
  availabilityScore: number;
}

@Injectable()
export class AutoAssignmentService {
  private readonly logger = new Logger(AutoAssignmentService.name);

  private weights = {
    skillsMatch: 0.30,
    workload: 0.25,
    availability: 0.20,
    slaUrgency: 0.15,
    locationQueue: 0.05,
    historicalResolution: 0.05,
  };

  async findBestAgent(ticketCategory: string, agents: any[]): Promise<string | null> {
    const scores: AgentScore[] = [];

    for (const agent of agents) {
      const skillsMatch = this.calculateSkillsMatch(ticketCategory, agent.skills);
      const workloadScore = this.calculateWorkloadScore(agent.currentTickets);
      const availabilityScore = agent.isAvailable ? 1 : 0;

      const totalScore =
        (skillsMatch * this.weights.skillsMatch) +
        (workloadScore * this.weights.workload) +
        (availabilityScore * this.weights.availability);

      scores.push({
        agentId: agent.id,
        score: totalScore,
        skillsMatch,
        workloadScore,
        availabilityScore,
      });
    }

    scores.sort((a, b) => b.score - a.score);

    return scores.length > 0 ? scores[0].agentId : null;
  }

  private calculateSkillsMatch(category: string, agentSkills: string[]): number {
    if (!agentSkills || !category) return 0;
    const match = agentSkills.find(s => s.toLowerCase() === category.toLowerCase());
    return match ? 1 : 0.2;
  }

  private calculateWorkloadScore(currentTickets: number): number {
    const maxTickets = 10;
    return Math.max(0, 1 - (currentTickets / maxTickets));
  }
}
