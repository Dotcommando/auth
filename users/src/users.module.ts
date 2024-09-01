import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { AddressSchema, TokenSchema, UserSchema } from './schemas';
import { DbAccessService, JwtConfigService, MongoConfigService, UsersService } from './services';
import configuration from './services/config';
import { UsersController } from './users.controller';


@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      useClass: MongoConfigService,
    }),
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),
    MongooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
        collection: 'users',
      },
    ]),
    MongooseModule.forFeature([
      {
        name: 'Token',
        schema: TokenSchema,
        collection: 'tokens',
      },
    ]),
    MongooseModule.forFeature([
      {
        name: 'Address',
        schema: AddressSchema,
        collection: 'addresses',
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    DbAccessService,
    UsersService,
  ],
})
export class UsersModule {}
