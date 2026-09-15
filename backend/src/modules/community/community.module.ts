import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityPost } from './entities/community-post.entity';
import { PostLike } from './entities/post-like.entity';
import { PostComment } from './entities/post-comment.entity';
import { PostReport } from './entities/post-report.entity';
import { CommunityAnnouncement } from './entities/community-announcement.entity';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommunityPost,
      PostLike,
      PostComment,
      PostReport,
      CommunityAnnouncement,
    ]),
  ],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
