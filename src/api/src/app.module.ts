import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TicketsModule } from './modules/tickets/tickets.module';
import { AgentsModule } from './modules/agents/agents.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AutoAssignmentModule } from './modules/auto-assignment/auto-assignment.module';
import { EmailModule } from './modules/email/email.module';
import { SettingsModule } from './modules/settings/settings.module';
import { PortalModule } from './modules/portal/portal.module';
import { MacrosModule } from './modules/macros/macros.module';
import { SlaModule } from './modules/sla/sla.module';
import { AuditModule } from './modules/audit/audit.module';
import { SurveysModule } from './modules/surveys/surveys.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { KnowledgeCategoriesModule } from './modules/knowledge-categories/knowledge-categories.module';
import { TagsModule } from './modules/tags/tags.module';
import { TimeTrackingModule } from './modules/time-tracking/time-tracking.module';
import { Ticket } from './modules/tickets/entities/ticket.entity';
import { User } from './modules/users/entities/user.entity';
import { Agent } from './modules/agents/entities/agent.entity';
import { Setting } from './modules/settings/entities/setting.entity';
import { PortalClient } from './modules/portal/entities/portal-client.entity';
import { Macro } from './modules/macros/entities/macro.entity';
import { SlaPolicy } from './modules/sla/entities/sla-policy.entity';
import { AuditLog } from './modules/audit/entities/audit-log.entity';
import { Survey } from './modules/surveys/entities/survey.entity';
import { DashboardWidget } from './modules/dashboard/entities/dashboard-widget.entity';
import { ScheduledReport } from './modules/reports/entities/scheduled-report.entity';
import { KnowledgeCategory } from './modules/knowledge-categories/entities/knowledge-category.entity';
import { Tag } from './modules/tags/entities/tag.entity';
import { TimeEntry } from './modules/time-tracking/entities/time-entry.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'postgres',
      port: 5432,
      username: 'servicedesk',
      password: 'ChangeMe123',
      database: 'servicedesk',
      entities: [Ticket, User, Agent, Setting, PortalClient, Macro, SlaPolicy, AuditLog, Survey, DashboardWidget, ScheduledReport, KnowledgeCategory, Tag, TimeEntry],
      synchronize: true,
    }),
    TicketsModule,
    AgentsModule,
    UsersModule,
    AuthModule,
    AutoAssignmentModule,
    EmailModule,
    SettingsModule,
    PortalModule,
    MacrosModule,
    SlaModule,
    AuditModule,
    SurveysModule,
    NotificationsModule,
    AttachmentsModule,
    DashboardModule,
    ReportsModule,
    KnowledgeCategoriesModule,
    TagsModule,
    TimeTrackingModule,
  ],
})
export class AppModule {}
