import ObjectID from 'bson-objectid';

import { ROLE } from '../constants';


export interface IUser<T_id = ObjectID> {
  id: T_id;
  username?: string;
  avatar: string;
  role: ROLE;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  emailConfirmed: boolean;
  phoneConfirmed: boolean;
  deactivated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type User = Omit<IUser<string>, 'password'>;
