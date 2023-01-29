import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

import {
  IAccessTokenPayload,
  IRefreshTokenPayload,
  IRefreshTokenDecodedPayload,
  TokenOptionsType,
  TokenResultType,
} from '../types';

@Injectable()
export class JwtService {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  isDevEnv: boolean;
  constructor(private config: ConfigService) {
    this.accessTokenSecret = this.config.get('ACCESS_TOKEN_SECRET');
    this.refreshTokenSecret = this.config.get('REFRESH_TOKEN_SECRET');
    this.isDevEnv = this.config.get('NODE_ENV') === 'development';
  }

  sign(
    payload: string | object | Buffer,
    secret: string,
    options: object = {},
  ): string {
    return jwt.sign(payload, secret, options);
  }

  signAccessToken(
    payload: IAccessTokenPayload,
    options?: object,
  ): TokenResultType {
    const accessTokenOptions: TokenOptionsType = {
      expiresIn: this.isDevEnv ? 86400 : 1200, // in seconds 60 * 20 (20 minutes) // dev 60 * 60 * 24 (24 hours)
      ...options,
    };

    const expiresInMilliseconds: number = accessTokenOptions.expiresIn * 1000;

    const token = this.sign(
      payload,
      this.accessTokenSecret,
      accessTokenOptions,
    );
    return [token, { ...accessTokenOptions, expiresInMilliseconds }];
  }

  signRefreshToken(
    payload: IRefreshTokenPayload,
    options?: object,
  ): TokenResultType {
    const refreshTokenOptions: TokenOptionsType = {
      expiresIn: 630720000, // in seconds 1000 * 60 * 60 * 24 * 365 * 20 (20 years)
      ...options,
    };

    const expiresInMilliseconds: number = refreshTokenOptions.expiresIn * 1000;

    const token = this.sign(
      payload,
      this.refreshTokenSecret,
      refreshTokenOptions,
    );
    return [token, { ...refreshTokenOptions, expiresInMilliseconds }];
  }

  verifyAccessToken(token: string): any {
    try {
      const decoded: any = jwt.verify(token, this.accessTokenSecret);

      return decoded;
    } catch (error) {
      throw error;
    }
  }

  verifyRefreshToken(token: string): IRefreshTokenDecodedPayload {
    try {
      const decoded: any = jwt.verify(token, this.refreshTokenSecret);

      return decoded;
    } catch (error) {
      throw error;
    }
  }
}
