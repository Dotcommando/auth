import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { lastValueFrom, timeout } from 'rxjs';

import { UsersTransportService } from './users-transport.service';

import { SignUpDto } from '../dto';
import { ICorrelatedMsg, IReply, ITokens, IUser } from '../types';
import { getIntFromEnv } from '../utils';


@Injectable()
export class AuthService {
  private microserviceRequestTimeoutMs = getIntFromEnv('MICROSERVICE_REQUEST_TIMEOUT_MS', 5000);
  private usersTransportSignUpRequest = this.configService.get('RMQ_USERS_TRANSPORT_SIGN_UP_REQUEST_RK');

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
}
