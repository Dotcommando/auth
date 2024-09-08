import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { FastifyReply, FastifyRequest } from 'fastify';
import { lastValueFrom, timeout } from 'rxjs';

import { UsersTransportService } from './users-transport.service';

import { BEARER_PREFIX } from '../constants';
import { AuthenticateDto, RefreshTokensDto, SignInDto, SignUpDto } from '../dto';
import { ICorrelatedMsg, IReply, ITokens, IUser, User } from '../types';
import { getIntFromEnv } from '../utils';


@Injectable()
export class AuthService {
  private prodModeEnabled = this.configService.get('MODE') === 'prod';
  private microserviceRequestTimeoutMs = getIntFromEnv('MICROSERVICE_REQUEST_TIMEOUT_MS', 5000);
  private usersTransportSignUpRequest = this.configService.get('RMQ_USERS_TRANSPORT_SIGN_UP_REQUEST_RK');
  private usersTransportSignInRequest = this.configService.get('RMQ_USERS_TRANSPORT_SIGN_IN_REQUEST_RK');
  private usersTransportRefreshRequest = this.configService.get('RMQ_USERS_TRANSPORT_REFRESH_REQUEST_RK');
  private usersTransportAuthenticateRequest = this.configService.get('RMQ_USERS_TRANSPORT_AUTHENTICATE_REQUEST_RK');

  constructor(
    private readonly configService: ConfigService,
    private readonly usersTransportService: UsersTransportService,
  ) {
  }

  public async signUpAndSignIn(
    query: SignUpDto,
  ): Promise<IReply<{ user: IUser<string>; tokens: ITokens }>> {
    const signUpAndSignInReply: ICorrelatedMsg<IReply<{ user: IUser<string>; tokens: ITokens }>> = await lastValueFrom(
      this.usersTransportService
        .sendRequest<Partial<SignUpDto>, IReply<{ user: IUser<string>; tokens: ITokens }>>(
          this.usersTransportSignUpRequest,
          query,
        )
        .pipe(timeout(this.microserviceRequestTimeoutMs)),
    );

    return signUpAndSignInReply.data;
  }

  public async signIn(
    query: SignInDto,
  ): Promise<IReply<{ user: IUser<string>; tokens: ITokens }>> {
    const signInReply: ICorrelatedMsg<IReply<{ user: IUser<string>; tokens: ITokens }>> = await lastValueFrom(
      this.usersTransportService
        .sendRequest<SignInDto, IReply<{ user: IUser<string>; tokens: ITokens }>>(
          this.usersTransportSignInRequest,
          query,
        )
        .pipe(timeout(this.microserviceRequestTimeoutMs)),
    );

    return signInReply.data;
  }

  public async refresh(
    query: RefreshTokensDto,
  ): Promise<IReply<{ tokens: ITokens }>> {
    const refreshReply: ICorrelatedMsg<IReply<{ tokens: ITokens }>> = await lastValueFrom(
      this.usersTransportService
        .sendRequest<RefreshTokensDto, IReply<{ tokens: ITokens }>>(
          this.usersTransportRefreshRequest,
          query,
        )
        .pipe(timeout(this.microserviceRequestTimeoutMs)),
    );

    return refreshReply.data;
  }

  public async authenticate(
    query: AuthenticateDto,
  ): Promise<IReply<{ valid: boolean; user?: User }>> {
    const authenticationReply: ICorrelatedMsg<IReply<{ valid: boolean; user?: User }>> = await lastValueFrom(
      this.usersTransportService
        .sendRequest<AuthenticateDto, IReply<{ valid: boolean; user?: User }>>(
          this.usersTransportAuthenticateRequest,
          query,
        )
        .pipe(timeout(this.microserviceRequestTimeoutMs)),
    );

    return authenticationReply.data;
  }

  public getTokenFromRequest(req: FastifyRequest): string {
    return req.cookies?.refreshToken || req.headers['authorization']?.replace(BEARER_PREFIX, '');
  }

  public setCookies(res: FastifyReply, accessToken: string, refreshToken: string, expires: number) {
    res.setCookie('accessToken', accessToken, {
      expires: new Date(expires),
      httpOnly: true,
      path: '/',
      secure: this.prodModeEnabled,
      sameSite: 'lax',
    });

    res.setCookie('refreshToken', refreshToken, {
      expires: new Date(expires),
      httpOnly: true,
      path: '/',
      secure: this.prodModeEnabled,
      sameSite: 'lax',
    });
  }
}
