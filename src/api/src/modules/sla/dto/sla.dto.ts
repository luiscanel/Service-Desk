import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';

export class CreateSlaPolicyDto {
  @IsString()
  name: string;

  @IsString()
  priority: string;

  @IsNumber()
  responseTimeHours: number;

  @IsNumber()
  resolutionTimeHours: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyOnBreach?: boolean;

  @IsOptional()
  @IsString()
  escalationEmail?: string;
}

export class UpdateSlaPolicyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsNumber()
  responseTimeHours?: number;

  @IsOptional()
  @IsNumber()
  resolutionTimeHours?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyOnBreach?: boolean;

  @IsOptional()
  @IsString()
  escalationEmail?: string;
}

export interface SlaStatusResponse {
  status: 'ok' | 'warning' | 'breached' | 'no_sla';
  remaining: number;
  percentage: number;
}
