import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('widgets')
  @ApiOperation({ summary: 'Get user dashboard widgets' })
  async getWidgets(@Body('userId') userId: string) {
    return this.dashboardService.getUserWidgets(userId);
  }

  @Get('widget-types')
  @ApiOperation({ summary: 'Get available widget types' })
  async getWidgetTypes() {
    return this.dashboardService.getAvailableWidgetTypes();
  }

  @Post('widgets')
  @ApiOperation({ summary: 'Create widget' })
  async createWidget(@Body() body: { userId: string; widgetType: string; title: string; config?: any }) {
    return this.dashboardService.createWidget(body.userId, body);
  }

  @Put('widgets/:id')
  @ApiOperation({ summary: 'Update widget' })
  async updateWidget(
    @Param('id') id: string,
    @Body() body: { userId: string; title?: string; config?: any },
  ) {
    return this.dashboardService.updateWidget(id, body.userId, body);
  }

  @Delete('widgets/:id')
  @ApiOperation({ summary: 'Delete widget' })
  async deleteWidget(@Param('id') id: string, @Body('userId') userId: string) {
    await this.dashboardService.deleteWidget(id, userId);
    return { success: true };
  }

  @Post('widgets/reorder')
  @ApiOperation({ summary: 'Reorder widgets' })
  async reorderWidgets(@Body() body: { userId: string; widgetIds: string[] }) {
    await this.dashboardService.reorderWidgets(body.userId, body.widgetIds);
    return { success: true };
  }

  @Post('widgets/:id/toggle')
  @ApiOperation({ summary: 'Toggle widget visibility' })
  async toggleWidget(@Param('id') id: string, @Body('userId') userId: string) {
    return this.dashboardService.toggleWidget(id, userId);
  }
}
