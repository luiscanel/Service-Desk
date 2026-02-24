import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TicketsModule } from './modules/tickets/tickets.module';
import { AgentsModule } from './modules/agents/agents.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AutoAssignmentModule } from './modules/auto-assignment/auto-assignment.module';
import { EmailModule } from './modules/email/email.module';
import { SettingsModule } from './modules/settings/settings.module';
import { MacrosModule } from './modules/macros/macros.module';
import { SlaModule } from './modules/sla/sla.module';
import { AuditModule } from './modules/audit/audit.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { Ticket } from './modules/tickets/entities/ticket.entity';
import { User } from './modules/users/entities/user.entity';
import { Agent } from './modules/agents/entities/agent.entity';
import { Setting } from './modules/settings/entities/setting.entity';
import { Macro } from './modules/macros/entities/macro.entity';
import { SlaPolicy } from './modules/sla/entities/sla-policy.entity';
import { AuditLog } from './modules/audit/entities/audit-log.entity';
import { ScheduledReport } from './modules/reports/entities/scheduled-report.entity';
import { KnowledgeArticle } from './modules/knowledge/entities/knowledge-article.entity';
import { AgentStats, Achievement, AchievementUnlock } from './modules/gamification/entities/gamification.entity';
import { Workflow } from './modules/workflows/entities/workflow.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate Limiting - Protección contra DDoS
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requests por minuto
      },
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'postgres',
      port: 5432,
      username: 'servicedesk',
      password: 'ChangeMe123',
      database: 'servicedesk',
      entities: [Ticket, User, Agent, Setting, Macro, SlaPolicy, AuditLog, ScheduledReport, KnowledgeArticle, AgentStats, Achievement, AchievementUnlock, Workflow],
      synchronize: false,
      migrationsRun: true,
    }),
    TicketsModule,
    AgentsModule,
    UsersModule,
    AuthModule,
    AutoAssignmentModule,
    EmailModule,
    SettingsModule,
    MacrosModule,
    SlaModule,
    AuditModule,
    NotificationsModule,
    AttachmentsModule,
    DashboardModule,
    ReportsModule,
    KnowledgeModule,
    GamificationModule,
    WorkflowsModule,
  ],
})
export class AppModule {}
