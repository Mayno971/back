import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EventsService } from 'src/events/events.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { InvitationStatus } from 'src/invitations/invitation.entity';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    private readonly eventsService: EventsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron('0 1 * * *') // Every day at 1 AM
  async handleCron() {
    this.logger.log('Running daily event reminder job');
    const events = await this.eventsService.findEventsForTomorrow();
    let remindersSent = 0;

    for (const event of events) {
      if (!event.invitations) continue;

      for (const invitation of event.invitations) {
        if (
          invitation.user &&
          (invitation.status === InvitationStatus.ACCEPTED ||
            invitation.status === InvitationStatus.MAYBE)
        ) {
          await this.notificationsService.createNotification({
            userId: invitation.user.id,
            type: 'REMINDER',
            title: `Rappel : ${event.title}`,
            body: `N'oubliez pas, l'événement "${event.title}" est prévu demain à ${event.hour}.`,
            actionUrl: `/evenement/${event.id}`,
          } as any);
          remindersSent++;
        }
      }
    }
    this.logger.log(`Sent ${remindersSent} event reminders`);
  }
}
