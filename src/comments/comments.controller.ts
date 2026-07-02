import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req, Delete, HttpCode } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CommentPermissionsGuard } from 'src/auth/comment-permissions.guard';
import { CommentAuthorOnlyGuard } from 'src/auth/comment-author-only.guard';
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

  @Patch(':commentId')
  @UseGuards(JwtAuthGuard, CommentAuthorOnlyGuard)
  async updateComment(@Param('commentId') commentId: string, @Body() body: { content: string }) {
    return this.commentsService.update(commentId, body.content);
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard, CommentPermissionsGuard)
  @HttpCode(204)
  async deleteComment(@Param('commentId') commentId: string) {
    await this.commentsService.remove(commentId);
  }
}
