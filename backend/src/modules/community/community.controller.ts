import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import {
  CreateCommunityPostDto,
  UpdateCommunityPostDto,
  CreateCommentDto,
  CreateReportDto,
  CreateCommunityAnnouncementDto,
} from './dto/community.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('comunidad')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @UseGuards(JwtAuthGuard)
  @Post('posts')
  createPost(@Body() dto: CreateCommunityPostDto, @Request() req) {
    return this.communityService.createPost(dto, req.user.id);
  }

  @Get('posts')
  findAllPosts(@Query() pagination: PaginationDto) {
    return this.communityService.findAllPosts(pagination);
  }

  @Get('posts/user/:authorId')
  findPostsByAuthor(
    @Param('authorId') authorId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.communityService.findPostsByAuthor(authorId, pagination);
  }

  @Get('posts/:id')
  findOnePost(@Param('id') id: string) {
    return this.communityService.findOnePost(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/like')
  likePost(@Param('id') id: string, @Request() req) {
    return this.communityService.likePost(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/report')
  reportPost(
    @Param('id') id: string,
    @Body() dto: CreateReportDto,
    @Request() req,
  ) {
    return this.communityService.reportPost(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/comments')
  addComment(@Param('id') id: string, @Body() dto: CreateCommentDto) {
    return this.communityService.addComment(id, dto);
  }

  @Get('posts/:id/comments')
  getComments(@Param('id') id: string, @Query() pagination: PaginationDto) {
    return this.communityService.getComments(id, pagination);
  }

  @UseGuards(JwtAuthGuard)
  @Put('posts/:id')
  updatePost(@Param('id') id: string, @Body() dto: UpdateCommunityPostDto) {
    return this.communityService.updatePost(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('posts/:id')
  removePost(@Param('id') id: string) {
    return this.communityService.removePost(id);
  }

  @Get('anuncios')
  findAllAnnouncements(@Query() pagination: PaginationDto) {
    return this.communityService.findAllAnnouncements(pagination);
  }

  @UseGuards(JwtAuthGuard)
  @Post('anuncios')
  createAnnouncement(@Body() dto: CreateCommunityAnnouncementDto) {
    return this.communityService.createAnnouncement(dto);
  }
}
