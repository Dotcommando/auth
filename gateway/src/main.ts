import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import fastifyCookie from '@fastify/cookie';
import helmet from '@fastify/helmet';

import { config } from 'dotenv';
import * as morgan from 'morgan';

import { AppModule } from './app.module';
import { HttpCommonExceptionFilter } from './filters';
import { StatusInterceptor } from './interceptors';


config();

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
  });

  app.useGlobalFilters(new HttpCommonExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  app.useGlobalInterceptors(new StatusInterceptor());
  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: process.env.APP_ORIGIN,
  });

  app.register(helmet);

  if (process.env.ENVIRONMENT === 'dev') {
    app.use(morgan('tiny'));
  }

  await app.listen(process.env.GATEWAY_PORT);
}

bootstrap();
