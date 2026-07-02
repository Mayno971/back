import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Event } from '../events/event.entity';
import { Invitation } from 'src/invitations/invitation.entity';
import { Role } from 'src/auth/roles.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({
    type: 'json',
    default: [Role.USER],
  })
  roles: Role[];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @OneToMany(() => Event, (event) => event.creator)
  events: Event[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Invitation, (invitation) => invitation.user)
  invitations: Invitation[];
}

