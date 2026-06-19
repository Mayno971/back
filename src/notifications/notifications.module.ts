import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsWorker } from './notifications.worker';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
    }),
    TypeOrmModule.forFeature([Notification, NotificationPreference]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsWorker, NotificationsService, NotificationsGateway],
  exports: [BullModule, NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
