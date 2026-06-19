import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private preferencesRepository: Repository<NotificationPreference>,
    // optional gateway injection for real-time delivery
    private gateway?: NotificationsGateway,
  ) {}

  async findForUser(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async markAsRead(id: string, userId?: string): Promise<Notification> {
    const notif = await this.notificationsRepository.findOne({ where: { id } });
    if (!notif || (userId && notif.userId !== userId)) {
      throw new NotFoundException('Notification non trouvée');
    }
    notif.isRead = true;
    return this.notificationsRepository.save(notif);
  }

  async createNotification(payload: Partial<Notification>): Promise<Notification> {
    const n = this.notificationsRepository.create(payload as Notification);
    const saved = await this.notificationsRepository.save(n);
    try {
      if (this.gateway && typeof this.gateway.sendToUser === 'function') {
        this.gateway.sendToUser(saved.userId, saved);
      }
    } catch (e) {
      // ignore gateway errors
    }
    return saved;
  }

  async getPreferences(userId: string): Promise<NotificationPreference> {
    const prefs = await this.preferencesRepository.findOne({ where: { userId } });
    if (!prefs) throw new NotFoundException('Préférences non trouvées');
    return prefs;
  }

  async updatePreferences(userId: string, data: Partial<NotificationPreference>): Promise<NotificationPreference> {
    let prefs = await this.preferencesRepository.findOne({ where: { userId } });
    if (!prefs) {
      prefs = this.preferencesRepository.create({ userId, ...data });
    } else {
      Object.assign(prefs, data);
    }
    return this.preferencesRepository.save(prefs);
  }
}
