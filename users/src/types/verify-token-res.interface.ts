import { IUser } from '../types';

export interface IVerifyTokenRes {
  verified: boolean;
  user: IUser;
}
