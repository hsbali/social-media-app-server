import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import { JwtService } from 'src/auth/jwt/jwt.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  private extractAccessTokenFromAuthorizationHeader(req: Request) {
    if (!req.header('Authorization')) return null;

    return req.header('Authorization').split(' ')[1];
  }

  private getProtectedStatus(context: ExecutionContext) {
    const controllerProtectedStatus = this.reflector.get<boolean>(
      'protected',
      context.getClass(),
    );

    const methodProtectedStatus = this.reflector.get<boolean>(
      'protected',
      context.getHandler(),
    );

    return methodProtectedStatus || controllerProtectedStatus;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // skip not protected for authentication
      const isProtected = this.getProtectedStatus(context);
      if (isProtected !== true) return true;

      const ctx = context.switchToHttp();
      const req = ctx.getRequest<Request>();

      const token = this.extractAccessTokenFromAuthorizationHeader(req);
      if (!token) throw new UnauthorizedException('Access denied');

      const decodedToken = this.jwtService.verifyAccessToken(token);

      const user = await this.userService.findOne(decodedToken.sub);
      if (!user) throw new UnauthorizedException('Access denied');

      req.user = user;

      return true;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Access denied');
    }
  }
}
