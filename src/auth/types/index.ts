import { User } from '@prisma/client';

export interface IAccessTokenPayload {
  sub: number;
  username: string;
  ip: string;
  userAgent: string;
}

export interface IRefreshTokenPayload extends IAccessTokenPayload {
  id?: number;
  valid?: boolean;
}

export interface IAccessTokenDecodedPayload {
  sub: number;
  username: string;
  ip: string;
  userAgent: string;
}

export interface IRefreshTokenDecodedPayload
  extends IAccessTokenDecodedPayload {
  id: number;
  valid: boolean;
}

export type TokenOptionsType = {
  expiresIn: number;
  [key: string]: any;
};

export type TokenResultType = [
  string,
  TokenOptionsType & { expiresInMilliseconds: number },
];

export interface IAuthOptions {
  ip: string;
  userAgent?: string;
}

export interface IRefreshAuthResult {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn?: number;
  refreshTokenExpiresIn?: number;
}

export interface ILocalAuthenticationResult extends IRefreshAuthResult {
  user: User;
}
