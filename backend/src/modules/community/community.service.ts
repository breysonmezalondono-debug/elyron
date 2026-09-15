import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityPost } from './entities/community-post.entity';
import { PostLike } from './entities/post-like.entity';
import { PostComment } from './entities/post-comment.entity';
import { PostReport } from './entities/post-report.entity';
import { CommunityAnnouncement } from './entities/community-announcement.entity';
import {
  CreateCommunityPostDto,
  UpdateCommunityPostDto,
  CreateCommentDto,
  CreateReportDto,
  CreateCommunityAnnouncementDto,
} from './dto/community.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(CommunityPost)
    private readonly postRepo: Repository<CommunityPost>,
    @InjectRepository(PostLike)
    private readonly likeRepo: Repository<PostLike>,
    @InjectRepository(PostComment)
    private readonly commentRepo: Repository<PostComment>,
    @InjectRepository(PostReport)
    private readonly reportRepo: Repository<PostReport>,
    @InjectRepository(CommunityAnnouncement)
    private readonly announcementRepo: Repository<CommunityAnnouncement>,
  ) {}

  async createPost(
    dto: CreateCommunityPostDto,
    authorId: string,
  ): Promise<CommunityPost> {
    const post = this.postRepo.create({ ...dto, authorId });
    return this.postRepo.save(post);
  }

  async findAllPosts(pagination: PaginationDto) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const [data, total] = await this.postRepo.findAndCount({
      where: { isVisible: true },
      relations: { author: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async findOnePost(id: string): Promise<CommunityPost> {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: { author: true },
    });
    if (!post) throw new NotFoundException('Publicación no encontrada');
    return post;
  }

  async findPostsByAuthor(authorId: string, pagination: PaginationDto) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const [data, total] = await this.postRepo.findAndCount({
      where: { authorId },
      relations: { author: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async likePost(
    id: string,
    userId: string,
  ): Promise<{ liked: boolean; likesCount: number }> {
    return this.postRepo.manager.transaction(async (manager) => {
      const post = await manager.findOne(CommunityPost, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!post) throw new NotFoundException('Publicación no encontrada');
      const existing = await manager.findOne(PostLike, {
        where: { postId: id, userId },
      });
      if (existing) {
        await manager.remove(existing);
        if (post.likesCount > 0) {
          await manager.decrement(CommunityPost, { id }, 'likesCount', 1);
        }
        return { liked: false, likesCount: Math.max(0, post.likesCount - 1) };
      }
      await manager.insert(PostLike, { postId: id, userId });
      await manager.increment(CommunityPost, { id }, 'likesCount', 1);
      return { liked: true, likesCount: post.likesCount + 1 };
    });
  }

  async reportPost(
    postId: string,
    dto: CreateReportDto,
    user: { id: string; role?: string; firstName?: string; lastName?: string },
  ): Promise<PostReport> {
    const post = await this.findOnePost(postId);
    const authorName =
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.id;
    const report = this.reportRepo.create({
      postId,
      reason: dto.reason,
      reportedBy: user.id,
      reportedByRole: user.role || 'unknown',
      authorName,
      contentExcerpt: post.content.substring(0, 200),
    });
    return this.reportRepo.save(report);
  }

  async addComment(
    postId: string,
    dto: CreateCommentDto,
  ): Promise<PostComment> {
    await this.findOnePost(postId);
    const comment = this.commentRepo.create({ ...dto, postId });
    const saved = await this.commentRepo.save(comment);
    await this.postRepo.increment({ id: postId }, 'commentsCount', 1);
    return saved;
  }

  async getComments(postId: string, pagination: PaginationDto) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const [data, total] = await this.commentRepo.findAndCount({
      where: { postId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'ASC' },
    });
    return { data, total, page, limit };
  }

  async updatePost(
    id: string,
    dto: UpdateCommunityPostDto,
  ): Promise<CommunityPost> {
    await this.findOnePost(id);
    await this.postRepo.update(id, dto);
    return this.findOnePost(id);
  }

  async removePost(id: string): Promise<void> {
    await this.findOnePost(id);
    await this.postRepo.delete(id);
  }

  async findAllAnnouncements(pagination: PaginationDto) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const [data, total] = await this.announcementRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async createAnnouncement(
    dto: CreateCommunityAnnouncementDto,
  ): Promise<CommunityAnnouncement> {
    const announcement = this.announcementRepo.create(dto);
    return this.announcementRepo.save(announcement);
  }
}
