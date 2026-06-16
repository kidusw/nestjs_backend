import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {

    users= [
        {
            id:1,
            name:"kidus"
        },
        {
            id:2,
            name:"john"
        },
        {
            id:3,
            name:"jack"
        }
    ]

    getAllUsers(){
        return this.users
    }

    getById(id:number){
        console.log('id: ',id)
        const user =  this.users.find((user)=>user.id == id)
        console.log('user: ',user);
        if(!user){
            return 'cannot find the specified user';
        }
        return user
    }
}
