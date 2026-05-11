import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  private userId = 2;

  @Post(':id/accept')
  accept(@Param('id') id: string) {
    return this.invitationsService.accept(+id, this.userId);
  }

  @Post(':id/decline')
  decline(@Param('id') id: string) {
    return this.invitationsService.decline(+id, this.userId);
  }
}
