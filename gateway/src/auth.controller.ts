import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';

import { config } from 'dotenv';
import { FastifyReply, FastifyRequest } from 'fastify';

import { SignInDto, SignUpDto } from './dto';
import { AuthService } from './services';
import { IReply, IResponse, ITokens, IUser } from './types';


config();

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {
  }

  @Post('sign-up')
  public async register(
    @Body() body: SignUpDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<IResponse<IUser<string>>> {
    const result = await this.authService.signUpAndSignIn(body);

    if (result.errors?.length) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        data: null,
        errors: result.errors,
      };
    }

    const { accessToken, refreshToken, expires } = result.data.tokens;

    this.authService.setCookies(res, accessToken, refreshToken, expires);

    return {
      status: HttpStatus.CREATED,
      data: result.data.user,
    };
  }

  @Post('sign-in')
  public async login(
    @Body() body: SignInDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<IResponse<IUser<string>>> {
    const result: IReply<{ user: IUser<string>; tokens: ITokens }> = await this.authService.signIn(body);

    if (result.errors?.length) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        data: null,
        errors: result.errors,
      };
    }

    const { accessToken, refreshToken, expires } = result.data.tokens;

    this.authService.setCookies(res, accessToken, refreshToken, expires);

    return {
      status: HttpStatus.OK,
      data: result.data.user,
    };
  }

  @Post('refresh')
  public async refresh(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<IResponse<null>> {
    const refreshToken = this.authService.getTokenFromRequest(req);
    const result: IReply<{ tokens: ITokens }> = await this.authService.refresh({ refreshToken });

    if (result.errors?.length) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        data: null,
        errors: result.errors,
      };
    }

    const { accessToken, refreshToken: newRefreshToken, expires } = result.data.tokens;

    this.authService.setCookies(res, accessToken, newRefreshToken, expires);

    return {
      status: HttpStatus.OK,
      data: null,
    };
  }

  @Post('logout')
  public async logout(
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<IResponse<null>> {
    this.authService.setCookies(res, '', '', new Date(0).getTime());

    return {
      status: HttpStatus.OK,
      data: null,
    };
  }
}
