import { Controller, Get, HttpStatus, Param, Req, UseGuards } from '@nestjs/common';

import { config } from 'dotenv';
import { FastifyReply } from 'fastify';

import { ROLE } from './constants';
import { Roles } from './decorators';
import { GetOneUserDto } from './dto';
import { AuthenticationGuard, UserAccessGuard } from './guards';
import { IResponse, User } from './types';


config();

@Controller('users')
export class UsersController {
  @Roles(ROLE.USER)
  @UseGuards(AuthenticationGuard, UserAccessGuard)
  @Get('/one/:id')
  public async getUser(
    @Param() param: GetOneUserDto,
    @Req() req: FastifyReply & { user: User | null },
  ): Promise<IResponse<{ user: User }>> {
    return {
      status: HttpStatus.OK,
      data: req.user
        ? {
          user: req.user,
        }
        : null,
    };
  }
}
