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