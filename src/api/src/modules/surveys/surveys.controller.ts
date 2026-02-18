import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SurveysService } from './surveys.service';

@ApiTags('Surveys')
@Controller('api/surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Get()
  @ApiOperation({ summary: 'Get all surveys' })
  async findAll() {
    return this.surveysService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get survey statistics' })
  async getStats() {
    return this.surveysService.getStats();
  }

  @Get('ticket/:ticketId')
  @ApiOperation({ summary: 'Get survey by ticket' })
  async findByTicket(@Param('ticketId') ticketId: string) {
    return this.surveysService.findByTicket(ticketId);
  }

  @Post(':id/respond')
  @ApiOperation({ summary: 'Respond to survey' })
  async respond(
    @Param('id') id: string,
    @Body() body: { rating: number; feedback?: string; wouldRecommend?: boolean },
  ) {
    return this.surveysService.respond(id, body.rating, body.feedback, body.wouldRecommend);
  }

  @Post('auto-send')
  @ApiOperation({ summary: 'Auto send pending surveys' })
  async autoSend() {
    await this.surveysService.autoSendPendingSurveys();
    return { success: true };
  }
}
