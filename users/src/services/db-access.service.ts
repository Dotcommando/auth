import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';

import { createHash } from 'crypto';
import { Model, Types } from 'mongoose';

import { BEARER_PREFIX, EMAIL_REGEXP, JWT_SECRET_KEY, USERNAME_REGEXP } from '../constants';
import { DEFAULT_USER_DATA } from '../constants';
import { AddressedErrorCatching, ApplyAddressedErrorCatching } from '../decorators';
import { DeleteUserDto, UpdateUserDto } from '../dto';
import { PartialTokenDto } from '../dto/token.dto';
import { PartialUserDto } from '../dto/user.dto';
import { pickProperties } from '../helpers';
import { mapUserDocToUser } from '../helpers';
import { ITokenDoc, IUserDoc } from '../schemas';
import { IToken, IUser } from '../types';
import {
  IEmailPassword,
  ILogoutRes,
  IUsernamePassword,
  IValidateUserRes,
  RefreshTokenData,
  UserCredentialsReq,
} from '../types';


@ApplyAddressedErrorCatching
@Injectable()
export class DbAccessService {
  constructor(
    @InjectModel('Token') private readonly tokenModel: Model<ITokenDoc>,
    @InjectModel('User') private readonly userModel: Model<IUserDoc>,
  ) {
  }

  public async getUser(_id: Types.ObjectId | string): Promise<IUser<string> | null> {
    const userDoc: IUserDoc = await this.userModel.findOne({
      _id: _id instanceof Types.ObjectId ? _id : new Types.ObjectId(_id),
    }).exec();

    return userDoc ? mapUserDocToUser(userDoc) : null;
  }

  @AddressedErrorCatching()
  public async checkUsernameOccupation(username: string): Promise<{ occupied: boolean }> {
    if (typeof username !== 'string' || !USERNAME_REGEXP.test(username)) {
      throw new BadRequestException('Email is not valid');
    }

    const userDoc = await this.userModel.findOne({ username });

    return { occupied: Boolean(userDoc) };
  }

  @AddressedErrorCatching()
  public async checkEmailOccupation(email: string): Promise<{ occupied: boolean }> {
    if (typeof email !== 'string' || !EMAIL_REGEXP.test(email)) {
      throw new BadRequestException('Email is not valid');
    }

    const userDoc = await this.userModel.findOne({ email });

    return { occupied: Boolean(userDoc) };
  }

  @AddressedErrorCatching()
  public async validateUser(user: UserCredentialsReq): Promise<IValidateUserRes> {
    const emailDefined = 'email' in user;

    if ((!('username' in user) && !(emailDefined)) || (!(user as IUsernamePassword).username && !(user as IEmailPassword).email)) {
      throw new BadRequestException('Something one required: email or username');
    }

    const userDoc: IUserDoc = await this.userModel.findOne({
      ...(emailDefined && { email: (user as IEmailPassword).email }),
      ...(!emailDefined && { username: (user as IUsernamePassword).username }),
    });

    const userIsValid = userDoc
      ? await userDoc.compareEncryptedPassword(user.password)
      : false;

    return {
      userIsValid,
      ...(userIsValid && { user: userDoc.toJSON() as IUser }),
    };
  }

  @AddressedErrorCatching()
  public async saveNewUser(user: PartialUserDto): Promise<{ user: IUser }> {
    const userDoc: IUserDoc = new this.userModel({ ...DEFAULT_USER_DATA, ...user });
    const savedUserDoc = await userDoc.save();

    return { user: savedUserDoc.toJSON() as IUser };
  }

  public async saveRefreshToken(token: RefreshTokenData): Promise<{ saved: boolean }> {
    try {
      const newToken = new this.tokenModel(token);
      const saved = await newToken.save();

      return {
        saved: Boolean(saved),
      };
    } catch (e) {
      return {
        saved: false,
      };
    }
  }

  @AddressedErrorCatching()
  public async checkAccessToken(accessToken): Promise<{ blacklisted: boolean }> {
    const tokenDoc: ITokenDoc | null = await this.tokenModel
      .findOne({
        $or: [
          { accessToken: accessToken.replace(BEARER_PREFIX, '') },
          { refreshToken: this.encryptRefreshToken(accessToken) },
        ],
      });

    return {
      blacklisted: tokenDoc
        ? tokenDoc.blacklisted
        : false,
    };
  }

  @AddressedErrorCatching()
  public async findManyUsers(userIds: Array<string | Types.ObjectId>): Promise<IUser[] | null> {
    const ids = userIds.map((userId: string | Types.ObjectId) => new Types.ObjectId(userId));
    const userDocs: IUserDoc[] = await this.userModel.find({
      _id: { $in: ids },
    });

    if (!userDocs || !userDocs.length) {
      return null;
    }

    return userDocs.map((userDoc: IUserDoc) => userDoc.toJSON());
  }

  public async findUserById(userId: string | Types.ObjectId): Promise<IUser | null> {
    return (await this.findManyUsers([ userId ]))?.[0] ?? null;
  }

  @AddressedErrorCatching()
  private encryptRefreshToken(refreshToken: string): string {
    return createHash('sha256')
      .update(`${JWT_SECRET_KEY}:${refreshToken.replace(BEARER_PREFIX, '')}`)
      .digest('hex') ;
  }

  @AddressedErrorCatching()
  public async findRefreshToken(refreshToken: string): Promise<IToken | null> {
    const encryptedToken = this.encryptRefreshToken(refreshToken);

    const foundToken: ITokenDoc = await this.tokenModel.findOne({ refreshToken: encryptedToken });

    return foundToken ? foundToken.toJSON() as IToken : null;
  }

  @AddressedErrorCatching()
  public async updateToken(filter: PartialTokenDto, updates: PartialTokenDto): Promise<IToken> {
    const updatedFilter: PartialTokenDto = {
      ...filter,
      ...(filter?.id && { _id: new Types.ObjectId(filter.id) }),
      ...(filter?.refreshToken && { refreshToken: this.encryptRefreshToken(filter.refreshToken) }),
    };

    const updatedUpdates: PartialTokenDto = {
      ...updates,
      ...(updates?.accessToken && { accessToken: updates.accessToken.replace(BEARER_PREFIX, '') }),
    };

    const updatedToken: ITokenDoc | null = await this.tokenModel
      .findOneAndUpdate(updatedFilter, updatedUpdates, { returnDocument: 'after' });

    if (!updatedToken) {
      throw new NotFoundException('Token to update not found');
    }

    return updatedToken.toJSON() as IToken;
  }

  @AddressedErrorCatching()
  public async updateUser(data: UpdateUserDto): Promise<IUser<string>> {
    const updates: Partial<UpdateUserDto> = pickProperties(
      data,
      'firstName', 'middleName', 'lastName', 'username', 'avatar', 'phoneNumber', 'email',
    );

    let areFieldsToUpdate = false;
    let areFieldsToRemove = false;
    const valuesToUnset = {};
    const valuesToSet = {};

    for (const field in updates) {
      if (updates[field] === null || updates[field] === undefined) {
        areFieldsToRemove = true;
        valuesToUnset[field] = '';
      } else {
        areFieldsToUpdate = true;
        valuesToSet[field] = updates[field];

        if (field === 'email') {
          valuesToSet['emailConfirmed'] = false;
        } else if (field === 'phoneNumber') {
          valuesToSet['phoneConfirmed'] = false;
        }
      }
    }

    const updateUserDoc: IUserDoc | null = await this.userModel.findOneAndUpdate(
      {
        _id: data.id,
      },
      {
        ...(areFieldsToUpdate && {
          $set: valuesToSet,
        }),
        ...(areFieldsToRemove && {
          $unset: valuesToUnset,
        }),
      },
      {
        new: true,
      },
    )
      .populate('addresses');

    return updateUserDoc ? mapUserDocToUser(updateUserDoc) : null;
  }

  @AddressedErrorCatching()
  public async deleteUser(data: DeleteUserDto): Promise<ILogoutRes> {
    const deletedUserResponse = await this.userModel.findByIdAndRemove(data.id);

    if (!deletedUserResponse) {
      return null;
    }

    return {
      user: {
        firstName: deletedUserResponse.firstName,
        ...(deletedUserResponse.middleName && { middleName: deletedUserResponse.middleName }),
        lastName: deletedUserResponse.lastName,
        ...(deletedUserResponse.username && { username: deletedUserResponse.username }),
      },
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  private async removeExpiredTokens(): Promise<void> {
    await this.tokenModel.deleteMany({ expiredAfter: { $lt: new Date() }});
  }
}
