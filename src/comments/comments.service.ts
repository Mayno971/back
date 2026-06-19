import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { User } from 'src/users/user.entity';
import { Event } from 'src/events/event.entity';
import { EventsService } from 'src/events/events.service';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    private eventsService: EventsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async findByEvent(eventId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { event: { id: eventId } },
      relations: {
        author: true,
      },
      order: { createdAt: 'ASC' },
    });
  }

  async create(eventId: string, content: string, userId: string): Promise<Comment> {
    const comment = this.commentsRepository.create({
      content,
      event: { id: eventId } as Event,
      author: { id: userId } as User,
    });

    const saved = await this.commentsRepository.save(comment);

    // reload with author and event relations using object syntax
    const loaded = await this.commentsRepository.findOne({ 
      where: { id: saved.id }, 
      relations: {
        author: true,
        event: true,
      } 
    }) as Comment;

    // Notify relevant users in real-time via NotificationsGateway
    try {
      const event = await this.eventsService.findOneOrFail(eventId);
      const recipients = new Set<string>();

      if (event.creator && event.creator.id) recipients.add(String(event.creator.id));
      if (event.invitations && Array.isArray(event.invitations)) {
        for (const inv of event.invitations) {
          if (inv.user && inv.user.id) recipients.add(String(inv.user.id));
        }
      }
      // remove author from recipients to avoid sending to the author if desired
      recipients.delete(String(userId));

      const payload = {
        type: 'comment',
        eventId,
        comment: {
          id: loaded.id,
          authorId: loaded.author?.id,
          authorName: loaded.author ? (loaded.author.firstName && loaded.author.lastName ? `${loaded.author.firstName} ${loaded.author.lastName}` : (loaded.author.firstName || loaded.author.email)) : undefined,
          content: loaded.content,
          createdAt: loaded.createdAt,
        },
      };

      for (const uid of recipients) {
        try {
          this.notificationsGateway.sendToUser(uid, payload);
        } catch (e) {
          this.logger.warn(`Failed to notify user ${uid} for comment ${loaded.id}`);
        }
      }
    } catch (e) {
      this.logger.warn(`Real-time notification failed for comment ${saved.id}: ${String(e)}`);
    }

    return loaded;
  }
}