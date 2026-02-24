import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum WorkflowTrigger {
  TICKET_CREATED = 'ticket_created',
  TICKET_ASSIGNED = 'ticket_assigned',
  TICKET_STATUS_CHANGED = 'ticket_status_changed',
  TICKET_PRIORITY_CHANGED = 'ticket_priority_changed',
  SLA_WARNING = 'sla_warning',
  SLA_BREACHED = 'sla_breached',
}

export enum WorkflowAction {
  ASSIGN_AGENT = 'assign_agent',
  SET_STATUS = 'set_status',
  SET_PRIORITY = 'set_priority',
  SEND_EMAIL = 'send_email',
  NOTIFY_AGENT = 'notify_agent',
  ADD_TAG = 'add_tag',
  ESCALATE = 'escalate',
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface WorkflowActionConfig {
  action: WorkflowAction;
  config: Record<string, any>;
}

@Entity('workflows')
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: WorkflowTrigger })
  trigger: WorkflowTrigger;

  @Column({ type: 'jsonb', nullable: true })
  conditions: WorkflowCondition[];

  @Column({ type: 'jsonb' })
  actions: WorkflowActionConfig[];

  @Column({ nullable: true })
  priority: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
