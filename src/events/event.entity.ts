import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Invitation } from '../invitations/invitation.entity';
import { User } from '../users/user.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  date: string;

  @Column()
  hour: string;

  @Column({ nullable: true })
  locationName: string;

  @Column()
  address: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ type: 'simple-json', nullable: true })
  participantIds: string[];

  @ManyToOne(() => User, (user) => user.events, { onDelete: 'CASCADE' })
  creator: User;

  @OneToMany(() => Invitation, (inv) => inv.event, {
    cascade: true,
  })
  invitations: Invitation[];
}
