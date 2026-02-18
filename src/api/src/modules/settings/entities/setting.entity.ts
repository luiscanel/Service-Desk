import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('settings')
@Index('idx_settings_key', ['key'], { unique: true })
@Index('idx_settings_category', ['category'])
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  @Index('idx_settings_key')
  key: string;

  @Column({ type: 'text', nullable: true })
  value: string;

  @Column({ nullable: true })
  @Index('idx_settings_category')
  category: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
