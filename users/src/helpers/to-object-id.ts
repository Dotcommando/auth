import { BadRequestException } from '@nestjs/common';

import { TransformFnParams } from 'class-transformer';
import { Types } from 'mongoose';


export function toObjectIdFn({ value, key }: { [key: string]: string }): Types.ObjectId {
  if (!Types.ObjectId.isValid(value) || String(value) !== value) {
    throw new BadRequestException(`${key} is not a valid ObjectId`);
  }

  return new Types.ObjectId(value);
}

export const toObjectId: (data: TransformFnParams) => Types.ObjectId = (data: TransformFnParams) =>
  toObjectIdFn({ value: data.value, key: data.key });

