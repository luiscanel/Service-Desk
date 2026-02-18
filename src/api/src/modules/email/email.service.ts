import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

@Injectable()
export class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured = false;

  configure(config: EmailConfig) {
    try {
      this.transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: config.auth,
      });
      this.isConfigured = true;
      console.log('✅ Email service configured:', config.host);
    } catch (error) {
      console.error('❌ Failed to configure email service:', error);
      this.isConfigured = false;
    }
  }

  isEmailConfigured(): boolean {
    return this.isConfigured;
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.warn('⚠️ Email service not configured');
      return false;
    }

    try {
      const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;
      
      const info = await this.transporter.sendMail({
        from: options.from || 'noreply@servicedesk.com',
        to: recipients,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      });

      console.log('✅ Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  // Templates de email
  async sendTicketCreated(to: string, ticket: any): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `🎫 Nuevo Ticket Creado: ${ticket.ticketNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Nuevo Ticket Creado</h2>
          <p>Se ha creado un nuevo ticket en el sistema de Service Desk.</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Ticket:</strong> ${ticket.ticketNumber}</p>
            <p><strong>Título:</strong> ${ticket.title}</p>
            <p><strong>Descripción:</strong> ${ticket.description}</p>
            <p><strong>Prioridad:</strong> ${ticket.priority}</p>
            <p><strong>Categoría:</strong> ${ticket.category}</p>
            <p><strong>Estado:</strong> ${ticket.status}</p>
          </div>
          <p style="color: #64748b; font-size: 14px;">
            Puedes responder a este email o acceder al sistema para más detalles.
          </p>
        </div>
      `,
    });
  }

  async sendTicketAssigned(to: string, ticket: any, agentName: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `📋 Ticket Asignado: ${ticket.ticketNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Ticket Asignado</h2>
          <p>Tu ticket ha sido asignado a un agente.</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Ticket:</strong> ${ticket.ticketNumber}</p>
            <p><strong>Título:</strong> ${ticket.title}</p>
            <p><strong>Agente:</strong> ${agentName}</p>
            <p><strong>Estado:</strong> ${ticket.status}</p>
          </div>
          <p style="color: #64748b; font-size: 14px;">
            El agente asignado se comunicará contigo pronto.
          </p>
        </div>
      `,
    });
  }

  async sendTicketResolved(to: string, ticket: any): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `✅ Ticket Resuelto: ${ticket.ticketNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Ticket Resuelto</h2>
          <p>Tu ticket ha sido marcado como resuelto.</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Ticket:</strong> ${ticket.ticketNumber}</p>
            <p><strong>Título:</strong> ${ticket.title}</p>
            <p><strong>Estado:</strong> Resuelto</p>
          </div>
          <p style="color: #64748b; font-size: 14px;">
            Si tienes alguna consulta, puedes reopen el ticket o crear uno nuevo.
          </p>
        </div>
      `,
    });
  }

  async sendTestEmail(to: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: '📧 Prueba de Configuración - Service Desk',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">✅ Configuración Exitosa</h2>
          <p>El sistema de emails está funcionando correctamente.</p>
          <p style="color: #64748b; font-size: 14px;">
            Recibiste este email porque probaste la configuración SMTP en Service Desk.
          </p>
        </div>
      `,
    });
  }
}
