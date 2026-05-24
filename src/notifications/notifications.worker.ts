import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';

@Processor('notifications')
@Injectable()
export class NotificationsWorker extends WorkerHost {
  private readonly logger = new Logger(NotificationsWorker.name);

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
    // Next Phase: Read preferences and send via WebSocket/Email
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
