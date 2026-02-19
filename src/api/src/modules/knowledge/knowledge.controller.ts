import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { KnowledgeService } from './knowledge.service';
import { CreateKnowledgeArticleDto, UpdateKnowledgeArticleDto, KnowledgeSearchDto } from './dto/knowledge-article.dto';

@ApiTags('Knowledge Base')
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new knowledge article' })
  @ApiResponse({ status: 201, description: 'Article created successfully' })
  create(@Body() createDto: CreateKnowledgeArticleDto) {
    return this.knowledgeService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all knowledge articles with pagination and filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Query() searchDto: KnowledgeSearchDto) {
    return this.knowledgeService.findAll(searchDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get knowledge base statistics' })
  getStats() {
    return this.knowledgeService.getStats();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories with article count' })
  getCategories() {
    return this.knowledgeService.getCategories();
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get articles by category' })
  findByCategory(@Param('category') category: string) {
    return this.knowledgeService.findByCategory(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single knowledge article' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.knowledgeService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a knowledge article' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateKnowledgeArticleDto,
  ) {
    return this.knowledgeService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a knowledge article' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.knowledgeService.remove(id);
  }

  @Post(':id/views')
  @ApiOperation({ summary: 'Increment article view count' })
  incrementViews(@Param('id', ParseUUIDPipe) id: string) {
    return this.knowledgeService.incrementViews(id);
  }
}
