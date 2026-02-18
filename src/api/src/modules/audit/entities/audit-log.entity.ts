import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('audit_logs')
@Index('idx_audit_action', ['action'])
@Index('idx_audit_entity', ['entity'])
@Index('idx_audit_userId', ['userId'])
@Index('idx_audit_createdAt', ['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index('idx_audit_action')
  action: string;

  @Column()
  @Index('idx_audit_entity')
  entity: string;

  @Column({ nullable: true })
  entityId: string;

  @Column({ nullable: true })
  @Index('idx_audit_userId')
  userId: string;

  @Column({ nullable: true })
  userEmail: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValue: any;

  @Column({ type: 'jsonb', nullable: true })
  newValue: any;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  @Index('idx_audit_createdAt')
  createdAt: Date;
}
