import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLE, ROLES_METADATA } from '../constants';


@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<ROLE[]>(ROLES_METADATA, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length || requiredRoles.includes(ROLE.GUEST)) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    try {
      return requiredRoles.includes(user.role);
    } catch (e) {
      return false;
    }
  }
}
