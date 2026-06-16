import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService:UserService){}

    // @Get()
    // getUsers(){
    //    return this.userService.getAllUsers();
    // }

    @Get(':id')
    getUserById(@Param('id') id:number){
       return this.userService.getById(id) 
    }
}
