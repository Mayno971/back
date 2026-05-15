import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../auth/roles.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  passwordHash: string;

  @Column({ default: Role.USER })
  role: string;
}
