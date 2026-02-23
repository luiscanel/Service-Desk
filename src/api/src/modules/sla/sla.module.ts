import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { SlaController } from './sla.controller';
import { SlaService } from './sla.service';
import { SlaMonitorController } from './sla-monitor.controller';
import { SlaMonitorService } from './sla-monitor.service';
import { SlaPolicy } from './entities/sla-policy.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SlaPolicy, Ticket]),
    EmailModule,
    NotificationsModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [SlaController, SlaMonitorController],
  providers: [SlaService, SlaMonitorService],
  exports: [SlaService, SlaMonitorService],
})
export class SlaModule {}
