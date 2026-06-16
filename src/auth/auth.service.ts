import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entitties/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from "bcrypt"
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository:Repository<User>,
        private readonly jwtService:JwtService
    ){
        // bcrypt.hash('test1234',10).then(console.log);
    }

        async register(registerDto:RegisterDto){
            const existingUser = await this.userRepository.findOne({
                where:{email:registerDto.email}
            })

            if(existingUser){
                throw new ConflictException('user with that credential already exist');
            }

            const hashedPassword = await this.hashPassword(registerDto.password);

            const newlyCreatedUser = this.userRepository.create({
                email:registerDto.email,
                name:registerDto.name,
                password:hashedPassword,
                role:UserRole.USER
            });

            const saveUser = await this.userRepository.save(newlyCreatedUser);

            const {password,...result} = saveUser;
            return{
                user:result,
                message:'User registered successfully'
            };
        }

        async createAdmin(registerDto:RegisterDto){
             const existingUser = await this.userRepository.findOne({
                where:{email:registerDto.email}
            })

            if(existingUser){
                throw new ConflictException('user with that credential already exist');
            }

            const hashedPassword = await this.hashPassword(registerDto.password);

            const newlyCreatedUser = this.userRepository.create({
                email:registerDto.email,
                name:registerDto.name,
                password:hashedPassword,
                role:UserRole.ADMIN
            });

            const saveUser = await this.userRepository.save(newlyCreatedUser);

            const {password,...result} = saveUser;
            return{
                user:result,
                message:'Admin User registered successfully'
            };
        }

        async login(loginDto:LoginDto){
            const user = await this.userRepository.findOne({
                where:{email:loginDto.email}
            })
            if(!user || !(await this.verifyPassword(loginDto.password,user.password))){
                throw new UnauthorizedException('Invalid credentials or account not exists')
            }

            const tokens = this.generateTokens(user);
            const {password,...result} = user;

            return {
                user:result,
                ...tokens
            }
        }

        async refreshToken(refreshToken:string){
            try {
                const payload = this.jwtService.verify(refreshToken,{
                    secret:'refresh_secret'
                });

                const user = await this.userRepository.findOne({
                    where:{id:payload.sub}
                })
                
                if(!user){
                    throw new UnauthorizedException('Invalid token')
                }

                const accessToken = this.generateAccessToken(user);

                return {accessToken}

            } catch (error) {
                throw new UnauthorizedException('Invalid token')
            }
        }

        async getUserById(userId:number):Promise<Partial<User>>{
            const user= await this.userRepository.findOne({
                where:{id:userId}
            }) 

            if(!user){
                throw new UnauthorizedException('user not found');
            }

            const {password, ...result} = user;

            return result;
        }        

        private async verifyPassword(plainPassword:string,hashedPassword:string):Promise<boolean>{
            return bcrypt.compare(plainPassword,hashedPassword);
        }
        
        private async hashPassword(password:string):Promise<string>{
            return bcrypt.hash(password,10)
        }

        private generateTokens(user:User){
            return {
                accessToken:this.generateAccessToken(user),
                refreshToken:this.generateRefreshToken(user)
            }
        }

        private generateAccessToken(user:User):string{
            const payload = {
                email:user.email,
                sub:user.id,
                role:user.role
            }

            return this.jwtService.sign(payload,{
                secret:'jwt_secret',
                expiresIn:'15m'
            })
        }
    
        private generateRefreshToken(user:User):string{
            const payload = {
                sub:user.id,  
            }

            return this.jwtService.sign(payload,{
                secret:'refresh_secret',
                expiresIn:'7d'
            })

        }
    
}
