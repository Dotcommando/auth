import * as bcrypt from 'bcrypt';
import * as mongoose from 'mongoose';
import { Document, Schema, Types } from 'mongoose';

import {
  EMAIL_REGEXP,
  IMAGE_ADDRESS_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  NAME_REGEXP,
  PASSWORD_MIN_LENGTH,
  PHONE_NUMBER_MAX_LENGTH,
  PHONE_NUMBER_MIN_LENGTH,
  PROPERTY_LENGTH_64,
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

const SALT_ROUNDS = 10;

export interface IUserDoc extends Omit<IUser, 'id'>, Document<IUser> {
  password: string;
  compareEncryptedPassword: (password: string) => boolean;
  getEncryptedPassword: (password: string) => string;
}

export const UserSchema = new Schema<IUserDoc, mongoose.Model<IUserDoc>>(
  {
    firstName: {
      type: String,
      required: [ true, 'First name is required' ],
      minLength: NAME_MIN_LENGTH,
      maxLength: NAME_MAX_LENGTH,
      match: [ NAME_REGEXP, 'First name can contain just latin symbols, digits, underscores and single quotes' ],
    },
    middleName: {
      type: String,
      validate: optionalRange(NAME_MIN_LENGTH, NAME_MAX_LENGTH),
      match: [ NAME_REGEXP, 'Middle name can contain just latin symbols, digits, underscores and single quotes' ],
    },
    lastName: {
      type: String,
      required: [ true, 'Last name is required' ],
      minLength: NAME_MIN_LENGTH,
      maxLength: NAME_MAX_LENGTH,
      match: [ NAME_REGEXP, 'Last name can contain just latin symbols, digits, underscores and single quotes' ],
    },
    username: {
      type: String,
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
      type: String,
      required: [ true, 'Email can not be empty' ],
      index: { unique: true },
      lowercase: true,
      match: [ EMAIL_REGEXP, 'Email should be valid' ],
      maxLength: PROPERTY_LENGTH_64,
    },
    avatar: {
      type: String,
      validate: optionalRange(0, IMAGE_ADDRESS_MAX_LENGTH),
    },
    phoneNumber: {
      type: String,
      validate: optionalRange(PHONE_NUMBER_MIN_LENGTH, PHONE_NUMBER_MAX_LENGTH),
    },
    role: {
      type: String,
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
      type: String,
      required: [ true, 'Password can not be empty' ],
      minlength: [ PASSWORD_MIN_LENGTH, 'Password should include at least 6 symbols' ],
    },
    deactivated: {
      type: Schema.Types.Boolean,
      default: false,
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
    return bcrypt.hash(String(password), SALT_ROUNDS);
  },

  async compareEncryptedPassword(password: string) {
    // @ts-ignore
    return await bcrypt.compare(password, this.password);
  },
};

UserSchema.pre<IUserDoc>('save', async function(next) {
  const self = this as IUserDoc;

  self.email = self.email.toLowerCase();

  if (!this.isModified('password')) {
    return next();
  }
  // @ts-ignore
  self.password = await self.getEncryptedPassword(self.password);
  next();
});

UserSchema.pre<IUserDoc>('updateOne', async function(next) {
  try {
    if (this?.['_update']?.password) {
      // @ts-ignore
      const docToUpdate = await this.model.findOne(this.getQuery());

      this['_update'].password = await docToUpdate.getEncryptedPassword(this['_update'].password);
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
