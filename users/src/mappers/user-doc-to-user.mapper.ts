import { IUserDoc } from '../schemas';
import { User } from '../types';


export function userDocToUser(doc: IUserDoc): User {
  return {
    id: String(doc._id),
    ...(doc.username && { username: doc.username }),
    avatar: doc.avatar ? doc.avatar : '',
    role: doc.role,
    firstName: doc.firstName,
    ...(doc.middleName && { middleName: doc.middleName }),
    lastName: doc.lastName,
    email: doc.email,
    ...(doc.phoneNumber && { phoneNumber: doc.phoneNumber }),
    emailConfirmed: doc.emailConfirmed,
    phoneConfirmed: doc.phoneConfirmed,
    deactivated: doc.deactivated,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
