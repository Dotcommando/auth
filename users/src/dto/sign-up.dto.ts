import { IntersectionType, PickType } from '@nestjs/swagger';

import { PartialUserDto, UserDto } from './user.dto';


export class SignUpDto extends IntersectionType(
  PickType(UserDto, [ 'firstName', 'lastName', 'email', 'password' ]),
  PickType(PartialUserDto, [ 'middleName', 'username' ]),
) {}
