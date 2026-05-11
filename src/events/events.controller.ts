import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as getUserDecorator from '../auth/get-user.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles(Role.ORGANIZER)
  create(
    @Body() dto: CreateEventDto,
    @getUserDecorator.GetUser() user: getUserDecorator.AuthenticatedUser,
  ) {
    return this.eventsService.create(dto, user.userId);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @Patch(':id/publish')
  @Roles(Role.ORGANIZER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @getUserDecorator.GetUser() user: getUserDecorator.AuthenticatedUser,
  ) {
    return this.eventsService.update(+id, dto, user.userId);
  }

  @Patch(':id/publish')
  publish(
    @Param('id') id: string,
    @getUserDecorator.GetUser() user: getUserDecorator.AuthenticatedUser,
  ) {
    return this.eventsService.publish(+id, user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @getUserDecorator.GetUser() user: getUserDecorator.AuthenticatedUser,
  ) {
    return this.eventsService.remove(+id, user.userId);
  }
}
