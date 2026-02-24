import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('sla_policies')
@Index('idx_sla_name', ['name'])
@Index('idx_sla_priority', ['priority'])
@Index('idx_sla_isActive', ['isActive'])
export class SlaPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  priority: string;

  @Column()
  responseTimeHours: number;

  @Column()
  resolutionTimeHours: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  notifyOnBreach: boolean;

  @Column({ nullable: true })
  escalationEmail: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
