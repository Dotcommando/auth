import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { Types } from 'mongoose';

import { DbAccessService } from './db-access.service';

import { LOGIN_ORIGIN } from '../constants';
import { AddressedErrorCatching, ApplyAddressedErrorCatching } from '../decorators';
import {
  DeleteUserDto,
  GetUserDto,
  LogoutDto,
  ReissueTokensBodyDto,
  SignInBodyDto,
  SignUpDto,
  UpdateUserDto,
  VerifyAccessTokenDto,
} from '../dto';
import { PartialTokenDto } from '../dto/token.dto';
import { PartialUserDto } from '../dto/user.dto';
import { IResponse, IToken, IUser } from '../types';
import {
  IIssueTokensRes,
  ILogoutRes,
  ISignInRes,
  IValidateUserRes,
  IVerifyTokenRes,
  UserCredentialsReq,
} from '../types';


@ApplyAddressedErrorCatching
@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private dbAccessService: DbAccessService,
  ) {
  }

  public async checkUsername(user: PartialUserDto): Promise<{ occupied: boolean }> {
    return this.dbAccessService.checkUsernameOccupation(user.username);
  }

  public async checkEmail(user: PartialUserDto): Promise<{ occupied: boolean }> {
    return this.dbAccessService.checkEmailOccupation(user.email);
  }

  @AddressedErrorCatching()
  public async signUp(user: SignUpDto): Promise<IResponse<{ user: IUser }>> {
    const usernameRequired = 'username' in user;
    const requestsToCheck = [
      this.checkEmail(user),
      ...(usernameRequired ? [ this.checkUsername(user) ] : []),
    ];
    const checkResults: PromiseSettledResult<{ occupied: boolean }>[] = await Promise.allSettled(requestsToCheck);

    if (checkResults[0].status === 'rejected' || (usernameRequired && checkResults[1].status === 'rejected')) {
      throw new PreconditionFailedException('Cannot check occupation of email or username');
    } else if ((checkResults[0] as PromiseFulfilledResult<{ occupied: boolean }>).value.occupied) {
      throw new ConflictException(`Email ${ user.email } occupied`);
    } else if (usernameRequired && (checkResults[1] as PromiseFulfilledResult<{ occupied: boolean }>)?.value?.occupied) {
      throw new ConflictException(`Username ${ user.username } occupied`);
    }

    const newUserResponse: { user: IUser } = await this.dbAccessService.saveNewUser(user);

    return {
      status: HttpStatus.CREATED,
      data: {
        user: newUserResponse.user,
      },
      errors: null,
    };
  }

  @AddressedErrorCatching()
  public async validateUser(user: SignInBodyDto): Promise<IResponse<IValidateUserRes>> {
    if ((!('username' in user) && !('email' in user)) || (!user.username && !user.email)) {
      throw new BadRequestException('Something one required: email or username');
    }

    const validationResult: IValidateUserRes = await this.dbAccessService.validateUser(user as UserCredentialsReq);

    return {
      status: HttpStatus.OK,
      data: validationResult,
      errors: null,
    };
  }

  @AddressedErrorCatching()
  private issueToken(userId: string | Types.ObjectId, now: number, tokenType: 'refresh' | 'access' = 'access'): string {
    const options = { secret: this.configService.get('secretKey') };

    return this.jwtService.sign(
      {
        sub: String(userId),
        aud: this.configService.get('audience'),
        iss: this.configService.get('issuer'),
        azp: this.configService.get('authorizedParty'),
        exp: now + (tokenType === 'access' ? this.configService.get('accessTokenExpiresIn') : this.configService.get('refreshTokenExpiresIn')),
        iat: now,
        loginOrigin: LOGIN_ORIGIN.USERNAME_PASSWORD,
      },
      options,
    );
  }

  @AddressedErrorCatching()
  public async issueTokens(userId: string | Types.ObjectId): Promise<IIssueTokensRes> {
    const now = Date.now();
    const accessTokenExpiredAfter = now + this.configService.get('accessTokenExpiresIn');
    const refreshTokenExpiredAfter = now + this.configService.get('refreshTokenExpiresIn');
    const accessToken = this.issueToken(userId, now, 'access');
    const refreshToken = this.issueToken(userId, now, 'refresh');

    await this.dbAccessService.saveRefreshToken({
      userId: new Types.ObjectId(userId),
      refreshToken: refreshToken,
      issuedForUserAgent: new Types.ObjectId(),
      issuedAt: new Date(now),
      expiredAfter: new Date(refreshTokenExpiredAfter),
      blacklisted: false,
    });

    return {
      accessToken,
      refreshToken,
      accessTokenExpiredAfter,
      refreshTokenExpiredAfter,
    };
  }

  @AddressedErrorCatching()
  public async signIn(user: SignInBodyDto): Promise<IResponse<ISignInRes>> {
    const validateUserResponse = await this.validateUser(user);

    if (!validateUserResponse.data.userIsValid) {
      const emailIsDefined = 'email' in user;

      throw new UnauthorizedException(
        `User with such ${ emailIsDefined ? 'email' : 'username' } ${ emailIsDefined ? user.email : user.username } and password not found or password is wrong`,
      );
    }

    const validUser: IUser = { ...validateUserResponse.data.user };
    const issueTokenResponse = await this.issueTokens(validUser.id);

    return {
      status: HttpStatus.OK,
      data: {
        user: validUser,
        ...issueTokenResponse,
      },
      errors: null,
    };
  }

  @AddressedErrorCatching()
  public async verifyAccessToken(data: VerifyAccessTokenDto): Promise<IResponse<IVerifyTokenRes>> {
    const accessToken = this.jwtService.decode(data?.accessToken);

    if (!accessToken) {
      throw new BadRequestException('Access token can not be decoded');
    }

    if (accessToken['exp'] < Date.now()) {
      throw new BadRequestException('Access token expired');
    }

    const verified = Boolean(
      this.jwtService.verify(
        data.accessToken,
        { secret: this.configService.get('secretKey') },
      ),
    );

    if (!verified) {
      throw new UnauthorizedException('Access token is not genuine');
    }

    const checkTokenResult = await this.dbAccessService.checkAccessToken(data.accessToken);

    if (checkTokenResult.blacklisted) {
      throw new UnauthorizedException('Access token is not genuine');
    }

    const userId = accessToken['sub'];
    const user = await this.dbAccessService.findUserById(userId);

    if (!user) {
      throw new PreconditionFailedException(`Cannot get user by Id ${ userId }`);
    }

    return {
      status: HttpStatus.OK,
      data: {
        verified,
        user,
      },
      errors: null,
    };
  }

  @AddressedErrorCatching()
  public async reissueTokens(data: ReissueTokensBodyDto): Promise<IResponse<IIssueTokensRes>> {
    const accessToken = this.jwtService.decode(data?.accessToken);
    const refreshToken = this.jwtService.decode(data?.refreshToken);
    const userId = new Types.ObjectId(refreshToken?.['sub']);

    if (!accessToken && refreshToken) {
      await this.dbAccessService.updateToken({
        userId,
        refreshToken: data.refreshToken,
      }, {
        blacklisted: true,
      });

      throw new BadRequestException('Cannot decode Access token for reissuing');
    } else if (!accessToken && !refreshToken) {
      // If authentication works fine, there is unreachable code, because the user
      // got the access via valid refreshToken, which he used as accessToken.
      throw new BadRequestException('Cannot decode tokens for reissuing');
    } else if (accessToken && !refreshToken) {
      // The same.
      throw new BadRequestException('Cannot decode Refresh token for reissuing');
    }

    const getRefreshToken: IToken = await this.dbAccessService.findRefreshToken(data.refreshToken);

    if (getRefreshToken.blacklisted) {
      // The same.
      throw new BadRequestException('Refresh token blacklisted');
    }

    if (!refreshToken?.['exp'] || (new Date(refreshToken?.['exp'])).getTime() < Date.now()) {
      await this.dbAccessService.updateToken({
        userId,
        refreshToken: data.refreshToken,
      }, {
        accessToken: data.accessToken,
        blacklisted: true,
      } as PartialTokenDto);

      throw new BadRequestException('Refresh token is expired or has no expiration date');
    }

    const issueTokensRes: IIssueTokensRes = await this.issueTokens(userId);

    await this.dbAccessService.updateToken({
      userId,
      refreshToken: data.refreshToken,
    }, {
      accessToken: data.accessToken,
      blacklisted: true,
    } as PartialTokenDto);

    return {
      status: HttpStatus.OK,
      data: issueTokensRes,
      errors: null,
    };
  }

  @AddressedErrorCatching()
  public async getUser(data: GetUserDto): Promise<IResponse<{ user: IUser<IAddress> }>> {
    const user: IUser<IAddress> | null = await this.dbAccessService.getUser(data.id);

    if (!user) {
      throw new NotFoundException(`Cannot find user with _id ${data._id}`);
    }

    return {
      status: HttpStatus.OK,
      data: { user },
      errors: null,
    };
  }

  @AddressedErrorCatching()
  public async updateUser(data: UpdateUserDto): Promise<IResponse<{ user: IUser<IAddress> }>> {
    const user: IUser<IAddress> | null = await this.dbAccessService.updateUser(data);

    if (!user) {
      throw new NotFoundException(`Cannot find user with _id ${data._id} to update`);
    }

    return {
      status: HttpStatus.OK,
      data: { user },
      errors: null,
    };
  }

  @AddressedErrorCatching()
  public async deleteUser(data: DeleteUserDto): Promise<IResponse<ILogoutRes>> {
    const deleteUserResponse: ILogoutRes | null = await this.dbAccessService.deleteUser(data);

    return deleteUserResponse
      ? {
        status: HttpStatus.OK,
        data: deleteUserResponse,
        errors: null,
      }
      : {
        status: HttpStatus.NOT_FOUND,
        data: null,
        errors: [ `User with id ${data._id} not found` ],
      };
  }

  @AddressedErrorCatching()
  public async logout(data: LogoutDto): Promise<IResponse<null>> {
    const findRefreshTokenResult: IToken | null = await this.dbAccessService.findRefreshToken(data.refreshToken);

    if (!findRefreshTokenResult) {
      throw new BadRequestException('Cannot find such refresh token');
    }

    const decodedAccessToken = this.jwtService.decode(data.accessToken);

    if (!decodedAccessToken) {
      throw new BadRequestException('Cannot decode access token');
    }

    const updatedTokenResponse: IToken = await this.dbAccessService.updateToken(
      { refreshToken: data.refreshToken },
      {
        accessToken: data.accessToken,
        blacklisted: true,
      },
    );

    return {
      status: HttpStatus.OK,
      data: null,
      errors: null,
    };
  }
}
