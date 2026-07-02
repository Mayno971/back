import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Event } from 'src/events/event.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string | undefined;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  author: User | undefined;

  @ManyToOne(() => Event, (event) => event.id, { onDelete: 'CASCADE' })
  event: Event | undefined;

  @Column({ type: 'text' })
  content: string | undefined;

  @CreateDateColumn()
  createdAt: Date | undefined;
}
