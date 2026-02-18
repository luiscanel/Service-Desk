import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class SettingDto {
  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  category?: string;
}

export class EmailConfigDto {
  @IsString()
  host: string;

  @IsNumber()
  port: number;

  @IsBoolean()
  secure: boolean;

  @IsString()
  user: string;

  @IsString()
  pass: string;

  @IsString()
  from: string;
}

export interface EmailConfigResponse {
  host: string | null;
  port: number;
  secure: boolean;
  user: string | null;
  from: string | null;
  configured: boolean;
}
