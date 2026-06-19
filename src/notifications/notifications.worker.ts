import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';


@Processor('notifications')
@Injectable()
export class NotificationsWorker extends WorkerHost {
  private readonly logger = new Logger(NotificationsWorker.name);

  constructor(private gateway: NotificationsGateway) { super(); }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    const { eventType, data } = job.data;

    switch (eventType) {
      case 'INVITATION_CREATED':
        await this.handleInvitationCreated(data);
        break;
      case 'EVENT_CANCELLED':
        await this.handleEventCancelled(data);
        break;
      case 'INVITATION_ACCEPTED':
      case 'INVITATION_DECLINED':
        await this.handleInvitationStatusUpdate(eventType, data);
        break;
      default:
        this.logger.warn(`Unknown event type: ${eventType}`);
    }

    return {};
  }

  private async handleInvitationCreated(data: any) {
    this.logger.log(`Handling INVITATION_CREATED for user ${data.targetUserId}`);
    // Send to user via websocket if available
    try {
      // normalize targetUserId to string for consistent routing
      this.gateway?.sendToUser(String(data.targetUserId), { eventType: 'INVITATION_CREATED', data });
    } catch (e) {
      this.logger.error('Gateway send failed');
    }
  }

  private async handleEventCancelled(data: any) {
    this.logger.log(`Handling EVENT_CANCELLED for event ${data.eventId}`);
    // Next Phase
  }

  private async handleInvitationStatusUpdate(type: string, data: any) {
    this.logger.log(`Handling ${type} for event ${data.eventId} by user ${data.userId}`);
    // Next Phase
  }
}
