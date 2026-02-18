import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../tickets/entities/ticket.entity';

export interface Attachment {
  id: string;
  ticketId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedBy: string;
  createdAt: Date;
}

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,
  ) {}

  // Store attachments as base64 in ticket for simplicity
  // In production, use S3/MinIO/Cloud storage
  async addAttachment(
    ticketId: string,
    file: { fileName: string; originalName: string; mimeType: string; size: number; data: string },
    uploadedBy: string,
  ): Promise<any> {
    const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
    if (!ticket) return null;

    const attachment: Attachment = {
      id: Date.now().toString(),
      ticketId,
      fileName: file.fileName,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      path: `/uploads/${file.fileName}`,
      uploadedBy,
      createdAt: new Date(),
    };

    const attachments = (ticket as any).attachments || [];
    attachments.push(attachment);
    await this.ticketRepo.update(ticketId, { attachments } as any);

    return attachment;
  }

  async getAttachments(ticketId: string): Promise<Attachment[]> {
    const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
    if (!ticket) return [];
    return (ticket as any).attachments || [];
  }

  async deleteAttachment(ticketId: string, attachmentId: string): Promise<boolean> {
    const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
    if (!ticket) return false;

    const attachments = (ticket as any).attachments || [];
    const filtered = attachments.filter((a: Attachment) => a.id !== attachmentId);
    await this.ticketRepo.update(ticketId, { attachments: filtered } as any);

    return true;
  }
}
