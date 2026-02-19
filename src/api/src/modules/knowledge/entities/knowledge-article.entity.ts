import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('knowledge_articles')
@Index('idx_knowledge_category', ['category'])
@Index('idx_knowledge_createdAt', ['createdAt'])
export class KnowledgeArticle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column()
  @Index('idx_knowledge_category')
  category: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ nullable: true })
  author: string;

  @Column({ default: 0 })
  views: number;

  @CreateDateColumn()
  @Index('idx_knowledge_createdAt')
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
