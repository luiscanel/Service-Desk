import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MacrosService } from './macros.service';

@ApiTags('Macros')
@Controller('api/macros')
export class MacrosController {
  constructor(private readonly macrosService: MacrosService) {}

  @Get()
  @ApiOperation({ summary: 'Get all macros' })
  async findAll() {
    return this.macrosService.findAll();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get macro categories' })
  async getCategories() {
    return this.macrosService.getCategories();
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get macros by category' })
  async findByCategory(@Param('category') category: string) {
    return this.macrosService.findByCategory(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get macro by id' })
  async findById(@Param('id') id: string) {
    return this.macrosService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create macro' })
  async create(@Body() data: { name: string; category?: string; content: string; subject?: string }) {
    return this.macrosService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update macro' })
  async update(@Param('id') id: string, @Body() data: Partial<any>) {
    return this.macrosService.update(id, data);
  }

  @Post(':id/use')
  @ApiOperation({ summary: 'Use macro (increment count)' })
  async use(@Param('id') id: string) {
    await this.macrosService.incrementUsage(id);
    return { success: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete macro' })
  async delete(@Param('id') id: string) {
    await this.macrosService.delete(id);
    return { success: true };
  }
}
