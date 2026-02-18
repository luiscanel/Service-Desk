import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('agents')
@Index('idx_agents_userId', ['userId'])
@Index('idx_agents_isAvailable', ['isAvailable'])
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  @Index('idx_agents_userId')
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: 1 })
  level: number;

  @Column({ default: true })
  @Index('idx_agents_isAvailable')
  isAvailable: boolean;

  @Column('simple-array', { nullable: true })
  skills: string[];

  @Column({ default: 5 })
  ticketCapacity: number;

  @Column({ default: 0 })
  currentTickets: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
