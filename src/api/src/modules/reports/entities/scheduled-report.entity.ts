import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('scheduled_reports')
@Index('idx_reports_userId', ['userId'])
@Index('idx_reports_isActive', ['isActive'])
@Index('idx_reports_nextRunAt', ['nextRunAt'])
export class ScheduledReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  reportType: string;

  @Column()
  frequency: string;

  @Column({ nullable: true })
  cronExpression: string;

  @Column({ nullable: true })
  dayOfWeek: number;

  @Column({ nullable: true })
  dayOfMonth: number;

  @Column()
  recipients: string;

  @Column({ type: 'jsonb', nullable: true })
  filters: any;

  @Column({ default: true })
  @Index('idx_reports_isActive')
  isActive: boolean;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  lastRunAt: Date;

  @Column({ nullable: true })
  @Index('idx_reports_nextRunAt')
  nextRunAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
