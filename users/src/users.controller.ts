import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { USERS_EVENTS } from './constants';
import {
  DeleteUserDto,
  GetUserDto,
  LogoutDto,
  ReissueTokensBodyDto,
  SignInBodyDto,
  SignUpDto,
  UpdateUserDto,
  VerifyAccessTokenDto,
} from './dto';
import { UsersService } from './services';
import { IResponse, IUser } from './types';
import { IIssueTokensRes, ILogoutRes, ISignInRes, IVerifyTokenRes } from './types';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(USERS_EVENTS.USER_CREATE_USER)
  public async signUp(user: SignUpDto): Promise<IResponse<{ user: IUser }>> {
    return await this.usersService.signUp(user);
  }

  @MessagePattern(USERS_EVENTS.USER_ISSUE_TOKENS)
  public async signIn(user: SignInBodyDto): Promise<IResponse<ISignInRes>> {
    return await this.usersService.signIn(user);
  }

  @MessagePattern(USERS_EVENTS.USER_VERIFY_ACCESS_TOKEN)
  public async verifyAccessToken(data: VerifyAccessTokenDto): Promise<IResponse<IVerifyTokenRes>> {
    return await this.usersService.verifyAccessToken(data);
  }

  @MessagePattern(USERS_EVENTS.USER_GET_USER)
  public async getUser(data: GetUserDto): Promise<IResponse<{ user: IUser<string> }>> {
    return await this.usersService.getUser(data);
  }

  @MessagePattern(USERS_EVENTS.USER_UPDATE_USER)
  public async updateUser(data: UpdateUserDto): Promise<IResponse<{ user: IUser<string> }>> {
    return await this.usersService.updateUser(data);
  }

  @MessagePattern(USERS_EVENTS.USER_DELETE_USER)
  public async deleteUser(data: DeleteUserDto): Promise<IResponse<ILogoutRes>> {
    return await this.usersService.deleteUser(data);
  }

  @MessagePattern(USERS_EVENTS.USER_REISSUE_TOKENS)
  public async reissueTokens(data: ReissueTokensBodyDto): Promise<IResponse<IIssueTokensRes>> {
    return await this.usersService.reissueTokens(data);
  }

  @MessagePattern(USERS_EVENTS.USER_LOGOUT)
  public async logout(data: LogoutDto): Promise<IResponse<null>> {
    return await this.usersService.logout(data);
  }
}
