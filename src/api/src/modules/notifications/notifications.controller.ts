import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('api/notifications')
export class NotificationsController {
  
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener notificaciones del usuario' })
  getNotifications() {
    // Retorna array vacío por ahora - las notificaciones vienen por WebSocket
    return [];
  }

  @Post(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Marcar notificación como leída' })
  markAsRead(@Param('id') id: string) {
    return { success: true };
  }

  @Post('read-all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  markAllAsRead() {
    return { success: true };
  }
}
