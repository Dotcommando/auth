import { IUser } from '../types';


export interface ILogoutRes {
  user: Pick<IUser, 'firstName' | 'middleName' | 'lastName' | 'username'>;
}
