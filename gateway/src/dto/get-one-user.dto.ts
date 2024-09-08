import ObjectID from 'bson-objectid';
import { Transform, Type } from 'class-transformer';
import { IsDefined } from 'class-validator';

import { toObjectId } from '../utils';


export class GetOneUserDto {
  @IsDefined()
  @Transform(toObjectId)
  @Type(() => ObjectID)
  id: ObjectID;
}
