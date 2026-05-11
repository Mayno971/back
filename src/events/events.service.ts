import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  private events: any[] = [];

  create(createEventDto: CreateEventDto) {
    const newEvent = {
      id: Date.now(),
      ...createEventDto,
    };

    this.events.push(newEvent);
    return newEvent;
  }

  findAll() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.events;
  }

  findOne(id: number) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return this.events.find((event) => event.id === id);
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const index = this.events.findIndex((event) => event.id === id);

    if (index === -1) return null;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.events[index] = {
      ...this.events[index],
      ...updateEventDto,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.events[index];
  }

  remove(id: number) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const index = this.events.findIndex((event) => event.id === id);

    if (index === -1) return null;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [deleted] = this.events.splice(index, 1);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return deleted;
  }
}
