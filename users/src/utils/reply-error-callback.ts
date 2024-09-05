import { HttpException, HttpExceptionBody } from '@nestjs/common';

import { Channel, ConsumeMessage } from 'amqplib';

import { IReply } from '../types';


export function replyErrorCallbackConfigurator(
  rmqReplyParams: {
    [key: string]: {
      exchange: string;
      routingKey: string;
      replyQueue: string;
    };
  },
): {
  (
    channel: Channel,
    msg: ConsumeMessage,
    error: Error,
  ): Promise<void>;
} {
  const replyParams = rmqReplyParams;

  async function replyErrorCallback(
    channel: Channel,
    msg: ConsumeMessage,
    error: HttpException,
  ): Promise<void> {
    try {
      channel.ack(msg);

      const replyToQueue = msg.properties.replyTo;
      const correlationId = msg.properties.correlationId;
      const originalRoutingKey = msg.fields.routingKey;
      const { exchange, routingKey } = replyParams[originalRoutingKey];
      const errorResponse = error.getResponse() as unknown as HttpExceptionBody;
      const errorMessage = typeof errorResponse === 'string'
        ? [ errorResponse ]
        : errorResponse.message && Array.isArray(errorResponse.message)
          ? errorResponse.message as string[]
          : [ error.message ] as string[];
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

  return replyErrorCallback;
}
