import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Agent } from '../../agents/entities/agent.entity';

export enum AchievementType {
  TICKET_RESOLVED = 'ticket_resolved',
  FIRST_RESPONSE = 'first_response',
  QUICK_RESOLUTION = 'quick_resolution',
  HIGH_RATING = 'high_rating',
  TICKET_CREATED = 'ticket_created',
  STREAK = 'streak',
  WEEK_CHAMPION = 'week_champion',
  MONTH_CHAMPION = 'month_champion',
}

@Entity('agent_stats')
export class AgentStats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  agentId: string;

  @ManyToOne(() => Agent)
  agent: Agent;

  @Column({ default: 0 })
  points: number;

  @Column({ default: 0 })
  ticketsResolved: number;

  @Column({ default: 0 })
  avgResolutionTimeHours: number;

  @Column({ default: 0 })
  currentStreak: number;

  @Column({ default: 0 })
  longestStreak: number;

  @Column({ type: 'simple-array', nullable: true })
  badges: string[];

  @Column({ default: 0 })
  level: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  rating: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: AchievementType })
  type: AchievementType;

  @Column()
  icon: string;

  @Column()
  pointsValue: number;

  @Column({ default: false })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('achievement_unlocks')
export class AchievementUnlock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  agentId: string;

  @Column()
  achievementId: string;

  @ManyToOne(() => Achievement)
  achievement: Achievement;

  @CreateDateColumn()
  unlockedAt: Date;
}
