import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { Agent } from './entities/agent.entity';

@Controller('api/agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  findAll(): Promise<Agent[]> {
    return this.agentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Agent> {
    return this.agentsService.findOne(id);
  }

  @Post()
  create(@Body() createAgentDto: Partial<Agent>): Promise<Agent> {
    return this.agentsService.create(createAgentDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateAgentDto: Partial<Agent>): Promise<Agent> {
    return this.agentsService.update(id, updateAgentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.agentsService.remove(id);
  }
}
