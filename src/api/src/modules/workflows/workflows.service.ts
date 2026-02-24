import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow, WorkflowTrigger, WorkflowAction } from './entities/workflow.entity';
import { TicketsService } from '../tickets/tickets.service';
import { EmailService } from '../email/email.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);

  constructor(
    @InjectRepository(Workflow)
    private readonly workflowRepository: Repository<Workflow>,
    private readonly ticketsService: TicketsService,
    private readonly emailService: EmailService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async findAll(): Promise<Workflow[]> {
    return this.workflowRepository.find({
      order: { priority: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Workflow> {
    return this.workflowRepository.findOne({ where: { id } });
  }

  async create(data: Partial<Workflow>): Promise<Workflow> {
    const workflow = this.workflowRepository.create(data);
    return this.workflowRepository.save(workflow);
  }

  async update(id: string, data: Partial<Workflow>): Promise<Workflow> {
    await this.workflowRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.workflowRepository.delete(id);
  }

  async executeWorkflow(trigger: WorkflowTrigger, context: any): Promise<void> {
    const workflows = await this.workflowRepository.find({
      where: { isActive: true, trigger },
    });

    for (const workflow of workflows) {
      try {
        // Check conditions
        if (this.checkConditions(workflow.conditions || [], context)) {
          await this.executeActions(workflow.actions, context);
          this.logger.log(`Workflow "${workflow.name}" executed successfully`);
        }
      } catch (error) {
        this.logger.error(`Error executing workflow "${workflow.name}":`, error);
      }
    }
  }

  private checkConditions(conditions: any[], context: any): boolean {
    if (!conditions || conditions.length === 0) return true;

    return conditions.every(condition => {
      const fieldValue = this.getFieldValue(context, condition.field);
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'not_equals':
          return fieldValue !== condition.value;
        case 'contains':
          return String(fieldValue).includes(condition.value);
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value);
        case 'less_than':
          return Number(fieldValue) < Number(condition.value);
        default:
          return true;
      }
    });
  }

  private getFieldValue(context: any, field: string): any {
    return field.split('.').reduce((obj, key) => obj?.[key], context);
  }

  private async executeActions(actions: any[], context: any): Promise<void> {
    for (const action of actions) {
      try {
        switch (action.action) {
          case WorkflowAction.ASSIGN_AGENT:
            if (action.config.agentId) {
              await this.ticketsService.assignAgent(context.ticketId, action.config.agentId);
            }
            break;

          case WorkflowAction.SET_STATUS:
            await this.ticketsService.updateStatus(context.ticketId, action.config.status);
            break;

          case WorkflowAction.SET_PRIORITY:
            await this.ticketsService.updatePriority(context.ticketId, action.config.priority);
            break;

          case WorkflowAction.SEND_EMAIL:
            await this.emailService.sendEmail({
              to: action.config.to,
              subject: action.config.subject,
              html: action.config.body,
            });
            break;

          case WorkflowAction.NOTIFY_AGENT:
            if (context.agentId) {
              this.notificationsGateway.emitToUser(context.agentId, {
                type: 'workflow',
                title: action.config.title || 'Notificación de Workflow',
                message: action.config.message,
              });
            }
            break;

          case WorkflowAction.ESCALATE:
            await this.ticketsService.escalateTicket(context.ticketId, action.config.level);
            break;

          default:
            this.logger.warn(`Unknown action: ${action.action}`);
        }
      } catch (error) {
        this.logger.error(`Error executing action ${action.action}:`, error);
      }
    }
  }

  // Getters para opciones en el frontend
  getTriggers() {
    return Object.values(WorkflowTrigger).map(value => ({
      value,
      label: value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    }));
  }

  getActions() {
    return Object.values(WorkflowAction).map(value => ({
      value,
      label: value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    }));
  }
}
