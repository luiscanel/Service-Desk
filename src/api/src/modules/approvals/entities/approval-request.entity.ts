import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('approval_requests')
export class ApprovalRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ticketId: string;

  @Column()
  ticketNumber: string;

  @Column()
  requestedBy: string;

  @Column()
  requestedByEmail: string;

  @Column()
  approverEmail: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  comment: string;

  @Column({ nullable: true })
  respondedAt: Date;

  @Column({ nullable: true })
  respondedBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
