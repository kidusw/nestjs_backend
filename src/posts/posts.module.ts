import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post as PostEntity } from './entities/post.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[TypeOrmModule.forFeature([PostEntity]),AuthModule],
  controllers: [PostsController],
  providers: [PostsService]
})
export class PostsModule {}
