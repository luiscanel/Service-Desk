import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@Controller('api/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all settings' })
  async getAllSettings() {
    const settings = await this.settingsService.getAllSettings();
    return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
  }

  @Get('email')
  @ApiOperation({ summary: 'Get email configuration' })
  async getEmailConfig() {
    return this.settingsService.getEmailConfig();
  }

  @Post('email')
  @ApiOperation({ summary: 'Save email configuration' })
  async saveEmailConfig(@Body() config: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
  }) {
    await this.settingsService.saveEmailConfig(config);
    return { message: 'Configuración guardada' };
  }

  @Post('email/test')
  @ApiOperation({ summary: 'Send test email' })
  async sendTestEmail(@Body() body: { to: string }) {
    const configured = this.settingsService.isEmailConfigured();
    if (!configured) {
      return { success: false, message: 'SMTP no configurado' };
    }
    const result = await this.settingsService.sendTestEmail(body.to);
    return { success: result, message: result ? 'Email enviado' : 'Error al enviar' };
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get setting by key' })
  async getSetting(@Param('key') key: string) {
    const value = await this.settingsService.getSetting(key);
    return { key, value };
  }

  @Put(':key')
  @ApiOperation({ summary: 'Update setting' })
  async updateSetting(@Param('key') key: string, @Body() body: { value: string; category?: string }) {
    const setting = await this.settingsService.setSetting(key, body.value, body.category);
    return setting;
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete setting' })
  async deleteSetting(@Param('key') key: string) {
    return { message: 'Setting deleted' };
  }
}
