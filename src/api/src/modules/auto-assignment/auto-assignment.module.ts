import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutoAssignmentService } from './auto-assignment.service';
import { Agent } from '../agents/entities/agent.entity';
import { Ticket } from '../tickets/entities/ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Agent, Ticket])],
  providers: [AutoAssignmentService],
  exports: [AutoAssignmentService],
})
export class AutoAssignmentModule {}
