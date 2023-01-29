import * as argon2 from 'argon2';
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from './jwt/jwt.service';
import { LogInDto, SignUpDto } from './dto';
import { RefreshToken } from '@prisma/client';
import {
  IAccessTokenPayload,
  IAuthOptions,
  ILocalAuthenticationResult,
  IRefreshTokenPayload,
  IRefreshAuthResult,
  TokenResultType,
} from './types';
import { IncorrectConfirmPasswordException } from './exceptions/password-exception';
import { UserAlreadyExistException } from './exceptions/user-exception';
import { InvalidCredentialException } from './exceptions/credential-exception';
import {
  InvalidSessionRequestException,
  SessionExpiredException,
} from './exceptions/session-exception';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  private async retrieveRefreshToken(
    payload: IRefreshTokenPayload,
    options: { revalidate: boolean } = { revalidate: true },
  ): Promise<TokenResultType> {
    try {
      let refreshTokenDB: RefreshToken;

      if (payload.id) {
        refreshTokenDB = await this.prisma.refreshToken.findUnique({
          where: { id: payload.id },
        });
      } else {
        refreshTokenDB = await this.prisma.refreshToken.findFirst({
          where: {
            AND: [
              { sub: payload.sub },
              { ip: payload.ip },
              { userAgent: payload.userAgent },
            ],
          },
        });
      }

      if (refreshTokenDB && !refreshTokenDB.valid && !options.revalidate)
        throw new SessionExpiredException();

      if (refreshTokenDB && !refreshTokenDB.valid) {
        refreshTokenDB = await this.prisma.refreshToken.update({
          data: {
            valid: true,
          },
          where: { id: refreshTokenDB.id },
        });
      }

      if (!refreshTokenDB) {
        refreshTokenDB = await this.prisma.refreshToken.create({
          data: {
            ...payload,
            valid: true,
          },
        });
      }

      const refreshToken = this.jwtService.signRefreshToken(refreshTokenDB);

      return refreshToken;
    } catch (error) {
      throw error;
    }
  }

  private getAccessToken(payload: IAccessTokenPayload): TokenResultType {
    const accessToken = this.jwtService.signAccessToken(payload);
    return accessToken;
  }

  async localSignup(
    userDetails: SignUpDto,
    options: IAuthOptions,
  ): Promise<ILocalAuthenticationResult> {
    try {
      if (userDetails.password !== userDetails.confirmPassword) {
        throw new IncorrectConfirmPasswordException('Passwords do not match.');
      }
      delete userDetails.confirmPassword;

      const user = await this.userService.findOneByEmail(userDetails.email);

      if (user) {
        throw new UserAlreadyExistException(
          'User with this email already exists. Try log in.',
        );
      }

      const hash = await argon2.hash(userDetails.password);

      const newUser = await this.userService.create({
        ...userDetails,
        password: hash,
      });

      const [accessToken, { expiresInMilliseconds: accessTokenExpiresIn }] =
        this.getAccessToken({
          sub: newUser.id,
          username: newUser.email,
          ip: options.ip,
          userAgent: options.userAgent,
        });

      const [refreshToken, { expiresInMilliseconds: refreshTokenExpiresIn }] =
        await this.retrieveRefreshToken({
          sub: newUser.id,
          username: newUser.email,
          ip: options.ip,
          userAgent: options.userAgent,
        });

      return {
        user: newUser,
        accessToken,
        refreshToken,
        accessTokenExpiresIn,
        refreshTokenExpiresIn,
      };
    } catch (error) {
      throw error;
    }
  }

  async localLogin(
    userCredentials: LogInDto,
    options: IAuthOptions,
  ): Promise<ILocalAuthenticationResult> {
    try {
      const user = await this.userService.findOneByEmail(
        userCredentials.email,
        {
          withPassword: true,
        },
      );
      if (!user)
        throw new InvalidCredentialException('Invalid Email or Password.');

      const isPasswordMatch = await argon2.verify(
        user.password,
        userCredentials.password,
      );
      if (!isPasswordMatch)
        throw new InvalidCredentialException('Invalid Email or Password.');

      const [accessToken, { expiresInMilliseconds: accessTokenExpiresIn }] =
        this.getAccessToken({
          sub: user.id,
          username: user.email,
          ip: options.ip,
          userAgent: options.userAgent,
        });

      const [refreshToken, { expiresInMilliseconds: refreshTokenExpiresIn }] =
        await this.retrieveRefreshToken({
          sub: user.id,
          username: user.email,
          ip: options.ip,
          userAgent: options.userAgent,
        });

      delete user.password;
      return {
        user,
        accessToken,
        refreshToken,
        accessTokenExpiresIn,
        refreshTokenExpiresIn,
      };
    } catch (error) {
      throw error;
    }
  }

  async refreshAuth(
    refreshToken: string,
    options: IAuthOptions,
  ): Promise<IRefreshAuthResult> {
    try {
      const decodedToken = this.jwtService.verifyRefreshToken(refreshToken);

      if (
        !decodedToken.valid ||
        decodedToken.ip !== options.ip ||
        decodedToken.userAgent !== options.userAgent
      ) {
        new InvalidSessionRequestException();
      }

      const [accessToken, { expiresInMilliseconds: accessTokenExpiresIn }] =
        this.getAccessToken({
          sub: decodedToken.sub,
          username: decodedToken.username,
          ip: options.ip,
          userAgent: options.userAgent,
        });

      const [
        newRefreshToken,
        { expiresInMilliseconds: refreshTokenExpiresIn },
      ] = await this.retrieveRefreshToken(
        {
          id: decodedToken.id,
          sub: decodedToken.sub,
          username: decodedToken.username,
          ip: options.ip,
          userAgent: options.userAgent,
        },
        { revalidate: false },
      );

      return {
        accessToken,
        refreshToken: newRefreshToken,
        accessTokenExpiresIn,
        refreshTokenExpiresIn,
      };
    } catch (error) {
      throw error;
    }
  }

  async logout(refreshToken: string) {
    try {
      const decodedToken = this.jwtService.verifyRefreshToken(refreshToken);

      await this.prisma.refreshToken.update({
        data: {
          valid: false,
        },
        where: { id: decodedToken.id },
      });

      return true;
    } catch (error) {
      throw error;
    }
  }
}
