import { Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MessageHandlerErrorBehavior, RabbitPayload, RabbitRPC } from '@golevelup/nestjs-rabbitmq';

import { config } from 'dotenv';

import { SignUpDto } from './dto';
import { TransportService, UsersService } from './services';
import { IReply, ITokens, IUser } from './types';
import { configuredReplyErrorCallback } from './utils';


config();

const exchange = process.env.RMQ_USERS_TRANSPORT_EXCHANGE;

@Controller('users')
export class UsersController {
  private rkSignUpReply = this.configService.get('RMQ_USERS_TRANSPORT_SIGN_UP_REPLY_RK');

  constructor(
    private readonly configService: ConfigService,
    private readonly transportService: TransportService,
    private readonly usersService: UsersService,
  ) {}

  @RabbitRPC({
    exchange,
    routingKey: process.env.RMQ_USERS_TRANSPORT_SIGN_UP_REQUEST_RK,
    queue: process.env.RMQ_USERS_TRANSPORT_SIGN_UP_REQUEST_QUEUE,
    errorBehavior: MessageHandlerErrorBehavior.ACK,
    errorHandler: configuredReplyErrorCallback,
  })
  public async handleSignUp(
    @RabbitPayload() payload: SignUpDto,
  ): Promise<IReply<{ user: Omit<IUser<string>, 'password'>; tokens: ITokens }>> {
    const registeredUserReply: IReply<{ user: Omit<IUser<string>, 'password'> }> = await this.usersService.signUp(payload);

    this.transportService.publish(this.rkSignUpReply, registeredUserReply);

    return {
      user: registeredUserReply.data.user,
    };
  }
}
