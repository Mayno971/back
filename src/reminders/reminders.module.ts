import { Module } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { EventsModule } from 'src/events/events.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [EventsModule, NotificationsModule],
  providers: [RemindersService],
})
export class RemindersModule {}
