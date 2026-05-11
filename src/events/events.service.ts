import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

export interface EventEntity {
  id: number;
  title: string;
  description?: string;
  date: string;
  location: string;

  createdByUserId: number;
  status: 'DRAFT' | 'PUBLISHED';

  participants: number[];
}

@Injectable()
export class EventsService {
  private events: EventEntity[] = [];

  create(createEventDto: CreateEventDto, userId: number): EventEntity {
    const newEvent: EventEntity = {
      id: Date.now(),
      ...createEventDto,
      createdByUserId: userId,
      status: 'DRAFT',
      participants: [],
    };

    this.events.push(newEvent);
    return newEvent;
  }

  publish(eventId: number, userId: number): EventEntity {
    const event = this.findOne(eventId);

    if (event.createdByUserId !== userId) {
      throw new ForbiddenException('Vous ne pouvez pas publier cet évènement');
    }

    event.status = 'PUBLISHED';
    return event;
  }

  findAll(): EventEntity[] {
    return this.events;
  }

  findOne(id: number): EventEntity {
    const event = this.events.find((e) => e.id === id);
    if (!event) throw new NotFoundException('Évènement introuvable');
    return event;
  }

  update(
    id: number,
    updateEventDto: UpdateEventDto,
    userId: number,
  ): EventEntity {
    const event = this.findOne(id);

    if (event.createdByUserId !== userId) {
      throw new ForbiddenException('Modification interdite');
    }

    Object.assign(event, updateEventDto);
    return event;
  }

  remove(id: number, userId: number): EventEntity {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) throw new NotFoundException();

    if (this.events[index].createdByUserId !== userId) {
      throw new ForbiddenException();
    }

    return this.events.splice(index, 1)[0];
  }

  addParticipant(eventId: number, userId: number) {
    const event = this.findOne(eventId);

    if (!event.participants.includes(userId)) {
      event.participants.push(userId);
    }
  }
}
