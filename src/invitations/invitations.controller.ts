import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Req,
  NotFoundException,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';
import { InvitationsService } from './invitations.service';
import { UpdateInvitationDto } from './dto/update-invitation.dto';

interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('invitations')
@UseGuards(JwtAuthGuard)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get('me')
  async getMyInvitations(@Req() req: AuthRequest) {
    return this.invitationsService.getUserInvitations(req.user.id);
  }

  @Patch(':id/accept')
  async acceptInvitation(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Body() data: UpdateInvitationDto,
  ) {
    const invitation = await this.invitationsService.accept(
      id,
      req.user.id,
      data,
    );

    if (!invitation) {
      throw new NotFoundException('Invitation non trouvée');
    }

    return invitation;
  }

  @Patch(':id/decline')
  async declineInvitation(@Param('id') id: string, @Req() req: AuthRequest) {
    const invitation = await this.invitationsService.decline(id, req.user.id);

    if (!invitation) {
      throw new NotFoundException('Invitation non trouvée');
    }

    return invitation;
  }
}
