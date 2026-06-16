import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import type { PostInterface } from './interfaces/post.interface';
import { CreatePostDto } from './dto/create-post.dto';
import { PostExistsPipe } from './pipes/post-exists.pipe';
import {Post as PostEntity } from './entities/post.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UpdatePostDto } from './dto/update-post.dto';
import { UserRole } from 'src/auth/entitties/user.entity';
import { RolesGaurd } from 'src/auth/guards/roles-guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FindPostsQueryDto } from './dto/find-posts.query.dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';

@Controller('posts')
export class PostsController {
    constructor(private readonly postsService:PostsService){}

    @Get()
   async findAll(@Query() query:FindPostsQueryDto):Promise<PaginatedResponse<PostEntity>>{
    
        return this.postsService.findAll(query);
    }
    
    @UseGuards(JwtAuthGuard)
    @Post('create')
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createPostData:CreatePostDto,@CurrentUser() user:any):Promise<PostEntity>{
        return this.postsService.create(createPostData,user);
    }

    @Get(":id")
   async findOne(@Param('id') id:number):Promise<PostEntity>{
    
        return this.postsService.findOne(id);
    }


    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(
        @Param('id',ParseIntPipe,PostExistsPipe) id:number,
        @Body() updatePostData:UpdatePostDto,
        @CurrentUser() user:any
    ):Promise<PostEntity>{
        return this.postsService.update(id,updatePostData,user);
    }
   
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard,RolesGaurd)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id',ParseIntPipe,PostExistsPipe) id:number):Promise<void>{
        this.postsService.remove(id);
    }
}
