import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { UserRole } from "../entitties/user.entity";
import { Roles, ROLES_KEY } from "../decorators/roles.decorator";


@Injectable()
export class RolesGaurd implements CanActivate{

    //reflector -> utility that will help to access metadata
    constructor(private reflector:Reflector){}


    //acts as a next method in express(forwarding to the next handler)
    canActivate(context: ExecutionContext): boolean{
        
        // retrieve the required roles metadata set by the roles decorator
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_KEY,[
                context.getHandler(),//method level metadata
                context.getClass(),//class level metadata
            ]
        );
    
    
          if(!requiredRoles){
                return true;
            }
            const {user} = context.switchToHttp().getRequest();

            if(!user){
                throw new ForbiddenException('User not Authnetiated');
            }
            
           const hasRequiredRole = requiredRoles.some(role=>user.role === role);
            if(!hasRequiredRole){
                throw new ForbiddenException('Insufficient permission');
            }

        return true;
    }
}