import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { InvitationsModule } from './invitations/invitations.module';

@Module({
  imports: [AuthModule, EventsModule, InvitationsModule],
})
export class AppModule {}
