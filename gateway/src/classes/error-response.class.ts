import { HttpStatus } from '@nestjs/common';

import { IResponse } from '../types';


export class ErrorResponse implements IResponse<null> {
  public status: HttpStatus;
  public data: null;
  public errors: string[];

  constructor(status: number | HttpStatus, errorMessages: string[] | string) {
    this.status = status ?? HttpStatus.INTERNAL_SERVER_ERROR;
    this.data = null;

    this.errors = Array.isArray(errorMessages)
      ? [ ...errorMessages ]
      : [ errorMessages ];
  }
}
