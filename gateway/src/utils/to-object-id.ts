import { BadRequestException } from '@nestjs/common';

import ObjectID from 'bson-objectid';
import { TransformFnParams } from 'class-transformer';


export function toObjectIdFn({ value, key }: { [key: string]: string }): ObjectID {
  if (!ObjectID.isValid(value) || String(value) !== value) {
    throw new BadRequestException(`${key} is not a valid ObjectId`);
  }

  return new ObjectID(value);
}

export const toObjectId: (data: TransformFnParams) => ObjectID = (data: TransformFnParams) =>
  toObjectIdFn({ value: data.value, key: data.key });

