import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Event } from './event.entity';
import { Invitation } from '../invitations/invitation.entity';
import { UsersService } from '../users/users.service';
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
    return this.eventsRepository.save(event);
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
}
