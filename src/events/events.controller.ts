import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from './event.entity';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  getAllEvents() {
    return this.eventsService.findAll();
  }

  @Post()
  // @UseGuards(JwtAuthGuard) // 🔒 À activer pour protéger la création avec votre token JWT
  createEvent(@Body() eventData: Partial<Event>) {
    return this.eventsService.create(eventData);
  }
}