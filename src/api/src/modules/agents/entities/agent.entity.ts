import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('agents')
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: true })
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
