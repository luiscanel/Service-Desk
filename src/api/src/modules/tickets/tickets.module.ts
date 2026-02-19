import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { EmailModule } from '../email/email.module';
import { SlaModule } from '../sla/sla.module';
import { AutoAssignmentModule } from '../auto-assignment/auto-assignment.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket]), EmailModule, SlaModule, AutoAssignmentModule],
  providers: [TicketsService],
  controllers: [TicketsController],
  exports: [TicketsService],
})
export class TicketsModule {}
