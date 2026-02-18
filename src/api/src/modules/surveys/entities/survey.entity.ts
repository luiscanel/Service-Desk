import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('surveys')
export class Survey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ticketId: string;

  @Column()
  ticketNumber: string;

  @Column({ nullable: true })
  clientEmail: string;

  @Column()
  rating: number;

  @Column({ nullable: true })
  feedback: string;

  @Column({ nullable: true })
  wouldRecommend: boolean;

  @Column({ default: false })
  sent: boolean;

  @Column({ default: false })
  responded: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
