import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CommentsService } from 'src/comments/comments.service';

@Injectable()
export class CommentPermissionsGuard implements CanActivate {
  constructor(private readonly commentsService: CommentsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const commentId = request.params.commentId;

    if (!user || !commentId) {
      return false;
    }

    const comment = await this.commentsService.findOne(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const isAuthor = comment.author?.id === user.id;
    const isEventCreator = comment.event?.creator?.id === user.id;

    if (isAuthor || isEventCreator) {
      return true;
    }

    throw new ForbiddenException('You do not have permission to delete this comment');
  }
}
