import { Types } from 'mongoose';


export interface IToken<T_id = Types.ObjectId> {
  id: T_id;
  userId: T_id;
  accessToken?: string;
  refreshToken: string;
  issuedForUserAgent: T_id;
  issuedAt: Date;
  expiredAfter: Date;
  blacklisted: boolean;
}
