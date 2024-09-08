import { Controller } from '@nestjs/common';

import { MessageHandlerErrorBehavior, RabbitPayload, RabbitRPC } from '@golevelup/nestjs-rabbitmq';

import { config } from 'dotenv';

import { AuthenticateDto, RefreshTokensDto, SignInDto, SignUpDto } from './dto';
import { UsersService } from './services';
import { IReply, ITokens, IUser, User } from './types';
import { rmqErrorHandler } from './utils';


config();

const exchange = process.env.RMQ_USERS_TRANSPORT_EXCHANGE;

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @RabbitRPC({
    exchange,
    routingKey: process.env.RMQ_USERS_TRANSPORT_SIGN_UP_REQUEST_RK,
    queue: process.env.RMQ_USERS_TRANSPORT_SIGN_UP_REQUEST_QUEUE,
    errorBehavior: MessageHandlerErrorBehavior.ACK,
    errorHandler: rmqErrorHandler,
  })
  public async handleSignUp(
    @RabbitPayload() payload: SignUpDto,
  ): Promise<IReply<{ user: User; tokens: ITokens }>> {
    const registeredUserReply: IReply<{ user: Omit<IUser<string>, 'password'> }> = await this.usersService
      .signUp(payload);

    if (registeredUserReply.errors) {
      return {
        data: null,
        errors: registeredUserReply.errors,
      };
    }

    const signInReply: IReply<{ user: User; tokens: ITokens }> = await this.usersService
      .signIn(payload.email, payload.password);

    if (signInReply.errors) {
      return {
        data: null,
        errors: signInReply.errors,
      };
    }

    return signInReply;
  }

  @RabbitRPC({
    exchange,
    routingKey: process.env.RMQ_USERS_TRANSPORT_SIGN_IN_REQUEST_RK,
    queue: process.env.RMQ_USERS_TRANSPORT_SIGN_IN_REQUEST_QUEUE,
    errorBehavior: MessageHandlerErrorBehavior.ACK,
    errorHandler: rmqErrorHandler,
  })
  public async handleSignIn(
    @RabbitPayload() payload: SignInDto,
  ): Promise<IReply<{ user: User; tokens: ITokens }>> {
    const signInReply: IReply<{ user: User; tokens: ITokens }> = await this.usersService
      .signIn(payload.email, payload.password);

    if (signInReply.errors) {
      return {
        data: null,
        errors: signInReply.errors,
      };
    }

    return signInReply;
  }

  @RabbitRPC({
    exchange,
    routingKey: process.env.RMQ_USERS_TRANSPORT_AUTHENTICATE_REQUEST_RK,
    queue: process.env.RMQ_USERS_TRANSPORT_AUTHENTICATE_REQUEST_QUEUE,
    errorBehavior: MessageHandlerErrorBehavior.ACK,
    errorHandler: rmqErrorHandler,
  })
  public async handleAuthenticate(
    @RabbitPayload() payload: AuthenticateDto,
  ): Promise<IReply<{ valid: boolean; user: User }>> {
    const authReply: IReply<{ valid: boolean; user?: User }> = await this.usersService.authenticate(payload.accessToken);

    if (authReply.errors?.length || !authReply.data?.valid) {
      return {
        data: null,
        errors: authReply.errors || [ 'Invalid or expired access token' ],
      };
    }

    return {
      data: {
        valid: authReply.data.valid,
        user: authReply.data.user!,
      },
    };
  }

  @RabbitRPC({
    exchange,
    routingKey: process.env.RMQ_USERS_TRANSPORT_REFRESH_REQUEST_RK,
    queue: process.env.RMQ_USERS_TRANSPORT_REFRESH_REQUEST_QUEUE,
    errorBehavior: MessageHandlerErrorBehavior.ACK,
    errorHandler: rmqErrorHandler,
  })
  public async handleRefreshTokens(
    @RabbitPayload() payload: RefreshTokensDto,
  ): Promise<IReply<{ user: User; tokens: ITokens }>> {
    const refreshTokensReply: IReply<{ user: User; tokens: ITokens }> = await this.usersService.refreshTokens(payload.refreshToken);

    if (refreshTokensReply.errors?.length) {
      return {
        data: null,
        errors: refreshTokensReply.errors,
      };
    }

    return {
      data: {
        user: refreshTokensReply.data!.user,
        tokens: refreshTokensReply.data!.tokens,
      },
    };
  }
}
