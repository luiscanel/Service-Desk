import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

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
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  ticketNumber: string

  @Column()
  title: string

  @Column('text')
  description: string

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.NEW })
  status: TicketStatus

  @Column({ type: 'enum', enum: TicketPriority, default: TicketPriority.MEDIUM })
  priority: TicketPriority

  @Column({ nullable: true })
  category: string

  @Column({ nullable: true })
  assignedToId: string

  @Column({ nullable: true })
  requesterId: string

  @Column({ nullable: true })
  requesterEmail: string

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date

  @Column({ type: 'timestamp', nullable: true })
  slaDeadline: Date

  @Column({ type: 'jsonb', nullable: true })
  internalNotes: any[]

  @Column({ nullable: true })
  clientRating: number

  @Column({ nullable: true })
  clientFeedback: string

  @Column({ default: false })
  approvalRequired: boolean

  @Column({ default: false })
  approved: boolean

  @Column({ type: 'jsonb', nullable: true })
  attachments: any[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
