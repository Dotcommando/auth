import { ExecutionContext, Injectable } from '@nestjs/common';

import { BEARER_PREFIX } from '../constants';
import { AuthService } from '../services';
import { IReply, User } from '../types';


@Injectable()
/**
 * When authentication is nice to have.
 */
export class OptionalAuthenticationGuard {
  constructor(
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = request.headers['authorization']?.replace(BEARER_PREFIX, '');

    if (accessToken) {
      try {
        const authResult: IReply<{ valid: boolean; user?: User }> = await this.authService
          .authenticate({ accessToken });

        if (authResult?.data?.valid && authResult.data.user) {
          request['user'] = authResult.data.user;
        }
      } catch (error) {
        request['user'] = null;
      }
    }

    return true;
  }
}
