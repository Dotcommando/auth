import { SetMetadata } from '@nestjs/common';

import { ROLE, ROLES_METADATA } from '../constants';


export const Roles = (...roles: ROLE[]) => SetMetadata(ROLES_METADATA, roles);
