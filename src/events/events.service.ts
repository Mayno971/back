import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  async findAll(): Promise<Event[]> {
    return this.eventsRepository.find();
  }

  async create(eventData: Partial<Event>): Promise<Event> {
    const newEvent = this.eventsRepository.create(eventData);
    return this.eventsRepository.save(newEvent);
  }

  async findOne(id: number): Promise<Event | null> {
    return this.eventsRepository.findOne({ where: { id } });
  }

  async addParticipant(eventId: number, userId: number): Promise<Event | null> {
    const event = await this.findOne(eventId);
    if (!event) return null;
    
    const participantIds = event.participantIds || [];
    if (!participantIds.includes(userId)) {
      participantIds.push(userId);
      event.participantIds = participantIds;
      return this.eventsRepository.save(event);
    }
    return event;
  }
}