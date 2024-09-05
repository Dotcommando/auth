import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

import { Observable, Subject } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { ICorrelatedMsg } from '../types';


@Injectable()
export class UsersTransportService implements OnModuleInit, OnModuleDestroy {
  private usersTransportExchange = this.configService.get('RMQ_USERS_TRANSPORT_EXCHANGE');

  private requestRMQParameters: {
    [key: string]: {
      exchange: string;
      replyQueue: string;
      subject: Subject<{ correlationId: string; data: any }>;
    };
  } = {};

  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly configService: ConfigService,
  ) {}

  public onModuleInit(): void {
    this.initializeRequestParameters();

    Object
      .keys(this.requestRMQParameters)
      .forEach((routingKey: string) => {
        const { replyQueue, subject } = this.requestRMQParameters[routingKey];

        this.createSubscription(replyQueue, subject);
      });
  }

  public onModuleDestroy(): void {
    Object
      .keys(this.requestRMQParameters)
      .forEach((routingKey: string) => {
        const { replyQueue, subject } = this.requestRMQParameters[routingKey];

        this.amqpConnection.channel.cancel(replyQueue);
        subject.complete();
      });
  }

  private initializeRequestParameters(): void {
    const requests = [
      {
        exchange: this.usersTransportExchange,
        subject: new Subject<{ correlationId: string; data: any }>(),
        routingKey: this.configService.get('RMQ_USERS_TRANSPORT_SIGN_UP_REQUEST_RK'),
        replyQueue: this.configService.get('RMQ_USERS_TRANSPORT_SIGN_UP_REPLY_QUEUE'),
      },
      {
        exchange: this.usersTransportExchange,
        subject: new Subject<{ correlationId: string; data: any }>(),
        routingKey: this.configService.get('RMQ_USERS_TRANSPORT_SIGN_IN_REQUEST_RK'),
        replyQueue: this.configService.get('RMQ_USERS_TRANSPORT_SIGN_IN_REPLY_QUEUE'),
      },
      {
        exchange: this.usersTransportExchange,
        subject: new Subject<{ correlationId: string; data: any }>(),
        routingKey: this.configService.get('RMQ_USERS_TRANSPORT_REFRESH_REQUEST_RK'),
        replyQueue: this.configService.get('RMQ_USERS_TRANSPORT_REFRESH_REPLY_QUEUE'),
      },
      {
        exchange: this.usersTransportExchange,
        subject: new Subject<{ correlationId: string; data: any }>(),
        routingKey: this.configService.get('RMQ_USERS_TRANSPORT_AUTHENTICATE_REQUEST_RK'),
        replyQueue: this.configService.get('RMQ_USERS_TRANSPORT_AUTHENTICATE_REPLY_QUEUE'),
      },
      {
        exchange: this.usersTransportExchange,
        subject: new Subject<{ correlationId: string; data: any }>(),
        routingKey: this.configService.get('RMQ_USERS_TRANSPORT_LOGOUT_REQUEST_RK'),
        replyQueue: this.configService.get('RMQ_USERS_TRANSPORT_LOGOUT_REPLY_QUEUE'),
      },
    ];

    requests.forEach(({ routingKey, exchange, replyQueue, subject }) => {
      this.requestRMQParameters[routingKey] = { exchange, replyQueue, subject };
    });
  }

  private createSubscription(
    queue: string,
    subject: Subject<{ correlationId: string; data: any }>,
  ): void {
    this.amqpConnection.channel.consume(
      queue,
      (msg) => {
        let data: unknown;

        try {
          data = JSON.parse(String(msg.content));
        } catch (e) {
          data = { errors: [ e.message ]};
        }

        subject.next({
          correlationId: msg.properties.correlationId,
          data,
        });
      },
      {
        noAck: true,
      },
    );
  }

  public sendRequest<TRequest, TReply>(
    routingKey: string,
    data: TRequest,
  ): Observable<ICorrelatedMsg<TReply>> {
    const correlationId = uuid();
    const parameters = this.requestRMQParameters[routingKey];
    const exchange = parameters.exchange;
    const replyToQueue = parameters.replyQueue;
    const subject = parameters.subject;

    this.amqpConnection.publish(exchange, routingKey, data, {
      replyTo: replyToQueue,
      correlationId,
    });

    return subject.pipe(
      filter((response: ICorrelatedMsg<TReply>) => response.correlationId === correlationId),
      first(),
    );
  }
}
