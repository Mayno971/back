import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Event } from './event.entity';
import { Invitation } from '../invitations/invitation.entity';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateEventDto } from './dto/create-event.dto';
import { EventStatus } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,

    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,

    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(): Promise<Event[]> {
    return this.eventsRepository.find({
      relations: { 
        creator: true, 
        invitations: {
          user: true,
        }
      },
    });
  }

  async create(dto: CreateEventDto, userId: string): Promise<Event> {
    const { guests, ...eventData } = dto;

    const creator = await this.usersService.findByIdOrFail(userId);

    const event = this.eventsRepository.create({
      ...eventData,
      creator,
    });

    const savedEvent = await this.eventsRepository.save(event);

    if (guests?.length) {
      const invitations = guests.map((guestId) =>
        this.invitationRepository.create({
          user: { id: guestId },
          event: savedEvent,
        }),
      );

      await this.invitationRepository.save(invitations);
      // create a notification for each invited guest
      try {
        const creatorName = creator.firstName || creator.email || 'Quelqu\'un';
        for (const guestId of guests) {
          try {
            await this.notificationsService.createNotification({
              userId: String(guestId),
              type: 'INVITE',
              title: `Invitation: ${savedEvent.title}`,
              body: `${creatorName} vous a invité à l'événement.`,
              actionUrl: `/evenement/${savedEvent.id}`,
            } as any);
          } catch (e) {
            // ignore per-user notification failures
          }
        }
      } catch (e) {
        // ignore overall notification errors
      }
    }

    return this.findOneOrFail(savedEvent.id!);
  }

  async cancelEvent(eventId: string, userId: string) {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
      relations: { creator: true },
    });
    
    if (!event) {
      throw new NotFoundException('Event non trouvé');
    }
    if (!event.creator || event.creator.id !== userId) {
      throw new NotFoundException('Vous n\'êtes pas autorisé à annuler cet événement');
    }
    
    event.status = EventStatus.CANCELED;
    const saved = await this.eventsRepository.save(event);

    // notify all invited users that the event was cancelled
    try {
      const reloaded = await this.findOneOrFail(eventId);
      const recipients = new Set<string>();
      if (reloaded.invitations && Array.isArray(reloaded.invitations)) {
        for (const inv of reloaded.invitations) {
          if (inv.user && inv.user.id) recipients.add(String(inv.user.id));
        }
      }

      for (const uid of recipients) {
        try {
          await this.notificationsService.createNotification({
            userId: uid,
            type: 'CANCEL',
            title: `Événement annulé: ${saved.title}`,
            body: `L'événement ${saved.title} a été annulé par l'organisateur.`,
            actionUrl: `/evenement/${saved.id}`,
          } as any);
        } catch (e) {
          // ignore per-user notification failures
        }
      }
    } catch (e) {
      // ignore notification flow errors
    }

    return saved;
  }

  async findOneOrFail(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },

      relations: {
        creator: true,
        invitations: {
          user: true,
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event non trouvé');
    }

    return event;
  }

  async findEventsForTomorrow(): Promise<Event[]> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];

    return this.eventsRepository.find({
      where: {
        date: tomorrowString,
        status: EventStatus.PLANNED,
      },
      relations: {
        invitations: {
          user: true,
        },
      },
    });
  }
}
