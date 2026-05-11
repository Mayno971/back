import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from './roles.enum';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}
  private users = [
    {
      id: 1,
      email: 'org@test.com',
      passwordHash: bcrypt.hashSync('password123', 10),
      role: Role.ORGANIZER,
    },
    {
      id: 2,
      email: 'user@test.com',
      passwordHash: bcrypt.hashSync('password123', 10),
      role: Role.PARTICIPANT,
    },
  ];

  async login(email: string, password: string) {
    const user = this.users.find((u) => u.email === email);

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
