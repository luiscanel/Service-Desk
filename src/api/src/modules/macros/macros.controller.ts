import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MacrosService } from './macros.service';
import { CreateMacroDto, UpdateMacroDto } from './dto/macro.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Macros')
@ApiBearerAuth()
@Controller('api/macros')
@UseGuards(JwtAuthGuard)
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
  async create(@Body() dto: CreateMacroDto) {
    return this.macrosService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update macro' })
  async update(@Param('id') id: string, @Body() dto: UpdateMacroDto) {
    return this.macrosService.update(id, dto);
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
