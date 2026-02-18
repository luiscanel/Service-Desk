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

  // Timestamps para SLA automático
  @Column({ type: 'timestamp', nullable: true })
  assignedAt: Date  // Cuando se auto-asigna

  @Column({ type: 'timestamp', nullable: true })
  attendingAt: Date  // Cuando técnico inicia atención

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

  // Encuesta de satisfacción
  @Column({ nullable: true })
  satisfactionRating: number  // 1-5

  @Column({ nullable: true })
  technicalRating: number  // 1-5 - Qué tan bien se resolvió el problema

  @Column({ nullable: true })
  responseTimeRating: number  // 1-5 - Tiempo de respuesta

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
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
