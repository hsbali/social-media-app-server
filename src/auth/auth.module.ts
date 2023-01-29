import { Module } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from './jwt/jwt.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtService],
  exports: [JwtService],
})
export class AuthModule {}
