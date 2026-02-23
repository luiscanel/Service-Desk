import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Gamification')
@ApiBearerAuth()
@Controller('gamification')
@UseGuards(JwtAuthGuard)
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
  getAgentStats(@Param('agentId') agentId: string) {
    return this.gamificationService.getMyStats(agentId);
  }

  @Post('ticket-resolved/:agentId')
  @ApiOperation({ summary: 'Record ticket resolved' })
  onTicketResolved(@Param('agentId') agentId: string) {
    return this.gamificationService.onTicketResolved(agentId, 2);
  }
}
