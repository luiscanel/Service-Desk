import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  AGENT_L1 = 'agent_l1',
  AGENT_L2 = 'agent_l2',
  AGENT_L3 = 'agent_l3',
  SPECIALIST = 'specialist',
  USER = 'user',
}

export enum UserPlan {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
}

@Entity('users')
@Index('idx_users_email', ['email'], { unique: true })
@Index('idx_users_isActive', ['isActive'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'enum', enum: UserPlan, default: UserPlan.BRONZE })
  plan: UserPlan;

  @Column({ default: true })
  @Index('idx_users_isActive')
  isActive: boolean;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  phone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
