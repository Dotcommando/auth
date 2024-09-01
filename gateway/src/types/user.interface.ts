import ObjectID from 'bson-objectid';

import { IBasicUserData } from './basic-user-data.interface';

import { ROLE } from '../constants';


export interface IUser<T_id = ObjectID> extends IBasicUserData {
  id: T_id;
  username?: string;
  avatar: string;
  role: ROLE;
  emailConfirmed: boolean;
  phoneConfirmed: boolean;
  deactivated: boolean;
}
