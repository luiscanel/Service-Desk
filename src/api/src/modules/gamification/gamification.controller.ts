import { Controller, Get, Post, Param, ParseUUIDPipe, Headers, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';

@ApiTags('Gamification')
@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get leaderboard' })
  getLeaderboard() {
    return this.gamificationService.getLeaderboard();
  }

  @Get('leaderboard/weekly')
  @ApiOperation({ summary: 'Get weekly leaderboard' })
  getWeeklyLeaderboard() {
    return this.gamificationService.getWeeklyLeaderboard();
  }

  @Get('achievements')
  @ApiOperation({ summary: 'Get all achievements' })
  getAchievements() {
    return this.gamificationService.getAllAchievements();
  }

  @Get('stats/:agentId')
  @ApiOperation({ summary: 'Get agent stats' })
  getAgentStats(@Param('agentId', ParseUUIDPipe) agentId: string) {
    return this.gamificationService.getMyStats(agentId);
  }

  @Post('ticket-resolved/:agentId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Record ticket resolved' })
  onTicketResolved(
    @Param('agentId', ParseUUIDPipe) agentId: string,
  ) {
    return this.gamificationService.onTicketResolved(agentId, 2);
  }
}
