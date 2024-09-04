import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { DEFAULT_USER_DATA } from '../constants';
import { userDocToUser } from '../mappers';
import { IUserDoc } from '../schemas';
import { IUser, User } from '../types';


@Injectable()
export class UserDataService {
  constructor(
    @InjectModel('Users') private readonly userModel: Model<IUserDoc>,
  ) {
  }

  public async createUser(newUser: Partial<IUser>): Promise<User> {
    const userToCreate: Partial<IUser> = {
      ...DEFAULT_USER_DATA,
      ...newUser,
      email: newUser.email?.toLowerCase(),
    };

    const createdUserDoc: IUserDoc = new this.userModel(userToCreate);
    const savedUserDoc: IUserDoc = await createdUserDoc.save();

    return userDocToUser(savedUserDoc);
  }

  public async checkEmailOccupation(email: string): Promise<{ occupied: boolean }> {
    const normalizedEmail = email.toLowerCase();
    const user: IUserDoc = await this.userModel.findOne({ email: normalizedEmail }).exec();

    return { occupied: Boolean(user) };
  }

  public async checkUsernameOccupation(username: string): Promise<{ occupied: boolean }> {
    const user: IUserDoc = await this.userModel.findOne({ username }).exec();

    return { occupied: Boolean(user) };
  }

  public async validateUserCredentials(
    emailOrUsername: string,
    password: string,
  ): Promise<User | null> {
    const user: IUserDoc = await this.userModel.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername },
      ],
    }).exec();

    if (!user) {
      return null;
    }

    const isPasswordValid = await user.compareEncryptedPassword(password);

    if (!isPasswordValid) {
      return null;
    }

    return userDocToUser(user);
  }

  public async getUserById(userId: string): Promise<User | null> {
    const user: IUserDoc | null = await this.userModel.findById(userId).exec();

    if (!user) {
      return null;
    }

    return userDocToUser(user);
  }
}
