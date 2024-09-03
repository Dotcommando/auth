import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';

import { createHash } from 'crypto';
import { Model, Types } from 'mongoose';

import { DEFAULT_USER_DATA, INVALID_TOKEN_REASON } from '../constants';
import { userDocToUser } from '../mappers';
import { ITokenDoc, IUserDoc } from '../schemas';
import { IToken, ITokens, IUser } from '../types';


@Injectable()
export class UserDataService {
  private jwtSecretKey = this.configService.get('JWT_SECRET_KEY');

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

  public async validateUserCredentials(
    emailOrUsername: string,
    password: string,
  ): Promise<Omit<IUser<string>, 'password'> | null> {
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

  public issueToken(
    userId: string | Types.ObjectId,
    tokenType: 'refresh' | 'access' = 'access',
  ): string {
    const options = { secret: this.jwtSecretKey };
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
        iat: now,
      },
      options,
    );
  }

  public async validateAccessToken(
    token: string,
    userId: string | Types.ObjectId,
  ): Promise<{ valid: boolean; reason?: INVALID_TOKEN_REASON }> {
    try {
      const decodedToken = this.jwtService.verify(token, { secret: this.jwtSecretKey });

      if (decodedToken.sub !== String(userId)) {
        return { valid: false, reason: INVALID_TOKEN_REASON.ACCESS_TOKEN_WRONG_USER };
      }

      const encryptedToken = this.getEncryptedToken(token);
      const tokenDoc: ITokenDoc = await this.tokenModel.findOne({
        refreshToken: encryptedToken,
        userId,
      }).exec();

      if (tokenDoc?.blacklisted) {
        return { valid: false, reason: INVALID_TOKEN_REASON.ACCESS_TOKEN_BLACKLISTED };
      }

      if (Date.now() > decodedToken.exp) {
        return { valid: false, reason: INVALID_TOKEN_REASON.ACCESS_TOKEN_EXPIRED };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, reason: INVALID_TOKEN_REASON.ACCESS_TOKEN_CANNOT_BE_DECRYPTED };
    }
  }

  public async validateRefreshToken(
    token: string,
    userId: string | Types.ObjectId,
  ): Promise<{ valid: boolean; reason?: INVALID_TOKEN_REASON }> {
    try {
      const decodedToken = this.jwtService.verify(token, { secret: this.jwtSecretKey });

      if (decodedToken.sub !== String(userId)) {
        return { valid: false, reason: INVALID_TOKEN_REASON.REFRESH_TOKEN_WRONG_USER };
      }

      const encryptedToken = this.getEncryptedToken(token);
      const tokenDoc: ITokenDoc = await this.tokenModel.findOne({
        refreshToken: encryptedToken,
        userId,
      }).exec();

      if (tokenDoc?.blacklisted) {
        return { valid: false, reason: INVALID_TOKEN_REASON.REFRESH_TOKEN_BLACKLISTED };
      }

      if (Date.now() > new Date(tokenDoc.expiredAfter).getTime()) {
        return { valid: false, reason: INVALID_TOKEN_REASON.REFRESH_TOKEN_EXPIRED };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, reason: INVALID_TOKEN_REASON.REFRESH_TOKEN_CANNOT_BE_DECRYPTED };
    }
  }

  private getEncryptedToken(token: string): string {
    return createHash('sha256')
      .update(`${this.jwtSecretKey}:${token}`)
      .digest('hex');
  }
}
