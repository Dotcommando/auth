import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { UserSchema } from './schemas';
import { JwtConfigService, MongoConfigService, UserDataService, UsersService } from './services';
import { UsersController } from './users.controller';


@Module({
  imports: [
    ScheduleModule.forRoot(),
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),
    MongooseModule.forRootAsync({
      imports: [ ConfigModule ],
      useClass: MongoConfigService,
      inject: [ ConfigService ],
    }),
    MongooseModule.forFeatureAsync([
      {
        name: 'Users',
        useFactory: () => UserSchema,
        collection: 'users',
      },
    ]),
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
  controllers: [ UsersController ],
  providers: [
    UserDataService,
    UsersService,
  ],
})
export class AppModule {}
