import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Agents')
@ApiBearerAuth()
@Controller('api/agents')
@UseGuards(JwtAuthGuard)
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los agentes' })
  findAll(): Promise<any[]> {
    return this.agentsService.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'Obtener agentes disponibles' })
  findAvailable(): Promise<any[]> {
    return this.agentsService.findAvailable();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener agente por ID' })
  findOne(@Param('id') id: string): Promise<any> {
    return this.agentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear agente' })
  create(@Body() createAgentDto: Partial<any>): Promise<any> {
    return this.agentsService.create(createAgentDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar agente' })
  update(@Param('id') id: string, @Body() updateAgentDto: Partial<any>): Promise<any> {
    return this.agentsService.update(id, updateAgentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar agente' })
  remove(@Param('id') id: string): Promise<void> {
    return this.agentsService.remove(id);
  }
}
