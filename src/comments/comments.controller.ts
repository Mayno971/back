import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: { id: string };
}

@Controller('events/:eventId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  async getForEvent(@Param('eventId') eventId: string) {
    const comments = await this.commentsService.findByEvent(eventId);
    return comments.map((c) => ({
      id: c.id,
      eventId: c.event?.id,
      authorId: c.author?.id,
      authorName: c.author ? (c.author.firstName && c.author.lastName ? `${c.author.firstName} ${c.author.lastName}` : (c.author.firstName || c.author.email)) : undefined,
      content: c.content,
      createdAt: c.createdAt,
    }));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async postForEvent(@Param('eventId') eventId: string, @Body() body: { content: string }, @Req() req: AuthRequest) {
    const c = await this.commentsService.create(eventId, body.content, req.user.id);
    return {
      id: c.id,
      eventId: c.event?.id,
      authorId: c.author?.id,
      authorName: c.author ? (c.author.firstName && c.author.lastName ? `${c.author.firstName} ${c.author.lastName}` : (c.author.firstName || c.author.email)) : undefined,
      content: c.content,
      createdAt: c.createdAt,
    };
  }
}
