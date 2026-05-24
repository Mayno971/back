import { Invitation } from 'src/invitations/invitation.entity';
import { User } from 'src/users/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { EventStatus } from './entities/event.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  title?: string;

  @Column()
  date?: string;

  @Column()
  hour?: string;

  @Column({ nullable: true })
  locationName?: string;

  @Column()
  address?: string;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column({ nullable: true })
  createdByUserId?: number;

  @Column({ type: 'simple-json', nullable: true })
  participantIds?: number[];
  @ManyToOne(() => User, (user) => user.events)
  creator?: User;

  @OneToMany(() => Invitation, (inv) => inv.event, {
    cascade: true,
  })
  invitations?: Invitation[];

  @Column({ type: 'varchar', default: EventStatus.PLANNED })
  status: EventStatus;
}
