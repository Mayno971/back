import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { NotificationPreference } from '../notifications/entities/notification-preference.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, NotificationPreference])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
