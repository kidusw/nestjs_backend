import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PostInterface } from './interfaces/post.interface';
import { single } from 'rxjs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {Post as PostEntity } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User, UserRole } from 'src/auth/entitties/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { FindPostsQueryDto } from './dto/find-posts.query.dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';

@Injectable()
export class PostsService {

    private postListCacheKeys:Set<string> = new Set();

    constructor(
        @InjectRepository(PostEntity)
        private readonly postRepository:Repository<PostEntity>,
        @Inject(CACHE_MANAGER) private cacheManager:Cache,
    ){}

    private generatePostsListCacheKey(query:FindPostsQueryDto):string{
        const{page=1,limit=10,title} = query;
        return `posts_list_page${page}_limit${limit}_title${title || 'all'}`;
    }

    async findAll(query:FindPostsQueryDto):Promise<PaginatedResponse<PostEntity>>{
       const cacheKey = this.generatePostsListCacheKey(query);

       this.postListCacheKeys.add(cacheKey);

       const getCachedData = await this.cacheManager.get<PaginatedResponse<PostEntity>>(cacheKey);

       if(getCachedData){
        console.log(`Cache Hit --------> Returnign posts list from cache ${cacheKey}`);

        return getCachedData;
       }

           console.log(`Cache Miss --------> Returnign posts list from database }`);

           const {page=1,limit=10,title} = query;

           const skip = (page -1) * limit;

           const queryBuilder = this.postRepository.createQueryBuilder('post')
           .leftJoinAndSelect('post.authorName','authorName').orderBy('post.createdDate','DESC')
           .skip(skip).take(limit);

           if(title){
            queryBuilder.andWhere('post.title ILIKE :title',{title:`%${title}%`})
           }

           const [items,totalItems] = await queryBuilder.getManyAndCount();

           const totalPages = Math.ceil(totalItems / limit);

           const responseResult = {
            items,
            meta:{
                currentPage:page,
                itemsPerPage:limit,
                totalItems,
                totalPages,
                hasPreviousPage:page > 1,
                hasNextPage:page < totalPages
            }
           };
           await this.cacheManager.set(cacheKey,responseResult,30000);
           return responseResult;
    }

    async findOne(id:number):Promise<PostEntity>{
      
        const cacheKey = `post_${id}`;
        const cachedPost = await this.cacheManager.get<PostEntity>(cacheKey);

        if(cachedPost){
            console.log(`Cache Hit ------> Returning post from cache ${cacheKey}`);

            return cachedPost;
        }

        console.log(`Cache Miss --------> Returnign posts list from database }`);

        const singlePost = await this.postRepository.findOne({
            where:{id},
            relations:['authorName']
        })

        

        if(!singlePost){
            throw new NotFoundException('post with the given id not found');
        }

        await this.cacheManager.set(cacheKey,singlePost,30000);

        return singlePost;

    
    }


    async create(createPostData:CreatePostDto,authorName:User):Promise<PostEntity>{
        const newPost:PostEntity = this.postRepository.create({
            title:createPostData.title,
            content:createPostData.content,
            authorName
        });

        // invalidate the existing cache;
        await this.invalidateAllExistingListCaches();
        return this.postRepository.save(newPost);
    }

    async update(id:number,updatePostData:UpdatePostDto,user:User):Promise<PostEntity>{
        const findPostToUpdate = await this.findOne(id);
        
        if(findPostToUpdate.authorName.id !== user.id && user.role !== UserRole.ADMIN){
            throw new ForbiddenException("You can onlu edit your own posts");
        }

        if(updatePostData.title){
            findPostToUpdate.title = updatePostData.title
        }
        if(updatePostData.content){
            findPostToUpdate.content = updatePostData.content
        }

        const updatedDate = await this.postRepository.save(findPostToUpdate);

        await this.cacheManager.del(`post_${id}`);

        await this.invalidateAllExistingListCaches();
        
        return this.postRepository.save(findPostToUpdate);

    }

   async remove(id:number):Promise<void>{
        const postToDelete = await this.findOne(id);
        
        if(!postToDelete){
            throw new NotFoundException('post with the id not found')
        }
        
        await this.postRepository.remove(postToDelete);
        await this.cacheManager.del(`post_${id}`);

        await this.invalidateAllExistingListCaches();
    }

    private async invalidateAllExistingListCaches():Promise<void>{
        console.log(`invalidating ${this.postListCacheKeys.size} list cache entries`);

        for(const key of this.postListCacheKeys){
            await this.cacheManager.del(key);
        }
        this.postListCacheKeys.clear();
    }

    // private getNextId():number{
    //     return this.posts.length > 0 ?
    //     Math.max(...this.posts.map(post=>post.id)) + 1:1
    // }
}
