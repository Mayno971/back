import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from './roles.enum';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  login(email: string) {
    const role = email.includes('org') ? Role.ORGANIZER : Role.PARTICIPANT;

    return {
      access_token: this.jwtService.sign({
        sub: Date.now(),
        email,
        role,
      }),
    };
  }
}
