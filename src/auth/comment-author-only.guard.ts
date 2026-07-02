import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CommentsService } from 'src/comments/comments.service';

@Injectable()
export class CommentAuthorOnlyGuard implements CanActivate {
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

    if (comment.author?.id !== user.id) {
      throw new ForbiddenException('You are not the author of this comment');
    }

    return true;
  }
}
