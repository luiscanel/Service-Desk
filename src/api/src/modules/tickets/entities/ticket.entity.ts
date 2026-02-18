import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Agent } from '../../agents/entities/agent.entity';

export enum TicketStatus {
  NEW = 'new',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  PENDING = 'pending',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('tickets')
@Index('idx_tickets_ticketNumber', ['ticketNumber'], { unique: true })
@Index('idx_tickets_status', ['status'])
@Index('idx_tickets_priority', ['priority'])
@Index('idx_tickets_assignedToId', ['assignedToId'])
@Index('idx_tickets_requesterId', ['requesterId'])
@Index('idx_tickets_createdAt', ['createdAt'])
@Index('idx_tickets_slaDeadline', ['slaDeadline'])
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  @Index('idx_tickets_ticketNumber')
  ticketNumber: string

  @Column()
  title: string

  @Column('text')
  description: string

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.NEW })
  @Index('idx_tickets_status')
  status: TicketStatus

  @Column({ type: 'enum', enum: TicketPriority, default: TicketPriority.MEDIUM })
  @Index('idx_tickets_priority')
  priority: TicketPriority

  @Column({ nullable: true })
  category: string

  @Column({ nullable: true })
  @Index('idx_tickets_assignedToId')
  assignedToId: string

  @ManyToOne(() => Agent, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: Agent;

  @Column({ nullable: true })
  @Index('idx_tickets_requesterId')
  requesterId: string

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'requesterId' })
  requester: User;

  @Column({ nullable: true })
  requesterEmail: string

  @Column({ type: 'timestamp', nullable: true })
  @Index('idx_tickets_assignedAt')
  assignedAt: Date

  @Column({ type: 'timestamp', nullable: true })
  attendingAt: Date

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date

  @Column({ type: 'timestamp', nullable: true })
  @Index('idx_tickets_slaDeadline')
  slaDeadline: Date

  @Column({ type: 'jsonb', nullable: true })
  internalNotes: any[]

  @Column({ nullable: true })
  clientRating: number

  @Column({ nullable: true })
  clientFeedback: string

  @Column({ nullable: true })
  satisfactionRating: number

  @Column({ nullable: true })
  technicalRating: number

  @Column({ nullable: true })
  responseTimeRating: number

  @Column({ nullable: true })
  surveyComment: string

  @Column({ type: 'timestamp', nullable: true })
  surveySentAt: Date

  @Column({ type: 'timestamp', nullable: true })
  surveyAnsweredAt: Date

  @Column({ default: false })
  surveySent: boolean

  @Column({ default: false })
  approvalRequired: boolean

  @Column({ default: false })
  approved: boolean

  @Column({ nullable: true })
  approverEmail: string

  @Column({ nullable: true })
  approvalComment: string

  @Column({ nullable: true })
  approvalRequestedBy: string

  @Column({ type: 'timestamp', nullable: true })
  approvalRequestedAt: Date

  @Column({ type: 'timestamp', nullable: true })
  approvalRespondedAt: Date

  @Column({ type: 'jsonb', nullable: true })
  attachments: any[]

  @CreateDateColumn()
  @Index('idx_tickets_createdAt')
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
