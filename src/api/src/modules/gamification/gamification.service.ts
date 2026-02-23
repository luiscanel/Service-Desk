import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentStats, Achievement, AchievementUnlock, AchievementType } from './entities/gamification.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(
    @InjectRepository(AgentStats)
    private agentStatsRepository: Repository<AgentStats>,
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    @InjectRepository(AchievementUnlock)
    private unlockRepository: Repository<AchievementUnlock>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async onModuleInit() {
    await this.seedAchievements();
  }

  private async seedAchievements() {
    const count = await this.achievementRepository.count();
    if (count > 0) return;

    const achievements = [
      { name: 'Primer Ticket', description: 'Resuelve tu primer ticket', type: AchievementType.TICKET_RESOLVED, icon: '🎫', pointsValue: 10 },
      { name: 'Rápido como el Rayo', description: 'Resuelve un ticket en menos de 1 hora', type: AchievementType.QUICK_RESOLUTION, icon: '⚡', pointsValue: 25 },
      { name: 'Primera Respuesta', description: 'Responde tu primer ticket', type: AchievementType.FIRST_RESPONSE, icon: '💬', pointsValue: 5 },
      { name: 'Estrella', description: 'Recibe una calificación de 5 estrellas', type: AchievementType.HIGH_RATING, icon: '⭐', pointsValue: 20 },
      { name: 'Creador', description: 'Crea 10 tickets', type: AchievementType.TICKET_CREATED, icon: '✨', pointsValue: 15 },
      { name: 'Racha de 3', description: 'Resuelve 3 tickets consecutivos', type: AchievementType.STREAK, icon: '🔥', pointsValue: 30 },
      { name: 'Campeón Semanal', description: 'Más tickets resueltos esta semana', type: AchievementType.WEEK_CHAMPION, icon: '🏆', pointsValue: 50 },
      { name: 'Campeón Mensual', description: 'Más tickets resueltos este mes', type: AchievementType.MONTH_CHAMPION, icon: '👑', pointsValue: 100 },
    ];

    for (const ach of achievements) {
      await this.achievementRepository.save({ ...ach, isActive: true });
    }
    this.logger.log('Achievements seeded successfully');
  }

  async getOrCreateAgentStats(agentId: string): Promise<AgentStats> {
    let stats = await this.agentStatsRepository.findOne({ where: { agentId } });
    if (!stats) {
      stats = this.agentStatsRepository.create({ agentId, points: 0, ticketsResolved: 0, badges: [], level: 1 });
      await this.agentStatsRepository.save(stats);
    }
    return stats;
  }

  async addPoints(agentId: string, points: number, reason: string): Promise<AgentStats> {
    const stats = await this.getOrCreateAgentStats(agentId);
    const oldLevel = stats.level;
    
    stats.points += points;
    stats.level = Math.floor(stats.points / 100) + 1;
    
    await this.agentStatsRepository.save(stats);
    
    // Notify if level up
    if (stats.level > oldLevel) {
      this.notificationsGateway.notifyUser(agentId, 'level:up', { 
        newLevel: stats.level, 
        points: stats.points 
      });
    }
    
    return stats;
  }

  async onTicketResolved(agentId: string, resolutionTimeHours: number): Promise<{ stats: AgentStats; newBadges: string[] }> {
    const stats = await this.getOrCreateAgentStats(agentId);
    stats.ticketsResolved++;
    stats.currentStreak++;
    
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }

    const resolutionHours = resolutionTimeHours;
    let pointsEarned = 10;
    const newBadges: string[] = [];

    // Check for quick resolution achievement (< 1 hour)
    if (resolutionHours < 1) {
      const quickAch = await this.achievementRepository.findOne({ where: { type: AchievementType.QUICK_RESOLUTION } });
      if (quickAch) {
        const alreadyUnlocked = await this.unlockRepository.findOne({ where: { agentId, achievementId: quickAch.id } });
        if (!alreadyUnlocked) {
          await this.unlockRepository.save({ agentId, achievementId: quickAch.id });
          pointsEarned += quickAch.pointsValue;
          newBadges.push(quickAch.name);
          
          // Notify achievement
          this.notificationsGateway.notifyUser(agentId, 'achievement:unlocked', { 
            achievement: quickAch 
          });
        }
      }
    }

    // Check for first ticket achievement
    if (stats.ticketsResolved === 1) {
      const firstAch = await this.achievementRepository.findOne({ where: { type: AchievementType.TICKET_RESOLVED } });
      if (firstAch) {
        const alreadyUnlocked = await this.unlockRepository.findOne({ where: { agentId, achievementId: firstAch.id } });
        if (!alreadyUnlocked) {
          await this.unlockRepository.save({ agentId, achievementId: firstAch.id });
          pointsEarned += firstAch.pointsValue;
          newBadges.push(firstAch.name);
          
          this.notificationsGateway.notifyUser(agentId, 'achievement:unlocked', { 
            achievement: firstAch 
          });
        }
      }
    }

    // Check for streak achievement (3+ tickets)
    if (stats.currentStreak >= 3) {
      const streakAch = await this.achievementRepository.findOne({ where: { type: AchievementType.STREAK } });
      if (streakAch) {
        const alreadyUnlocked = await this.unlockRepository.findOne({ where: { agentId, achievementId: streakAch.id } });
        if (!alreadyUnlocked) {
          await this.unlockRepository.save({ agentId, achievementId: streakAch.id });
          pointsEarned += streakAch.pointsValue;
          newBadges.push(streakAch.name);
          
          this.notificationsGateway.notifyUser(agentId, 'achievement:unlocked', { 
            achievement: streakAch 
          });
        }
      }
    }

    // Update average rating
    const agentTickets = await this.ticketRepository
      .createQueryBuilder('ticket')
      .where('ticket.assignedToId = :agentId', { agentId })
      .andWhere('ticket.satisfactionRating IS NOT NULL')
      .getMany();
    
    if (agentTickets.length > 0) {
      const totalRating = agentTickets.reduce((sum, t) => sum + (t.satisfactionRating || 0), 0);
      stats.rating = totalRating / agentTickets.length;
    }

    const oldLevel = stats.level;
    stats.points += pointsEarned;
    stats.level = Math.floor(stats.points / 100) + 1;
    
    await this.agentStatsRepository.save(stats);

    // Notify points earned
    this.notificationsGateway.notifyUser(agentId, 'points:earned', { 
      points: pointsEarned,
      totalPoints: stats.points,
      newBadges
    });

    // Check for level up
    if (stats.level > oldLevel) {
      this.notificationsGateway.notifyUser(agentId, 'level:up', { 
        newLevel: stats.level, 
        points: stats.points 
      });
    }

    return { stats, newBadges };
  }

  async getLeaderboard(limit = 10): Promise<AgentStats[]> {
    return this.agentStatsRepository.find({
      order: { points: 'DESC' },
      take: limit,
    });
  }

  async getWeeklyLeaderboard(): Promise<any[]> {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const tickets = await this.ticketRepository
      .createQueryBuilder('ticket')
      .where('ticket.assignedToId IS NOT NULL')
      .andWhere('ticket.status = :status', { status: 'resolved' })
      .andWhere('ticket.resolvedAt >= :startOfWeek', { startOfWeek })
      .getMany();

    const agentCounts = new Map<string, number>();
    for (const ticket of tickets) {
      if (ticket.assignedToId) {
        agentCounts.set(ticket.assignedToId, (agentCounts.get(ticket.assignedToId) || 0) + 1);
      }
    }

    const leaderboard = await Promise.all(
      Array.from(agentCounts.entries()).map(async ([agentId, count]) => {
        const stats = await this.agentStatsRepository.findOne({ where: { agentId } });
        return { agentId, ticketsResolved: count, points: stats?.points || 0 };
      })
    );

    return leaderboard.sort((a, b) => b.ticketsResolved - a.ticketsResolved);
  }

  async getMyStats(agentId: string): Promise<{ stats: AgentStats; achievements: AchievementUnlock[] }> {
    const stats = await this.getOrCreateAgentStats(agentId);
    const achievements = await this.unlockRepository.find({ 
      where: { agentId },
      relations: ['achievement'],
    });
    return { stats, achievements };
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return this.achievementRepository.find({ where: { isActive: true } });
  }
}
