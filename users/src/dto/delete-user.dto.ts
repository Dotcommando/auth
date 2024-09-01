import { PickType } from '@nestjs/mapped-types';

import { UserDto } from './user.dto';


export class DeleteUserDto extends PickType(UserDto, [ 'id' ] as const) {}
