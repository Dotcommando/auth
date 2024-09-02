import { ArgumentsHost, Catch, RpcExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import { Observable, throwError } from 'rxjs';

import { IReply } from '../types';


@Catch(RpcException)
export class RabbitMQExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException, host: ArgumentsHost): Observable<IReply<any>> {
    const reply: IReply<any> = {
      data: null,
      errors: [ exception.message ],
    };

    return throwError(() => reply);
  }
}
