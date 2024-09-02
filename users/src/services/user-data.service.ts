import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';

import { DEFAULT_USER_DATA } from '../constants';
import { userDocToUser } from '../mappers';
import { ITokenDoc, IUserDoc } from '../schemas';
import { IToken, IUser } from '../types';


@Injectable()
export class UserDataService {
  constructor(
    @InjectModel('Token') private readonly tokenModel: Model<ITokenDoc>,
    @InjectModel('User') private readonly userModel: Model<IUserDoc>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
  }

  public async createUser(newUser: Partial<IUser>): Promise<Omit<IUser<string>, 'password'>> {
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

  private issueToken(
    userId: string | Types.ObjectId,
    userAgent: string = '',
    tokenType: 'refresh' | 'access' = 'access',
  ): string {
    const options = { secret: this.configService.get('secretKey') };
    const now = Date.now();

    return this.jwtService.sign(
      {
        sub: String(userId),
        aud: this.configService.get('JWT_AUDIENCE'),
        iss: this.configService.get('JWT_ISSUER'),
        azp: this.configService.get('JWT_AUTHORIZED_PARTY'),
        exp: now + (tokenType === 'access'
          ? this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN')
          : this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN')),
        uag: userAgent,
        iat: now,
      },
      options,
    );
  }
}
