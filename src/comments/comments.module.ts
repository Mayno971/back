import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './comment.entity';
import { EventsModule } from 'src/events/events.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

import { CommentAuthorOnlyGuard } from 'src/auth/comment-author-only.guard';
import { CommentPermissionsGuard } from 'src/auth/comment-permissions.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), EventsModule, NotificationsModule],
  providers: [CommentsService, CommentPermissionsGuard, CommentAuthorOnlyGuard],
  controllers: [CommentsController],
  exports: [CommentsService],
})
export class CommentsModule {}
