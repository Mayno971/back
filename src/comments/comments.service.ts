import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { User } from 'src/users/user.entity';
import { Event } from 'src/events/event.entity';
import { EventsService } from 'src/events/events.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly eventsService: EventsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findByEvent(eventId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { event: { id: eventId } },
      relations: { author: true },
      order: { createdAt: 'ASC' },
    });
  }

  async create(eventId: string, content: string, userId: string): Promise<Comment> {
    // 1. Création et sauvegarde du commentaire de base
    const comment = this.commentsRepository.create({
      content,
      event: { id: eventId } as Partial<Event>,
      author: { id: userId } as Partial<User>,
    });

    const saved = await this.commentsRepository.save(comment);

    // 2. Rechargement complet avec les relations requises
    const loaded = await this.commentsRepository.findOne({ 
      where: { id: saved.id }, 
      relations: {
        author: true,
        event: true,
      } 
    });

    if (!loaded) {
      this.logger.error(`Failed to reload comment ${saved.id} after saving.`);
      return saved;
    }

    // 3. Gestion des notifications en tâche de fond (non bloquant pour le client)
    this.sendCommentNotifications(eventId, loaded, userId).catch((e) => {
      this.logger.error(`Asynchronous notification process failed for comment ${saved.id}: ${String(e)}`);
    });

    return loaded;
  }

  /**
   * Extrait la logique de notification pour alléger la méthode principale create()
   */
  private async sendCommentNotifications(eventId: string, loadedComment: Comment, authorId: string): Promise<void> {
    try {
      const event = await this.eventsService.findOneOrFail(eventId);
      const recipients = new Set<string>();

      // Ajout du créateur de l'événement
      if (event.creator?.id) {
        recipients.add(String(event.creator.id));
      }

      // Ajout des invités de l'événement
      if (event.invitations && Array.isArray(event.invitations)) {
        for (const inv of event.invitations) {
          if (inv.user?.id) {
            recipients.add(String(inv.user.id));
          }
        }
      }

      // On évite d'envoyer une notification à l'auteur du commentaire lui-même
      recipients.delete(String(authorId));

      const authorName = this.buildAuthorName(loadedComment.author);

      // Envoi des notifications à tous les destinataires concernés
      for (const uid of recipients) {
        try {
          await this.notificationsService.createNotification({
            userId: uid,
            type: 'COMMENT',
            title: `Nouveau commentaire sur ${event.title}`,
            body: `${authorName} a commenté : ${loadedComment.content}`,
            actionUrl: `/evenement/${event.id}#comment-${loadedComment.id}`,
          });
        } catch (e) {
          this.logger.warn(`Failed to persist/notify user ${uid} for comment ${loadedComment.id}: ${String(e)}`);
        }
      }
    } catch (e) {
      this.logger.warn(`Real-time notification setup failed for comment ${loadedComment.id}: ${String(e)}`);
    }
  }

  async findOne(commentId: string): Promise<Comment | null> {
    return this.commentsRepository.findOne({
      where: { id: commentId },
      relations: { author: true, event: { creator: true } },
    });
  }

  async remove(commentId: string): Promise<void> {
    const comment = await this.commentsRepository.findOne({ 
      where: { id: commentId },
      relations: { author: true, event: true } 
    });

    if (!comment || !comment.event?.id) {
      this.logger.warn(`Comment ${commentId} not found or has no associated event, cannot send deletion notification.`);
      // On tente quand même de supprimer au cas où...
      await this.commentsRepository.delete(commentId);
      return;
    }

    const authorId = comment.author?.id;
    const eventId = comment.event.id;

    this.sendCommentDeletedNotification(eventId, commentId, authorId).catch(e => {
      this.logger.error(`Asynchronous delete notification failed for comment ${commentId}: ${String(e)}`);
    });

    await this.commentsRepository.delete(commentId);

  }

  private async sendCommentDeletedNotification(eventId: string, commentId: string, authorId?: string): Promise<void> {
    try {
      const event = await this.eventsService.findOneOrFail(eventId);
      const recipients = new Set<string>();

      if (event.creator?.id) {
        recipients.add(String(event.creator.id));
      }
      if (event.invitations?.length) {
        for (const inv of event.invitations) {
          if (inv.user?.id) recipients.add(String(inv.user.id));
        }
      }

      // L'auteur du commentaire supprimé n'a pas besoin d'être notifié
      if (authorId) {
        recipients.delete(String(authorId));
      }

      for (const uid of recipients) {
        try {
          // Note: On n'utilise pas createNotification car on ne veut pas persister la notif,
          // on veut juste l'envoyer en temps réel via le socket.
          this.notificationsService.sendNotificationToUser(uid, {
            type: 'comment_deleted',
            eventId,
            commentId,
            title: `Un commentaire a été supprimé`,
            body: `Un commentaire sur l'évènement "${event.title}" a été supprimé.`,
          });
        } catch (e) {
          this.logger.warn(`Failed to send delete-notification to user ${uid} for comment ${commentId}: ${String(e)}`);
        }
      }
    } catch (e) {
      this.logger.error(`Real-time delete notification setup failed for comment ${commentId}: ${String(e)}`);
    }
  }

  async update(commentId: string, content: string): Promise<Comment> {
    await this.commentsRepository.update(commentId, { content });
    const updatedComment = await this.findOne(commentId);
    if (!updatedComment) {
      throw new Error('Failed to retrieve updated comment');
    }

    const eventId = updatedComment.event?.id;
    if (!eventId) {
      this.logger.warn(`Updated comment ${commentId} has no associated event, cannot send update notification.`);
    } else {
      this.sendCommentUpdatedNotification(eventId, updatedComment).catch(e => {
          this.logger.error(`Asynchronous update notification failed for comment ${commentId}: ${String(e)}`);
        });
    }

    return updatedComment;
  }

  private async sendCommentUpdatedNotification(eventId: string, updatedComment: Comment): Promise<void> {
    const event = await this.eventsService.findOneOrFail(eventId);
    const recipients = new Set<string>();

    if (event.creator?.id) recipients.add(String(event.creator.id));
    if (event.invitations?.length) {
      for (const inv of event.invitations) {
        if (inv.user?.id) recipients.add(String(inv.user.id));
      }
    }
    
    // Also notify the author of the change
    if (updatedComment.author?.id) {
        recipients.add(String(updatedComment.author.id));
    }

    for (const uid of recipients) {
      this.notificationsService.sendNotificationToUser(uid, {
        type: 'comment_updated',
        eventId,
        comment: updatedComment,
      });
    }
  }

  /**
   * Helper pour formater proprement le nom de l'auteur
   */
  private buildAuthorName(author?: User): string {
    if (!author) return "Quelqu'un";
    if (author.firstName && author.lastName) {
      return `${author.firstName} ${author.lastName}`;
    }
    return author.firstName || author.email || "Quelqu'un";
  }
}