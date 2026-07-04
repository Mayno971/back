import { Controller, Get, Post, Body, UseGuards, Req, Patch, Param } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async getAllEvents() {
    return this.eventsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createEvent(@Body() dto: CreateEventDto, @Req() req: AuthRequest) {
    return this.eventsService.create(dto, req.user.id);
  }

  @Get(':id')
  async getEventById(@Param('id') id: string) {
    return this.eventsService.findOneOrFail(id);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelEvent(@Param('id') id: string, @Req() req: any) {
    // req.user.id contient l'ID de l'utilisateur connecté fourni par ton guard
    return this.eventsService.cancelEvent(id, req.user.id);
  }
}
