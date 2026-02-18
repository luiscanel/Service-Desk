import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export enum ReportType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export class CreateScheduledReportDto {
  @IsString()
  name: string;

  @IsString()
  reportType: string;

  @IsString()
  frequency: string;

  @IsString()
  recipients: string;

  @IsOptional()
  filters?: string;
}

export class UpdateScheduledReportDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  reportType?: string;

  @IsOptional()
  @IsString()
  frequency?: string;

  @IsOptional()
  @IsString()
  recipients?: string;

  @IsOptional()
  filters?: string;
}

export interface ReportData {
  period: { start: Date; end: Date };
  total: number;
  resolved: number;
  open: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  resolutionRate: string;
}
