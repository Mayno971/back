import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

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
}
