import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return user;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findAll(currentUserId?: string, query?: string): Promise<User[]> {
    const qb = this.usersRepository.createQueryBuilder('user');
    if (currentUserId) {
      qb.andWhere('user.id != :currentUserId', { currentUserId });
    }
    if (query) {
      qb.andWhere(
        '(LOWER(user.firstName) LIKE LOWER(:query) OR LOWER(user.lastName) LIKE LOWER(:query) OR LOWER(user.email) LIKE LOWER(:query))',
        { query: `%${query}%` }
      );
    }
    qb.limit(20);
    return qb.getMany();
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, data);
    return this.findByIdOrFail(id);
  }
  sanitize(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
