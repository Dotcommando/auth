import { IntersectionType, PickType } from '@nestjs/swagger';

import { PartialUserDto, UserDto } from './user.dto';



export class SignInBodyDto extends IntersectionType(
  PickType(UserDto, [ 'password' ]),
  PickType(PartialUserDto, [ 'email', 'username' ]),
) {}
