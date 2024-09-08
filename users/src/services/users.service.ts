import { Injectable } from '@nestjs/common';

import { TokenService } from './token.service';
import { UserDataService } from './user-data.service';

import { SignUpDto } from '../dto';
import { IInvalidTokeResult, IReply, ITokens, TokenValidation, User } from '../types';


@Injectable()
export class UsersService {
  constructor(
    private readonly tokenService: TokenService,
    private userDataService: UserDataService,
  ) {
  }

  public async checkUsername(username: string): Promise<{ occupied: boolean }> {
    return this.userDataService.checkUsernameOccupation(username);
  }

  public async checkEmail(email: string): Promise<{ occupied: boolean }> {
    return this.userDataService.checkEmailOccupation(email);
  }

  public async signUp(user: SignUpDto): Promise<IReply<{ user: User }>> {
    try {
      const emailOccupation: { occupied: boolean } = await this.checkEmail(user.email);

      if (emailOccupation.occupied) {
        return {
          data: null,
          errors: [ 'Email is already occupied' ],
        };
      }

      // const usernameOccupation: { occupied: boolean } = await this.checkUsername(user.username);

      // if (usernameOccupation.occupied) {
      //   return {
      //     data: null,
      //     errors: [ 'Username is already occupied' ],
      //   };
      // }

      const createdUser: User = await this.userDataService.createUser(user);

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
  ): Promise<IReply<{ user: User; tokens: ITokens }>> {
    try {
      const user: User | null = await this.userDataService
        .validateUserCredentials(emailOrUsername, password);

      if (!user) {
        return {
          data: null,
          errors: [ 'Invalid email, username, or password' ],
        };
      }

      const accessTokenRes: { token: string; expires: number } = this.tokenService.issueToken(user.id, 'access');
      const refreshTokenRes: { token: string; expires: number } = this.tokenService.issueToken(user.id, 'refresh');

      return {
        data: {
          user,
          tokens: {
            accessToken: accessTokenRes.token,
            refreshToken: refreshTokenRes.token,
            expires: refreshTokenRes.expires,
          },
        },
      };
    } catch (e) {
      return {
        data: null,
        errors: [ e.message ],
      };
    }
  }

  public async authenticate(
    accessToken: string,
  ): Promise<IReply<{
    valid: boolean;
    user?: User;
  }>> {
    const tokenValidation: TokenValidation = await this.tokenService.validateAccessToken(accessToken);

    if (!tokenValidation.valid) {
      return {
        data: null,
        errors: [ (tokenValidation as IInvalidTokeResult).reason as string ],
      };
    }

    const user: User | null = await this.userDataService.getUserById(tokenValidation.userId);

    if (!user) {
      return {
        data: null,
        errors: [ 'User not found' ],
      };
    }

    return {
      data: { valid: true, user },
    };
  }

  public async refreshTokens(
    refreshToken: string,
  ): Promise<IReply<{ user: User; tokens: ITokens }>> {
    try {
      const tokenValidation: TokenValidation = await this.tokenService.validateRefreshToken(refreshToken);

      if (!tokenValidation.valid) {
        return {
          data: null,
          errors: [ (tokenValidation as IInvalidTokeResult).reason as string ],
        };
      }

      const user: User | null = await this.userDataService.getUserById(tokenValidation.userId);

      if (!user) {
        return {
          data: null,
          errors: [ 'User not found' ],
        };
      }

      const accessTokenRes: { token: string; expires: number } = this.tokenService.issueToken(user.id, 'access');
      const refreshTokenRes: { token: string; expires: number } = this.tokenService.issueToken(user.id, 'refresh');

      return {
        data: {
          user,
          tokens: {
            accessToken: accessTokenRes.token,
            refreshToken: refreshTokenRes.token,
            expires: refreshTokenRes.expires,
          },
        },
      };
    } catch (e) {
      return {
        data: null,
        errors: [ e.message ],
      };
    }
  }
}
