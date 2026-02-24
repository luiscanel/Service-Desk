import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { EmailModule } from '../email/email.module';
import { SlaModule } from '../sla/sla.module';
import { AutoAssignmentModule } from '../auto-assignment/auto-assignment.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { GamificationModule } from '../gamification/gamification.module';
import { WorkflowsModule } from '../workflows/workflows.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    EmailModule,
    SlaModule,
    AutoAssignmentModule,
    NotificationsModule,
    GamificationModule,
    WorkflowsModule,
  ],
  providers: [TicketsService],
  controllers: [TicketsController],
  exports: [TicketsService],
})
export class TicketsModule {}
