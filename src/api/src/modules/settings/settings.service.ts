import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { EmailService, EmailConfig } from '../email/email.service';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>,
    private emailService: EmailService,
  ) {}

  async onModuleInit() {
    await this.loadEmailConfig();
  }

  async getSetting(key: string): Promise<string | null> {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    return setting?.value || null;
  }

  async setSetting(key: string, value: string, category: string = 'general'): Promise<Setting> {
    let setting = await this.settingsRepository.findOne({ where: { key } });
    
    if (setting) {
      setting.value = value;
      setting.category = category;
    } else {
      setting = this.settingsRepository.create({ key, value, category });
    }
    
    return this.settingsRepository.save(setting);
  }

  async getAllSettings(): Promise<Setting[]> {
    return this.settingsRepository.find();
  }

  async getSettingsByCategory(category: string): Promise<Setting[]> {
    return this.settingsRepository.find({ where: { category } });
  }

  // Email Settings
  async saveEmailConfig(config: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
  }): Promise<void> {
    await this.setSetting('smtp_host', config.host, 'email');
    await this.setSetting('smtp_port', config.port.toString(), 'email');
    await this.setSetting('smtp_secure', config.secure.toString(), 'email');
    await this.setSetting('smtp_user', config.user, 'email');
    await this.setSetting('smtp_pass', config.pass, 'email');
    await this.setSetting('smtp_from', config.from, 'email');

    // Configure email service
    this.emailService.configure({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
      from: config.from,
    });
  }

  async getEmailConfig(): Promise<any> {
    const host = await this.getSetting('smtp_host');
    const port = await this.getSetting('smtp_port');
    const secure = await this.getSetting('smtp_secure');
    const user = await this.getSetting('smtp_user');
    const from = await this.getSetting('smtp_from');

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
