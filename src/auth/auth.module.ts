import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entitties/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt-strategy';
import { RolesGaurd } from './guards/roles-guard';

@Module({
  imports:[TypeOrmModule.forFeature([User]),JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService,JwtStrategy,RolesGaurd],
  exports:[AuthService,RolesGaurd]
})
export class AuthModule {}
