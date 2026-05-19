import { Controller, Get, Req, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('search')
  async searchUsers(@Req() req: AuthRequest, @Query('q') query?: string) {
    const users = await this.usersService.findAll(req.user.id, query);
    return users.map(u => this.usersService.sanitize(u));
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: AuthRequest) {
    const user = await this.usersService.findByIdOrFail(req.user.id);
    return this.usersService.sanitize(user);
  }
}
