import { Invitation } from 'src/invitations/invitation.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

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

  @Column({ nullable: true })
  createdByUserId: number;

  @Column({ type: 'simple-json', nullable: true })
  participantIds: number[];
  creator: any;

  @OneToMany(() => Invitation, (inv) => inv.event, {
    cascade: true,
  })
  invitations: Invitation[];
}
