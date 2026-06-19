import { Body, Controller, Get, NotFoundException, Param, Post, Put, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Body as BodyDec } from '@nestjs/common';

@Controller()
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get('notifications')
  async getNotifications(@Query('userId') userId?: string) {
    if (!userId) throw new NotFoundException('userId manquant');
    return this.svc.findForUser(userId);
  }

  @Post('notifications')
  async createNotification(@BodyDec() body: CreateNotificationDto) {
    return this.svc.createNotification(body as any);
  }

  @Post('notifications/:id/read')
  async markRead(@Param('id') id: string, @Query('userId') userId?: string) {
    return this.svc.markAsRead(id, userId);
  }

  @Get('notification-preferences')
  async getPreferences(@Query('userId') userId?: string) {
    if (!userId) throw new NotFoundException('userId manquant');
    return this.svc.getPreferences(userId);
  }

  @Put('notification-preferences')
  async putPreferences(@Query('userId') userId: string, @Body() body: UpdatePreferencesDto) {
    if (!userId) throw new NotFoundException('userId manquant');
    return this.svc.updatePreferences(userId, body as any);
  }
}
