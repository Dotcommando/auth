import { HttpException } from '@nestjs/common';

import { Channel, ConsumeMessage } from 'amqplib';

import { IReply } from '../types';


export async function rmqErrorHandler(
  channel: Channel,
  msg: ConsumeMessage,
  error: HttpException,
): Promise<void> {
  try {
    channel.ack(msg);

    const replyToQueue = msg.properties.replyTo;
    const correlationId = msg.properties.correlationId;
    const { exchange, routingKey } = msg.fields;
    const errorMessage = [ error.message ] as string[];
    const errorReply: IReply<any> = {
      errors: errorMessage,
      data: null,
    };

    if (replyToQueue) {
      channel.sendToQueue(
        replyToQueue,
        Buffer.from(JSON.stringify(errorReply)),
        {
          correlationId,
          routingKey,
        },
      );
      console.log(`Error message sent to replyTo queue: ${replyToQueue} with correlationId: ${correlationId}`);
    } else {
      channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(errorReply)),
        {
          correlationId: correlationId,
        },
      );
      console.log(`Error message sent to ${exchange} with routing key ${routingKey} and correlationId: ${correlationId}`);
    }
  } catch (err) {
    console.error('Failed to handle error properly:', err);
  }
}
