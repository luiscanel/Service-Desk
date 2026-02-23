import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('api/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('trend')
  @ApiOperation({ summary: 'Get tickets trend for charts' })
  getTrend() {
    return this.dashboardService.getTicketsTrend(7);
  }

  @Get('by-category')
  @ApiOperation({ summary: 'Get tickets by category' })
  getByCategory() {
    return this.dashboardService.getTicketsByCategory();
  }

  @Get('top-agents')
  @ApiOperation({ summary: 'Get top performing agents' })
  getTopAgents() {
    return this.dashboardService.getTopAgents(5);
  }

  @Get('widgets')
  @ApiOperation({ summary: 'Get dashboard widgets' })
  getWidgets() {
    return this.dashboardService.getWidgets('');
  }

  @Get('widget-types')
  @ApiOperation({ summary: 'Get available widget types' })
  getWidgetTypes() {
    return this.dashboardService.getWidgetTypes();
  }
}
