import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AttachmentsService } from './attachments.service';

@ApiTags('Attachments')
@Controller('api/tickets/:ticketId/attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get ticket attachments' })
  async getAttachments(@Param('ticketId') ticketId: string) {
    return this.attachmentsService.getAttachments(ticketId);
  }

  @Post()
  @ApiOperation({ summary: 'Add attachment to ticket' })
  async addAttachment(
    @Param('ticketId') ticketId: string,
    @Body() body: { fileName: string; originalName: string; mimeType: string; size: number; data: string },
  ) {
    return this.attachmentsService.addAttachment(ticketId, body, 'system');
  }

  @Delete(':attachmentId')
  @ApiOperation({ summary: 'Delete attachment' })
  async deleteAttachment(
    @Param('ticketId') ticketId: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    const result = await this.attachmentsService.deleteAttachment(ticketId, attachmentId);
    return { success: result };
  }
}
