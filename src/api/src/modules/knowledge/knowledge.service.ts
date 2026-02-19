import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { KnowledgeArticle } from './entities/knowledge-article.entity';
import { CreateKnowledgeArticleDto, UpdateKnowledgeArticleDto, KnowledgeSearchDto } from './dto/knowledge-article.dto';

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectRepository(KnowledgeArticle)
    private knowledgeRepository: Repository<KnowledgeArticle>,
  ) {}

  async create(createDto: CreateKnowledgeArticleDto): Promise<KnowledgeArticle> {
    const article = this.knowledgeRepository.create(createDto);
    return this.knowledgeRepository.save(article);
  }

  async findAll(searchDto: KnowledgeSearchDto): Promise<{ articles: KnowledgeArticle[]; total: number; page: number; limit: number }> {
    const { search, category, page = 1, limit = 10 } = searchDto;
    
    const whereConditions: any = {};
    
    if (category && category !== 'all') {
      whereConditions.category = category;
    }

    let queryBuilder = this.knowledgeRepository.createQueryBuilder('article');

    if (search) {
      queryBuilder = queryBuilder.where(
        '(article.title ILIKE :search OR article.content ILIKE :search OR article.tags && :searchArray)',
        { search: `%${search}%`, searchArray: `%${search}%` }
      );
    }

    if (category && category !== 'all') {
      queryBuilder = queryBuilder.andWhere('article.category = :category', { category });
    }

    const total = await queryBuilder.getCount();
    
    const articles = await queryBuilder
      .orderBy('article.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { articles, total, page, limit };
  }

  async findOne(id: string): Promise<KnowledgeArticle> {
    const article = await this.knowledgeRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    return article;
  }

  async findByCategory(category: string): Promise<KnowledgeArticle[]> {
    return this.knowledgeRepository.find({
      where: { category },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateDto: UpdateKnowledgeArticleDto): Promise<KnowledgeArticle> {
    const article = await this.findOne(id);
    Object.assign(article, updateDto);
    return this.knowledgeRepository.save(article);
  }

  async remove(id: string): Promise<void> {
    const article = await this.findOne(id);
    await this.knowledgeRepository.remove(article);
  }

  async incrementViews(id: string): Promise<KnowledgeArticle> {
    const article = await this.findOne(id);
    article.views += 1;
    return this.knowledgeRepository.save(article);
  }

  async getStats(): Promise<{ total: number; totalViews: number; categories: number; tags: number }> {
    const articles = await this.knowledgeRepository.find();
    
    const categories = new Set(articles.map(a => a.category)).size;
    const tags = new Set(articles.flatMap(a => a.tags || [])).size;
    const totalViews = articles.reduce((sum, a) => sum + a.views, 0);

    return {
      total: articles.length,
      totalViews,
      categories,
      tags,
    };
  }

  async getCategories(): Promise<{ category: string; count: number }[]> {
    const result = await this.knowledgeRepository
      .createQueryBuilder('article')
      .select('article.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('article.category')
      .getRawMany();

    return result;
  }
}
