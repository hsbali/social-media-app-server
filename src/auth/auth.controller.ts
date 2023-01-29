import {
  Controller,
  Post,
  Body,
  Ip,
  Headers,
  Res,
  Get,
  UnauthorizedException,
  Delete,
  BadRequestException,
  UseFilters,
} from '@nestjs/common';
import { Response } from 'express';
import { Cookies } from 'src/common/decorators/cookies.decorator';
import { Protected } from 'src/common/decorators/access-specifiers.decorator';
import { AuthService } from './auth.service';
import { SignUpDto, LogInDto } from './dto';
import { InvalidCredentialExceptionFilter } from './exceptions/credential-exception.filter';
import { IncorrectConfirmPasswordExceptionFilter } from './exceptions/password-exception.filter';
import {
  InvalidSessionRequestExceptionFilter,
  SessionExpiredExceptionFilter,
} from './exceptions/session-exception.filter';
import { UserAlreadyExistExceptionFilter } from './exceptions/user-exception.filter';
import { UserDecorator } from 'src/common/decorators/user.decorator';
import { User } from '@prisma/client';

@UseFilters(
  IncorrectConfirmPasswordExceptionFilter,
  InvalidCredentialExceptionFilter,
  UserAlreadyExistExceptionFilter,
  InvalidSessionRequestExceptionFilter,
  SessionExpiredExceptionFilter,
)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private insertRefreshTokenCookieInResponse(
    res: Response,
    refreshToken: string,
    refreshTokenOptions: { [key: string]: any },
    resourceResult: object,
  ) {
    return res
      .cookie('___refresh_token', refreshToken, {
        path: '/',
        expires: new Date(
          new Date().getTime() + refreshTokenOptions.refreshTokenExpiresIn,
        ),
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
      .json(resourceResult);
  }

  private removeRefreshTokenCookieInResponse(
    res: Response,
    resourceResult: object,
  ) {
    return res
      .cookie('___refresh_token', '', {
        path: '/',
        expires: new Date(new Date().getTime() + 5000),
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
      .json(resourceResult);
  }

  @Post('/local/signup')
  async localSignup(
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
    @Body() body: SignUpDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.authService.localSignup(body, {
        ip,
        userAgent,
      });

      const { refreshToken, ...restResult } = result;
      return this.insertRefreshTokenCookieInResponse(
        res,
        refreshToken,
        { refreshTokenExpiresIn: result.refreshTokenExpiresIn },
        restResult,
      );
    } catch (error) {
      throw error;
    }
  }

  @Post('/local/login')
  async localLogin(
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
    @Body() body: LogInDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.authService.localLogin(body, {
        ip,
        userAgent,
      });

      const { refreshToken, ...restResult } = result;
      return this.insertRefreshTokenCookieInResponse(
        res,
        refreshToken,
        { refreshTokenExpiresIn: result.refreshTokenExpiresIn },
        restResult,
      );
    } catch (error) {
      throw error;
    }
  }

  @Get('/refresh')
  async refresh(
    @Cookies('___refresh_token') refreshToken: string,
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
    @Res() res: Response,
  ) {
    try {
      if (!refreshToken) throw new UnauthorizedException('Access Denied');

      const result = await this.authService.refreshAuth(refreshToken, {
        ip,
        userAgent,
      });

      const { refreshToken: newRefreshToken, ...restResult } = result;
      return this.insertRefreshTokenCookieInResponse(
        res,
        newRefreshToken,
        { refreshTokenExpiresIn: result.refreshTokenExpiresIn },
        restResult,
      );
    } catch (error) {
      throw error;
    }
  }

  @Protected()
  @Get('/me')
  fetchAuthUserDetails(@UserDecorator() user: User) {
    return user;
  }

  @Protected()
  @Delete('/logout')
  async logout(
    @Cookies('___refresh_token') refreshToken: string,
    @Res() res: Response,
  ) {
    try {
      if (!refreshToken) new BadRequestException();

      await this.authService.logout(refreshToken);

      return this.removeRefreshTokenCookieInResponse(res, {
        message: 'Logged out',
      });
    } catch (error) {
      console.log(error);
      return this.removeRefreshTokenCookieInResponse(res, {
        message: 'Logged out with error',
      });
    }
  }
}
