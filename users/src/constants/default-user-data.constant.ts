import { ROLE } from './role.enum';

import { IUser } from '../types';


export const DEFAULT_USER_DATA: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'> = {
  firstName: '',
  lastName: '',
  email: '',
  avatar: '',
  role: ROLE.USER,
  emailConfirmed: false,
  phoneConfirmed: false,
  deactivated: false,
};
