import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

import {
  EMAIL_MAX_LENGTH,
  EMAIL_REGEXP,
  FIRST_NAME_MAX_LENGTH,
  LAST_NAME_MAX_LENGTH,
  MIDDLE_NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  NAME_REGEXP,
  PHONE_NUMBER_MAX_LENGTH,
  ROLE,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_REGEXP,
} from '../constants';
import { IUser } from '../types';
import { optionalRange } from '../validators';


function safeValue(doc, ret: { [key: string]: unknown }) {
  delete ret.password;
  delete ret.id;
}

const SALT_LENGTH = 16;

export interface IUserDoc extends Omit<IUser, 'id'>, Document<IUser> {
  password: string;
  compareEncryptedPassword: (password: string) => boolean;
  getEncryptedPassword: (password: string) => string;
}

export const UserSchema = new Schema<IUserDoc, mongoose.Model<IUserDoc>>(
  {
    firstName: {
      type: Schema.Types.String,
      required: [ true, 'First name is required' ],
      minLength: NAME_MIN_LENGTH,
      maxLength: FIRST_NAME_MAX_LENGTH,
      match: [ NAME_REGEXP, 'First name can contain just latin symbols, digits, underscores and single quotes' ],
    },
    middleName: {
      type: Schema.Types.String,
      validate: optionalRange(NAME_MIN_LENGTH, MIDDLE_NAME_MAX_LENGTH),
      match: [ NAME_REGEXP, 'Middle name can contain just latin symbols, digits, underscores and single quotes' ],
    },
    lastName: {
      type: Schema.Types.String,
      required: [ true, 'Last name is required' ],
      minLength: NAME_MIN_LENGTH,
      maxLength: LAST_NAME_MAX_LENGTH,
      match: [ NAME_REGEXP, 'Last name can contain just latin symbols, digits, underscores and single quotes' ],
    },
    username: {
      type: Schema.Types.String,
      validate: optionalRange(USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH),
      // @ts-ignore
      match: [
        USERNAME_REGEXP,
        'Username should includes English letters, digits and dots only',
      ],
      index: {
        unique: true,
        partialFilterExpression: {
          'username': { $exists: true },
        },
      },
    },
    email: {
      type: Schema.Types.String,
      required: [ true, 'Email can not be empty' ],
      index: { unique: true },
      lowercase: true,
      match: [ EMAIL_REGEXP, 'Email should be valid' ],
      maxLength: EMAIL_MAX_LENGTH,
    },
    avatar: {
      type: Schema.Types.String,
    },
    phoneNumber: {
      type: Schema.Types.String,
      validate: optionalRange(6, PHONE_NUMBER_MAX_LENGTH),
    },
    role: {
      type: Schema.Types.String,
      required: [ true, 'User must have a role' ],
      default: ROLE.USER,
      enum: [
        ROLE.SUPERADMIN,
        ROLE.ADMIN,
        ROLE.USER,
        ROLE.GUEST,
      ],
    },
    emailConfirmed: {
      type: Schema.Types.Boolean,
      required: [ true, 'Email confirmation field can not be empty' ],
    },
    phoneConfirmed: {
      type: Schema.Types.Boolean,
      required: [ true, 'Phone confirmation field can not be empty' ],
    },
    password: {
      type: Schema.Types.String,
      required: [ true, 'Password can not be empty' ],
    },
    deactivated: {
      type: Schema.Types.Boolean,
      default: false,
    },
    updatedAt: {
      type: Schema.Types.Date,
      default: Date.now,
    },
    createdAt: {
      type: Schema.Types.Date,
      default: Date.now,
    },
  },
  {
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: safeValue,
    },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: safeValue,
    },
  },
);

UserSchema.methods = {
  getEncryptedPassword(password: string) {
    const salt = randomBytes(SALT_LENGTH).toString('hex');
    const hashedPassword = scryptSync(password, salt, 64).toString('hex');

    return `${salt}:${hashedPassword}`;
  },

  async compareEncryptedPassword(password: string) {
    const [ salt, hashedPassword ] = this.password.split(':');
    const hashedBuffer = scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(hashedPassword, 'hex');

    return timingSafeEqual(hashedBuffer, keyBuffer);
  },
};

UserSchema.pre<IUserDoc>('save', async function(next) {
  const self = this as IUserDoc;

  self.email = self.email.toLowerCase();

  if (!this.isModified('password')) {
    return next();
  }

  self.password = self.getEncryptedPassword(self.password);
  next();
});

UserSchema.pre<IUserDoc>('updateOne', async function(next) {
  try {
    if (this?.['_update']?.password) {
      // @ts-ignore
      const docToUpdate = await this.model.findOne(this.getQuery());

      this['_update'].password = docToUpdate.getEncryptedPassword(this['_update'].password);
    }

    if (this?.['_update']?.email) {
      this['_update'].email = this['_update'].email.toLowerCase();
    }

    next(null);
  } catch (e) {
    next(e);
  }
});

export const UserModel = mongoose.model<IUserDoc, mongoose.Model<IUserDoc>>('User', UserSchema);
