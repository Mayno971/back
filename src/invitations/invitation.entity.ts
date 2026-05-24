import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';

import { User } from '../users/user.entity';
import { Event } from '../events/event.entity';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  MAYBE = 'maybe',
}

@Entity()
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.invitations, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Event, (event) => event.invitations, {
    onDelete: 'CASCADE',
  })
  event: Event;
  @Column({
    type: 'text',
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;
}
