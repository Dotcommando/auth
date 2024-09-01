import { IUser } from '../types';

export interface IValidateUserRes {
  userIsValid: boolean;
  user?: IUser;
}
