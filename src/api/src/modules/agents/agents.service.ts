import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from './entities/agent.entity';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
  ) {}

  async findAll(): Promise<Agent[]> {
    return this.agentRepository.find();
  }

  async findAvailable(): Promise<Agent[]> {
    return this.agentRepository.find({ where: { isAvailable: true } });
  }

  async findOne(id: string): Promise<Agent> {
    return this.agentRepository.findOne({ where: { id } });
  }

  async create(data: Partial<Agent>): Promise<Agent> {
    const agent = this.agentRepository.create(data);
    return this.agentRepository.save(agent);
  }

  async update(id: string, data: Partial<Agent>): Promise<Agent> {
    await this.agentRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.agentRepository.delete(id);
  }
}
