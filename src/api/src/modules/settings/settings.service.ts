import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { EmailService } from '../email/email.service';
import { EmailConfigDto, EmailConfigResponse } from './dto/settings.dto';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(Setting)
    private readonly settingsRepository: Repository<Setting>,
    private readonly emailService: EmailService,
  ) {}

  async onModuleInit() {
    await this.loadEmailConfig();
  }

  async getSetting(key: string): Promise<string | null> {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    return setting?.value || null;
  }

  async setSetting(key: string, value: string, category: string = 'general'): Promise<Setting> {
    const existing = await this.settingsRepository.findOne({ where: { key } });
    
    const setting = existing 
      ? { ...existing, value, category }
      : this.settingsRepository.create({ key, value, category });
    
    return this.settingsRepository.save(setting);
  }

  async getAllSettings(): Promise<Setting[]> {
    return this.settingsRepository.find();
  }

  async getSettingsByCategory(category: string): Promise<Setting[]> {
    return this.settingsRepository.find({ where: { category } });
  }

  async saveEmailConfig(dto: EmailConfigDto): Promise<void> {
    await this.setSetting('smtp_host', dto.host, 'email');
    await this.setSetting('smtp_port', dto.port.toString(), 'email');
    await this.setSetting('smtp_secure', dto.secure.toString(), 'email');
    await this.setSetting('smtp_user', dto.user, 'email');
    await this.setSetting('smtp_pass', dto.pass, 'email');
    await this.setSetting('smtp_from', dto.from, 'email');

    this.emailService.configure({
      host: dto.host,
      port: dto.port,
      secure: dto.secure,
      auth: { user: dto.user, pass: dto.pass },
      from: dto.from,
    });
  }

  async getEmailConfig(): Promise<EmailConfigResponse> {
    const [host, port, secure, user, from] = await Promise.all([
      this.getSetting('smtp_host'),
      this.getSetting('smtp_port'),
      this.getSetting('smtp_secure'),
      this.getSetting('smtp_user'),
      this.getSetting('smtp_from'),
    ]);

    return {
      host,
      port: port ? parseInt(port) : 587,
      secure: secure === 'true',
      user,
      from,
      configured: !!host,
    };
  }

  async loadEmailConfig(): Promise<void> {
    const config = await this.getEmailConfig();
    if (config.configured && config.host && config.user) {
      const pass = await this.getSetting('smtp_pass');
      this.emailService.configure({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: { user: config.user, pass: pass || '' },
        from: config.from || 'noreply@servicedesk.com',
      });
    }
  }

  isEmailConfigured(): boolean {
    return this.emailService.isEmailConfigured();
  }

  async sendTestEmail(to: string): Promise<boolean> {
    return this.emailService.sendTestEmail(to);
  }
}
