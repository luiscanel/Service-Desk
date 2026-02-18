import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { SlaController } from './sla.controller';
import { SlaService } from './sla.service';
import { SlaPolicy } from './entities/sla-policy.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SlaPolicy, Ticket]),
    EmailModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [SlaController],
  providers: [SlaService],
  exports: [SlaService],
})
export class SlaModule {}
