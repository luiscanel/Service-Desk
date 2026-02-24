import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkflowsService } from './workflows.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Workflows')
@ApiBearerAuth()
@Controller('api/workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los workflows' })
  findAll() {
    return this.workflowsService.findAll();
  }

  @Get('triggers')
  @ApiOperation({ summary: 'Obtener triggers disponibles' })
  getTriggers() {
    return this.workflowsService.getTriggers();
  }

  @Get('actions')
  @ApiOperation({ summary: 'Obtener acciones disponibles' })
  getActions() {
    return this.workflowsService.getActions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener workflow por ID' })
  findOne(@Param('id') id: string) {
    return this.workflowsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo workflow' })
  create(@Body() data: any) {
    return this.workflowsService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar workflow' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.workflowsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar workflow' })
  remove(@Param('id') id: string) {
    return this.workflowsService.remove(id);
  }
}
