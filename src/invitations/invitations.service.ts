import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Invitation, InvitationStatus } from './invitation.entity';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
  ) {}

  async getUserInvitations(userId: string) {
    return this.invitationRepository.find({
      where: {
        user: { id: userId },
      },

      relations: {
        event: {
          creator: true,
        },
      },
    });
  }

  async accept(id: string, userId: string) {
    const invitation = await this.invitationRepository.findOne({
      where: { id },
      relations: {
        user: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation introuvable');
    }

    if (invitation.user.id !== userId) {
      throw new ForbiddenException('Tu ne peux pas accepter cette invitation');
    }

    invitation.status = InvitationStatus.ACCEPTED;

    return this.invitationRepository.save(invitation);
  }

  async decline(id: string, userId: string) {
    const invitation = await this.invitationRepository.findOne({
      where: { id },

      relations: {
        user: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation introuvable');
    }

    if (invitation.user.id !== userId) {
      throw new ForbiddenException('Tu ne peux pas refuser cette invitation');
    }

    invitation.status = InvitationStatus.DECLINED;

    return this.invitationRepository.save(invitation);
  }
}
