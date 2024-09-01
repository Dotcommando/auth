import { IUserDoc } from '../schemas';
import { IUser } from '../types';


export function mapUserDocToUser(userDoc: IUserDoc): IUser<string> {
  return {
    id: String(userDoc._id),
    firstName: userDoc.firstName,
    middleName: userDoc.middleName,
    lastName: userDoc.lastName,
    username: userDoc.username,
    email: userDoc.email,
    avatar: userDoc.avatar,
    phoneNumber: userDoc.phoneNumber,
    role: userDoc.role,
    emailConfirmed: userDoc.emailConfirmed,
    phoneConfirmed: userDoc.phoneConfirmed,
    deactivated: userDoc.deactivated,
  };
}
