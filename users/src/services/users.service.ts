import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { UserDataService } from './user-data.service';

import { SignUpDto } from '../dto';
import { IReply, ITokens, IUser } from '../types';


@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private userDataService: UserDataService,
  ) {
  }

  public async checkUsername(username: string): Promise<{ occupied: boolean }> {
    return this.userDataService.checkUsernameOccupation(username);
  }

  public async checkEmail(email: string): Promise<{ occupied: boolean }> {
    return this.userDataService.checkEmailOccupation(email);
  }

  public async signUp(user: SignUpDto): Promise<IReply<{ user: Omit<IUser<string>, 'password'> }>> {
    try {
      const emailOccupation: { occupied: boolean } = await this.checkEmail(user.email);

      if (emailOccupation.occupied) {
        return {
          data: null,
          errors: [ 'Email is already occupied' ],
        };
      }

      const usernameOccupation: { occupied: boolean } = await this.checkUsername(user.username);

      if (usernameOccupation.occupied) {
        return {
          data: null,
          errors: [ 'Username is already occupied' ],
        };
      }

      const createdUser: Omit<IUser<string>, 'password'> = await this.userDataService.createUser(user);

      return {
        data: { user: createdUser },
      };
    } catch (e) {
      return {
        data: null,
        errors: [ e.message ],
      };
    }
  }

  public async signIn(
    emailOrUsername: string,
    password: string,
  ): Promise<IReply<{ user: Omit<IUser<string>, 'password'>; tokens: ITokens }>> {
    const user: Omit<IUser<string>, 'password'> | null = await this.userDataService
      .validateUserCredentials(emailOrUsername, password);

    if (!user) {
      return {
        data: null,
        errors: [ 'Invalid email, username, or password' ],
      };
    }

    const accessToken = this.userDataService.issueToken(user.id, 'access');
    const refreshToken = this.userDataService.issueToken(user.id, 'refresh');

    return {
      data: {
        user,
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    };
  }
}
