import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { AuthController } from './auth.controller';
import { AuthService, UsersTransportService } from './services';


@Module({
  imports: [
    ConfigModule.forRoot(),
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ ConfigModule ],
      useFactory: (configService: ConfigService) => ({
        exchanges: [
          {
            name: configService.get('RMQ_USERS_TRANSPORT_EXCHANGE'),
            type: 'topic',
            createExchangeIfNotExists: true,
          },
        ],
        uri: `amqp://${configService.get('RMQ_USERS_TRANSPORT_USER')}:${configService.get('RMQ_USERS_TRANSPORT_PASS')}@${configService.get('RMQ_USERS_TRANSPORT_URI')}`,
        connectionInitOptions: { wait: true },
        channels: {
          [configService.get('RMQ_USERS_TRANSPORT_CHANNEL')]: {
            prefetchCount: 1,
          },
        },
        queues: [
          // Users Microservice - Authorization Actions
          {
            channel: configService.get('RMQ_USERS_TRANSPORT_CHANNEL'),
            exchange: configService.get('RMQ_USERS_TRANSPORT_EXCHANGE'),
            name: configService.get('RMQ_USERS_TRANSPORT_SIGN_UP_REQUEST_QUEUE'),
            routingKey: configService.get('RMQ_USERS_TRANSPORT_SIGN_UP_REQUEST_RK'),
            createQueueIfNotExists: true,
          },
          {
            channel: configService.get('RMQ_USERS_TRANSPORT_CHANNEL'),
            exchange: configService.get('RMQ_USERS_TRANSPORT_EXCHANGE'),
            name: configService.get('RMQ_USERS_TRANSPORT_SIGN_UP_REPLY_QUEUE'),
            routingKey: configService.get('RMQ_USERS_TRANSPORT_SIGN_UP_REPLY_RK'),
            createQueueIfNotExists: true,
          },
          {
            channel: configService.get('RMQ_USERS_TRANSPORT_CHANNEL'),
            exchange: configService.get('RMQ_USERS_TRANSPORT_EXCHANGE'),
            name: configService.get('RMQ_USERS_TRANSPORT_SIGN_IN_REQUEST_QUEUE'),
            routingKey: configService.get('RMQ_USERS_TRANSPORT_SIGN_IN_REQUEST_RK'),
            createQueueIfNotExists: true,
          },
          {
            channel: configService.get('RMQ_USERS_TRANSPORT_CHANNEL'),
            exchange: configService.get('RMQ_USERS_TRANSPORT_EXCHANGE'),
            name: configService.get('RMQ_USERS_TRANSPORT_SIGN_IN_REPLY_QUEUE'),
            routingKey: configService.get('RMQ_USERS_TRANSPORT_SIGN_IN_REPLY_RK'),
            createQueueIfNotExists: true,
          },
          {
            channel: configService.get('RMQ_USERS_TRANSPORT_CHANNEL'),
            exchange: configService.get('RMQ_USERS_TRANSPORT_EXCHANGE'),
            name: configService.get('RMQ_USERS_TRANSPORT_REFRESH_REQUEST_QUEUE'),
            routingKey: configService.get('RMQ_USERS_TRANSPORT_REFRESH_REQUEST_RK'),
            createQueueIfNotExists: true,
          },
          {
            channel: configService.get('RMQ_USERS_TRANSPORT_CHANNEL'),
            exchange: configService.get('RMQ_USERS_TRANSPORT_EXCHANGE'),
            name: configService.get('RMQ_USERS_TRANSPORT_REFRESH_REPLY_QUEUE'),
            routingKey: configService.get('RMQ_USERS_TRANSPORT_REFRESH_REPLY_RK'),
            createQueueIfNotExists: true,
          },
          {
            channel: configService.get('RMQ_USERS_TRANSPORT_CHANNEL'),
            exchange: configService.get('RMQ_USERS_TRANSPORT_EXCHANGE'),
            name: configService.get('RMQ_USERS_TRANSPORT_AUTHENTICATE_REQUEST_QUEUE'),
            routingKey: configService.get('RMQ_USERS_TRANSPORT_AUTHENTICATE_REQUEST_RK'),
            createQueueIfNotExists: true,
          },
          {
            channel: configService.get('RMQ_USERS_TRANSPORT_CHANNEL'),
            exchange: configService.get('RMQ_USERS_TRANSPORT_EXCHANGE'),
            name: configService.get('RMQ_USERS_TRANSPORT_AUTHENTICATE_REPLY_QUEUE'),
            routingKey: configService.get('RMQ_USERS_TRANSPORT_AUTHENTICATE_REPLY_RK'),
            createQueueIfNotExists: true,
          },
          {
            channel: configService.get('RMQ_USERS_TRANSPORT_CHANNEL'),
            exchange: configService.get('RMQ_USERS_TRANSPORT_EXCHANGE'),
            name: configService.get('RMQ_USERS_TRANSPORT_LOGOUT_REQUEST_QUEUE'),
            routingKey: configService.get('RMQ_USERS_TRANSPORT_LOGOUT_REQUEST_RK'),
            createQueueIfNotExists: true,
          },
          {
            channel: configService.get('RMQ_USERS_TRANSPORT_CHANNEL'),
            exchange: configService.get('RMQ_USERS_TRANSPORT_EXCHANGE'),
            name: configService.get('RMQ_USERS_TRANSPORT_LOGOUT_REPLY_QUEUE'),
            routingKey: configService.get('RMQ_USERS_TRANSPORT_LOGOUT_REPLY_RK'),
            createQueueIfNotExists: true,
          },
        ],
        enableControllerDiscovery: true,
      }),
      inject: [ ConfigService ],
    }),
  ],
  controllers: [
    AuthController,
  ],
  providers: [
    AuthService,
    UsersTransportService,
  ],
})
export class AppModule {}
