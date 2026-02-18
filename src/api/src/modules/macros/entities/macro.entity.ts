import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('macros')
@Index('idx_macros_name', ['name'])
@Index('idx_macros_isActive', ['isActive'])
@Index('idx_macros_category', ['category'])
export class Macro {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index('idx_macros_name')
  name: string;

  @Column({ nullable: true })
  @Index('idx_macros_category')
  category: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ default: true })
  @Index('idx_macros_isActive')
  isActive: boolean;

  @Column({ default: 0 })
  usageCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
