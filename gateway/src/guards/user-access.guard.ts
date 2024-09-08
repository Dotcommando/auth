import { CanActivate, ExecutionContext, ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';

import { FastifyRequest } from 'fastify';

import { ROLE } from '../constants';


@Injectable()
export class UserAccessGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const user = request['user'];
    const { id } = request.params as { id: string };

    if (!user) {
      throw new ForbiddenException({
        status: HttpStatus.FORBIDDEN,
        message: 'Access denied. You must be authenticated to access this resource.',
      });
    }

    if (user.id === id || user.role === ROLE.ADMIN || user.role === ROLE.SUPERADMIN) {
      return true;
    }

    throw new ForbiddenException({
      status: HttpStatus.FORBIDDEN,
      message: 'Access denied. You are not allowed to access this resource.',
    });
  }
}
