import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { SurveysController } from './surveys.controller';
import { SurveysService } from './surveys.service';
import { Survey } from './entities/survey.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Survey, Ticket]),
    EmailModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [SurveysController],
  providers: [SurveysService],
  exports: [SurveysService],
})
export class SurveysModule {}
