import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { RolesGaurd } from './guards/roles-guard';
import { UserRole } from './entitties/user.entity';
import { Roles } from './decorators/roles.decorator';
import { LoginThrottlerGuard } from './guards/login-throtller.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService:AuthService){}

    @Post('register')
    async register(@Body() registerDto:RegisterDto){
        return this.authService.register(registerDto);
    }
    @UseGuards(LoginThrottlerGuard)
    @Post('login')
    async login(@Body() loginDto:LoginDto){
        return this.authService.login(loginDto);
    }

    @Post('refresh')
    async refreshToken(@Body('refreshToken') refreshToken:string){
        return this.authService.refreshToken(refreshToken);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@CurrentUser() user:any){
        return user;
    }

    @Post('create-admin')
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard,RolesGaurd)
    createAdmin(@Body() registerDto:RegisterDto){
        return this.authService.createAdmin(registerDto);   
    }
}
