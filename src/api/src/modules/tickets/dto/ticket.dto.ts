import { IsString, IsOptional, IsEnum, IsNumber, IsEmail, IsBoolean, IsDateString } from 'class-validator';
import { TicketStatus, TicketPriority } from '../entities/ticket.entity';

export class CreateTicketDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsString()
  requesterId?: string;

  @IsOptional()
  @IsEmail()
  requesterEmail?: string;
}

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsEmail()
  requesterEmail?: string;
}

export class SurveyResponseDto {
  @IsOptional()
  @IsNumber()
  satisfactionRating?: number;

  @IsOptional()
  @IsNumber()
  technicalRating?: number;

  @IsOptional()
  @IsNumber()
  responseTimeRating?: number;

  @IsOptional()
  @IsString()
  surveyComment?: string;
}

export class ApprovalRequestDto {
  @IsEmail()
  approverEmail: string;

  @IsString()
  requestedBy: string;
}

export class ApprovalResponseDto {
  @IsBoolean()
  approved: boolean;

  @IsOptional()
  @IsString()
  comment?: string;
}
