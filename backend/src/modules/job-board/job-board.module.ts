import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobListing } from './entities/job-listing.entity';
import { JobBoardService } from './job-board.service';
import { JobBoardController } from './job-board.controller';
@Module({
  imports: [TypeOrmModule.forFeature([JobListing])],
  controllers: [JobBoardController],
  providers: [JobBoardService],
  exports: [JobBoardService],
})
export class JobBoardModule {}
