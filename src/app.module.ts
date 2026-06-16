import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { PostsModule } from './posts/posts.module';
import Joi, * as joi from "joi";
import appConfig from './config/app.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './posts/entities/post.entity';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entitties/user.entity';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { FileUploadModule } from './file-upload/file-upload.module';
import { File } from './file-upload/entities/file.entity';
@Module({
  imports: [UserModule,
    ConfigModule.forRoot({
      isGlobal:true,
    //  load:[appConfig]
    }
    ),
    PostsModule,
    TypeOrmModule.forRoot({
      type:'postgres',
      host:'localhost',
      port:5432,
      username:'postgres',
      password:'Bloodsport19',
      database:'nestjs-full-project',
      entities:[Post,User,File],
      synchronize:true
    }),
    AuthModule,
    ThrottlerModule.forRoot([
      {
        ttl:60000,
        limit:5
      }
    ]),
    CacheModule.register({
      isGlobal:true,
      ttl:30000,
      max:100
    }),
    FileUploadModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
