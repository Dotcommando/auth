import { ROLE } from '../constants';
import { IUser } from '../types';


export const DEFAULT_USER_DATA: Omit<IUser, '_id'> = {
  firstName: '',
  lastName: '',
  email: '',
  avatar: '',
  addresses: [],
  phoneNumber: '',
  role: ROLE.USER,
  orders: [],
  emailConfirmed: false,
  phoneConfirmed: false,
  deactivated: false,
};
