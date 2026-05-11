import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EventsService } from '../events/events.service';
import { Invitation } from './invitation.entity';

@Injectable()
export class InvitationsService {
  private invitations: Invitation[] = [];

  constructor(private readonly eventsService: EventsService) {}

  invite(eventId: number, inviterId: number, invitedUserId: number) {
    const event = this.eventsService.findOne(eventId);

    if (event.createdByUserId !== inviterId) {
      throw new ForbiddenException('Seul le créateur peut inviter');
    }

    const invitation: Invitation = {
      id: Date.now(),
      eventId,
      invitedUserId,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    this.invitations.push(invitation);
    return invitation;
  }

  accept(invitationId: number, userId: number) {
    const invitation = this.invitations.find((i) => i.id === invitationId);

    if (!invitation) throw new NotFoundException();
    if (invitation.invitedUserId !== userId) throw new ForbiddenException();
    if (invitation.status !== 'PENDING') throw new ForbiddenException();

    invitation.status = 'ACCEPTED';
    this.eventsService.addParticipant(invitation.eventId, userId);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  decline(invitationId: number, userId: number) {
    const invitation = this.invitations.find((i) => i.id === invitationId);
    if (!invitation) throw new NotFoundException();

    invitation.status = 'DECLINED';
  }
}
