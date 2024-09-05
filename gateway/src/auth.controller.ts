import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { config } from 'dotenv';
import { FastifyReply } from 'fastify';

import { SignInDto, SignUpDto } from './dto';
import { AuthService } from './services';
import { IReply, IResponse, ITokens, IUser } from './types';


config();

@Controller('auth')
export class AuthController {
  private prodModeEnabled = this.configService.get('MODE') === 'prod';

  constructor(
    private readonly configService: ConfigService,
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

    const { accessToken, refreshToken } = result.data.tokens;

    res.setCookie('accessToken', accessToken, {
      httpOnly: true,
      path: '/',
      secure: this.prodModeEnabled,
      sameSite: 'lax',
    });

    res.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      path: '/',
      secure: this.prodModeEnabled,
      sameSite: 'lax',
    });

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

    const { accessToken, refreshToken } = result.data.tokens;

    res.setCookie('accessToken', accessToken, {
      httpOnly: true,
      path: '/',
      secure: this.prodModeEnabled,
      sameSite: 'lax',
    });

    res.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      path: '/',
      secure: this.prodModeEnabled,
      sameSite: 'lax',
    });

    return {
      status: HttpStatus.OK,
      data: result.data.user,
    };
  }
}
