import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';


@Injectable()
export class TransportService {
  private exchange = this.configService.get('RMQ_USERS_TRANSPORT_EXCHANGE');

  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly configService: ConfigService,
  ) {}

  public async request<TRequest, TResponse>(routingKey: string, payload: TRequest): Promise<any> {
    return this.amqpConnection.request<TResponse>({
      exchange: this.exchange,
      routingKey,
      payload,
      timeout: 5000,
    });
  }

  public async publish<T>(routingKey: string, payload: T): Promise<void> {
    this.amqpConnection.publish(this.exchange, routingKey, payload);
  }
}
