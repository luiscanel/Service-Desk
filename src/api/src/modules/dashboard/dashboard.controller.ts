import { Controller, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('widgets')
  @ApiOperation({ summary: 'Get dashboard widgets' })
  getWidgets(@Body('userId') userId: string) {
    return this.dashboardService.getWidgets(userId);
  }

  @Get('widget-types')
  @ApiOperation({ summary: 'Get available widget types' })
  getWidgetTypes() {
    return this.dashboardService.getWidgetTypes();
  }
}
